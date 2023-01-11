const functionHelper = require("./parsers/functionHelper");
const procedureHelper = require("./parsers/procedureHelper");

const parseDatabaseStatement = (statement) => {
	const characterSetRegExp = /CHARACTER\s+SET(?:\s*=\s*|\s+)(.+?)\ /i;
	const collationRegExp = /COLLATE(?:\s*=\s*|\s+)?(.+?)\ /i;
	const encryptionRegExp = /ENCRYPTION(?:\s*=\s*|\s+)(yes|no)\ /i;
	const data = {};

	if (characterSetRegExp.test(statement)) {
		data.characterSet = statement.match(characterSetRegExp)[1];
	}

	if (collationRegExp.test(statement)) {
		data.collation = statement.match(collationRegExp)[1];
	}

	if (encryptionRegExp.test(statement)) {
		data.ENCRYPTION = String(statement.match(collationRegExp)[1]).toLocaleLowerCase() === 'yes' ? 'Yes' : 'No';
	}

	return data;
};

const parseFunctions = (functions, logger) => {
	return functions.map(f => {

		const query = f.data[0]['Create Function'];

		try {
			const func = functionHelper.parseFunctionQuery(String(query));

			return {
				name: f.meta['Name'],
				functionDelimiter: (func.body || '').includes(';') ? '$$' : '',
				functionDefiner: func.definer,
				functionIfNotExist: func.ifNotExists,
				functionArguments: func.parameters,
				functionReturnType: func.returnType,
				functionBody: func.body,
				functionLanguage: 'SQL',
				functionDeterministic: functionHelper.getDeterministic(func.characteristics),
				functionContains: functionHelper.getContains(func.characteristics),
				functionSqlSecurity: f.meta['Security_type'],
				functionDescription: f.meta['Comment'],
			};
		} catch (error) {
			logger.error({
				message: error.message + '.\nError parsing function: ' + query +
					'.\nMake sure you have access to read function body: show create function `' + f.meta.Db + '`.`' + f.meta.Name + '`',
				stack: error.stack,
				meta: {
					db: f.meta.Db,
					name: f.meta.Name,
					securityType: f.meta.Security_type,
					definer: f.meta.Definer,
				},
			});
		}
	}).filter(Boolean);
};

const parseProcedures = (procedures, logger) => {
	return procedures.map(procedure => {
		try {
			const meta = procedure.meta;
			const procValue = procedure.data[0]['Create Procedure'];
			const data = procedureHelper.parseProcedure(String(procValue || ''));
			
			return {
				name: meta['Name'],
				delimiter: (data.body || '').includes(';') ? '$$' : '',
				definer: data.definer,
				inputArgs: data.parameters,
				body: data.body,
				language: 'SQL',
				deterministic: functionHelper.getDeterministic(data.characteristics),
				contains: functionHelper.getContains(data.characteristics),
				securityMode: meta['Security_type'],
				comments: meta['Comment']
			};
		} catch (error) {
			logger.error({
				message: error.message + '.\nError parsing procedure: ' + procedure.data[0]['Create Procedure'] +
					'.\nMake sure you have access to read procedure body: show create procedure `' + procedure.meta.Db + '`.`' + procedure.meta.Name + '`',
				stack: error.stack,
				meta: {
					db: procedure.meta.Db,
					name: procedure.meta.Name,
					securityType: procedure.meta.Security_type,
					definer: procedure.meta.Definer,
				},
			});
		}
	}).filter(Boolean);
};

const isJson = (columnName, constraints) => {
	return constraints.some(constraint => {
		const check = constraint['CHECK_CLAUSE'];

		if (!/json_valid/i.test(check)) {
			return false;
		}

		return check.includes(`\`${columnName}\``);
	});
};

const findJsonRecord = (fieldName, records) => {
	return records.find(records => {
		if (records[fieldName] && typeof records[fieldName] === 'object') {
			return records[fieldName];
		}

		if (typeof records[fieldName] === 'string') {
			return false;
		}

		try {
			return JSON.parse(records[fieldName]);
		} catch (e) {
			return false;
		}
	});
};

const getSubtype = (fieldName, record) => {
	if (Array.isArray(record[fieldName])) {
		return 'array';
	}

	if (record[fieldName] && typeof record[fieldName] === 'object') {
		return 'object';
	}

	const item = JSON.parse(record[fieldName]);
 
	if (!item) {
		return ' ';
	}

	if (Array.isArray(item)) {
		return 'array';
	}

	if (typeof item === 'object') {
		return 'object';
	}

	return ' ';
};

const addKeyOptions = (jsonSchema, indexes) => {
	const primaryIndexes = indexes.filter(index => getIndexType(index) === 'PRIMARY');
	const uniqueIndexes = indexes.filter(index => getIndexType(index) === 'UNIQUE');
	const { single } = uniqueIndexes.reduce(({single, composite, hash}, index) => {
		const indexName = index['Key_name'];
		if (!hash[indexName]) {
			hash[indexName] = true;

			return {
				single: single.concat(index),
				composite,
				hash,
			};
		} else {
			return {
				single: single.filter(index => index['Key_name'] !== indexName),
				composite: composite.concat(index),
				hash,
			};
		}
	}, {composite: [], single: [], hash: {}});

	jsonSchema = single.reduce((jsonSchema, index) => {
		const columnName = index['Column_name'];
		const uniqueKeyOptions = getIndexData(index);

		return {
			...jsonSchema,
			properties: {
				...jsonSchema.properties,
				[columnName]: {
					...(jsonSchema.properties[columnName] || {}),
					uniqueKeyOptions: [
						...((jsonSchema.properties[columnName] || {}).uniqueKeyOptions || []),
						uniqueKeyOptions,
					],
				}
			}
		};
	}, jsonSchema);

	if (primaryIndexes.length === 1) {
		const primaryIndex = primaryIndexes[0];
		const columnName = primaryIndex['Column_name'];
		const { constraintName, ...primaryKeyOptions } = getIndexData(primaryIndex);

		jsonSchema = {
			...jsonSchema,
			properties: {
				...jsonSchema.properties,
				[columnName]: {
					...(jsonSchema.properties[columnName] || {}),
					primaryKeyOptions,
				}
			}
		};
	}

	return jsonSchema;
};

const getIndexData = (index) => {
	return {
		constraintName: index['Key_name'],
		indexCategory: getIndexCategory(index),
		indexComment: index['Index_comment'],
		indexOrder: getIndexOrder(index['Collation']),
		indexIgnore: index['Ignored'] === 'YES'
	};
};

const getJsonSchema = ({ columns, records, indexes }) => {
	const properties = columns.filter((column) => {
		return column['Type'] === 'longtext' || column['Type'] === 'json';
	}).reduce((schema, column) => {
		const fieldName = column['Field'];
		const record = findJsonRecord(fieldName, records);
		const subtype = record ? getSubtype(fieldName, record) : ' ';

		if (column['Type'] === 'json') {
			return {
				...schema,
				[fieldName]: {
					type: 'json',
					subtype,
				}
			};
		}

		if (subtype === ' ') {
			return schema;
		}

		return {
			...schema,
			[fieldName]: {
				type: 'char',
				mode: 'longtext',
				subtype,
			}
		};
	}, {});

	return addKeyOptions({
		properties,
	}, indexes);
};

const getIndexOrder = (collation) => {
	if (collation === 'A') {
		return 'ASC';
	} else if (collation === 'D') {
		return 'DESC';
	} else {
		return null;
	}
};

const getIndexType = (index) => {
	if (index['Key_name'] === 'PRIMARY') {
		return 'PRIMARY';
	} else if (index['Index_type'] === 'FULLTEXT') {
		return 'FULLTEXT';
	} else if (index['Index_type'] === 'SPATIAL') {
		return 'SPATIAL';
	} else if (Number(index['Non_unique']) === 0) {
		return 'UNIQUE';
	} else if (index['Index_type'] === 'KEY') {
		return 'KEY';
	} else {
		return '';
	}
};

const getIndexCategory = (index) => {
	if (index['Index_type'] === 'BTREE') {
		return 'BTREE';
	} else if (index['Index_type'] === 'HASH') {
		return 'HASH';
	} else if (index['Index_type'] === 'RTREE') {
		return 'RTREE';
	} else {
		return '';
	}
};

const parseIndexExpression = (expression) => {
	const jsonColumnRegExp = /json_extract\(`(?<columnName>[\s\S]+?)`,[\s\S]+\'\$(?<jsonPath>[\w\d\.]+)/i;
	const parseData = expression.match(jsonColumnRegExp);

	if (!parseData) {
		return;
	}

	return parseData.groups.columnName + parseData.groups.jsonPath;
};

const parseIndexes = (indexes) => {
	const indexesByConstraint = indexes.filter(index => !['PRIMARY', 'UNIQUE'].includes(getIndexType(index))).reduce((result, index) => {
		const constraintName = index['Key_name'];
		let columnName = index['Column_name'];
		if (!columnName && index['Expression']) {
			columnName = parseIndexExpression(index['Expression']);
		}

		if (result[constraintName]) {
			const indexData = {
				...result[constraintName],
				indxKey: result[constraintName].indxKey.concat({
					name: columnName,
					type: getIndexOrder(index['Collation']),
				}),
			};

			if (indexData.indxExpression && indexData.indxExpression.length) {
				indexData.indxExpression = [
					...indexData.indxExpression,
					{ value: prepareIndexExpression(index['Expression']) || columnName },
				];
			} else if (index['Sub_part'] && indexData.indexType !== 'SPATIAL') {
				indexData.indxExpression = [
					...(indexData.indxExpression || []),
					{ value: `${columnName}(${index.Sub_part})` },
				];
			}

			return {
				...result,
				[constraintName]: indexData,
			};
		}

		const indexData = {
			indxName: constraintName,
			indexType: getIndexType(index),
			indexCategory: getIndexCategory(index),
			indexComment: index['Index_comment'],
			indxKey: [{
				name: columnName,
				type: getIndexOrder(index['Collation']),
			}],
		};

		if (index['Expression']) {
			indexData.indxExpression = [{ value: prepareIndexExpression(index['Expression']) }];
		} else if (index['Sub_part'] && indexData.indexType !== 'SPATIAL') {
			indexData.indxExpression = [{ value: `${columnName}(${index['Sub_part']})` }];
		}

		return {
			...result,
			[constraintName]: indexData,
		};
	}, {});

	return Object.values(indexesByConstraint);
};

const prepareIndexExpression = (indexExpression) => {
	if (typeof indexExpression !== 'string') {
		return '';
	}

	return '(' + indexExpression.replace(/\\'/g, '\'') + ')';
};

const getTablespaces = ({ innoDb, ndb }) => {
	const innDbTableSpaces = (innoDb || []).map((data) => {
		return {
			name: data['NAME'],
			DATAFILE: data['PATH'],
			UNDO: data['SPACE_TYPE'] === 'Undo',
			AUTOEXTEND_SIZE: data['AUTOEXTEND_SIZE'] || '', 
			ENGINE: 'InnoDB',
			FILE_BLOCK_SIZE: data['FS_BLOCK_SIZE'],
			ENCRYPTION: data['ENCRYPTION'] === 'Y' ? 'Yes' : '',
		};
	});
	const ndbTablespaces = (ndb || []).map((data) => {
		return {
			name: data['TABLESPACE_NAME'],
			DATAFILE: data['FILE_NAME'],
			AUTOEXTEND_SIZE: data['AUTOEXTEND_SIZE'] || '', 
			ENGINE: 'NDB',
			LOGFILE_GROUP: data['LOGFILE_GROUP_NAME'],
			EXTENT_SIZE: data['EXTENT_SIZE'] + '',
			INITIAL_SIZE: data['INITIAL_SIZE'] + '',
		};
	});

	return [
		...innDbTableSpaces,
		...ndbTablespaces,
	];
};

module.exports = {
	parseDatabaseStatement,
	parseFunctions,
	parseProcedures,
	getJsonSchema,
	parseIndexes,
	getTablespaces,
};
