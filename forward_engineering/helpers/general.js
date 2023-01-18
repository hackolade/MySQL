module.exports = (_, wrap) => {
	const OPTION_KEYWORDS = {
		ENGINE: 'ENGINE',
		AUTO_INCREMENT: 'AUTO_INCREMENT',
		AVG_ROW_LENGTH: 'AVG_ROW_LENGTH',
		CHECKSUM: 'CHECKSUM',
		DATA_DIRECTORY: 'DATA DIRECTORY',
		DELAY_KEY_WRITE: 'DELAY_KEY_WRITE',
		INDEX_DIRECTORY: 'INDEX DIRECTORY',
		ENCRYPTED: 'ENCRYPTED',
		ENCRYPTION_KEY_ID: 'ENCRYPTION_KEY_ID',
		IETF_QUOTES: 'IETF_QUOTES',
		INSERT_METHOD: 'INSERT_METHOD',
		UNION: 'UNION',
		KEY_BLOCK_SIZE: 'KEY_BLOCK_SIZE',
		MIN_ROWS: 'MIN_ROWS',
		MAX_ROWS: 'MAX_ROWS',
		PACK_KEYS: 'PACK_KEYS',
		PAGE_CHECKSUM: 'PAGE_CHECKSUM',
		PAGE_COMPRESSED: 'PAGE_COMPRESSED',
		PAGE_COMPRESSION_LEVEL: 'PAGE_COMPRESSION_LEVEL',
		ROW_FORMAT: 'ROW_FORMAT',
		SEQUENCE: 'SEQUENCE',
		STATS_AUTO_RECALC: 'STATS_AUTO_RECALC',
		STATS_PERSISTENT: 'STATS_PERSISTENT',
		TRANSACTIONAL: 'TRANSACTIONAL',
		compression: 'COMPRESSION',
		STATS_SAMPLE_PAGES: 'STATS_SAMPLE_PAGES',
		ENCRYPTION: 'ENCRYPTION',
		AUTOEXTEND_SIZE: 'AUTOEXTEND_SIZE',
		CONNECTION: 'CONNECTION',
	};

	const OPTIONS_BY_ENGINE = {
		MyISAM: [
			'AUTO_INCREMENT',
			'AVG_ROW_LENGTH',
			'CHECKSUM',
			'DATA_DIRECTORY',
			'DELAY_KEY_WRITE',
			'INDEX_DIRECTORY',
			'KEY_BLOCK_SIZE',
			'PACK_KEYS',
			'ROW_FORMAT',
		],
		InnoDB: [
			'AUTO_INCREMENT',
			'DATA_DIRECTORY',
			'INDEX_DIRECTORY',
			'ENCRYPTION',
			'AUTOEXTEND_SIZE',
			'ROW_FORMAT',
			'compression',
			'STATS_AUTO_RECALC',
			'STATS_PERSISTENT',
			'STATS_SAMPLE_PAGES',
			'KEY_BLOCK_SIZE',
		],
		CSV: ['KEY_BLOCK_SIZE'],
		MERGE: ['INSERT_METHOD', 'UNION', 'KEY_BLOCK_SIZE'],
		Memory: ['AUTO_INCREMENT', 'KEY_BLOCK_SIZE', 'MIN_ROWS', 'MAX_ROWS'],
		Archive: ['AUTO_INCREMENT', 'KEY_BLOCK_SIZE'],
		Federated: ['CONNECTION', 'KEY_BLOCK_SIZE'],
		EXAMPLE: [],
		HEAP: ['AUTO_INCREMENT', 'KEY_BLOCK_SIZE', 'MIN_ROWS', 'MAX_ROWS'],
		NDB: ['KEY_BLOCK_SIZE'],
	};

	const getTableName = (tableName, schemaName) => {
		if (schemaName) {
			return `\`${schemaName}\`.\`${tableName}\``;
		} else {
			return `\`${tableName}\``;
		}
	};

	const getOptionValue = (keyword, value) => {
		if (['ROW_FORMAT', 'INSERT_METHOD'].includes(keyword)) {
			if (value) {
				return _.toUpper(value);
			} else {
				return;
			}
		}

		if (keyword === 'UNION') {
			return value;
		}

		if (['YES', 'NO', 'DEFAULT'].includes(_.toUpper(value))) {
			return ({
				YES: '\'Y\'',
				NO: '\'N\'',
			})[_.toUpper(value)] || _.toUpper(value);
		}
		if (typeof value === 'number') {
			return value;
		} else if (!isNaN(+value) && value) {
			return +value;
		} else if (typeof value === 'string' && value) {
			return wrap(value);
		} else if (typeof value === 'boolean') {
			return value ? '\'Y\'' : '\'N\'';
		}
	};

	const encodeStringLiteral = (str = '') => {
		return str.replace(/(?<!\\)('|"|`)/gi, '\\$1').replace(/\n/gi, '\\n');
	}

	const getTableOptions = (options = {}) => {
		const tableOptions = [];
		const engine = options.ENGINE;

		if (!options.defaultCharSet) {
			if (options.characterSet) {
				tableOptions.push(`CHARSET=${options.characterSet}`);
			}
			if (options.collation) {
				tableOptions.push(`COLLATE=${options.collation}`);
			}
		}

		if (engine) {
			tableOptions.push(`ENGINE = ${engine}`);
		}

		if (options.description) {
			tableOptions.push(`COMMENT = '${encodeStringLiteral(options.description)}'`);
		}

		const optionKeywords = OPTIONS_BY_ENGINE[engine] || ['KEY_BLOCK_SIZE'];

		optionKeywords.forEach(keyword => {
			const value = getOptionValue(keyword, options[keyword]);

			if (value === undefined) {
				return;
			}

			const option = `${OPTION_KEYWORDS[keyword]} = ${value}`;

			tableOptions.push(option);
		});

		if (['InnoDB', 'NDB'].includes(engine)) {
			let tableSpaceOption = '';

			if (options.TABLESPACE) {
				tableSpaceOption = `TABLESPACE ${options.TABLESPACE}`;
			}

			if (engine === 'NDB' && options.STORAGE) {
				tableSpaceOption += ` STORAGE ${options.STORAGE}`;
			}

			if (tableSpaceOption) {
				tableOptions.push(tableSpaceOption.trim());
			}
		}

		if (!tableOptions.length) {
			return '';
		}

		return ' ' + tableOptions.join(',\n\t');
	};

	const addLinear = linear => (linear ? 'LINEAR ' : '');

	const getPartitionBy = partitioning => {
		let expression =` (${_.trim(partitioning.partitioning_expression)})`;
		let algorithm = '';

		if (['RANGE', 'LIST'].includes(partitioning.partitionType) && partitioning.partitioning_columns) {
			expression = ` COLUMNS(${_.trim(partitioning.partitioning_columns)})`;
		}

		if (partitioning.partitionType === 'KEY' && partitioning.ALGORITHM) {
			algorithm = ` ALGORITHM ${partitioning.ALGORITHM}`;
		}

		return `${addLinear(partitioning.LINEAR)}${partitioning.partitionType}${algorithm}${expression}`;
	};

	const getSubPartitionBy = partitioning => {
		if (!partitioning.subpartitionType) {
			return '';
		}
		let algorithm = '';

		if (partitioning.subpartitionType === 'KEY' && partitioning.SUBALGORITHM) {
			algorithm = ` ALGORITHM ${partitioning.SUBALGORITHM} `;
		}

		return `SUBPARTITION BY ${addLinear(partitioning.SUBLINEAR)}${partitioning.subpartitionType}${algorithm}(${_.trim(
			partitioning.subpartitioning_expression,
		)})`;
	};

	const getPartitionDefinitions = partitioning => {
		if (!Array.isArray(partitioning.partition_definitions)) {
			return '';
		}

		const partitions = partitioning.partition_definitions
			.filter(({ partitionDefinition }) => partitionDefinition)
			.map(partitionDefinition => {
				const subPartitionDefinitions = partitionDefinition.subpartitionDefinition;

				if (subPartitionDefinitions) {
					return partitionDefinition.partitionDefinition + ' ' + wrap(subPartitionDefinitions, '(', ')');
				} else {
					return partitionDefinition.partitionDefinition;
				}
			})
			.join(',\n\t\t');

		if (!partitions) {
			return '';
		}

		return wrap('\n\t\t' + partitions + '\n\t', '(', ')');
	};

	const getPartitions = (partitioning = {}) => {
		if (!partitioning.partitionType) {
			return '';
		}

		const partitionBy = `PARTITION BY ${getPartitionBy(partitioning)}`;
		const partitions = partitioning.partitions ? `PARTITIONS ${partitioning.partitions}` : '';
		const subPartitionBy = getSubPartitionBy(partitioning);
		const subPartitions = partitioning.subpartitions ? `SUBPARTITIONS ${partitioning.subpartitions}` : '';
		const partitionDefinitions = getPartitionDefinitions(partitioning);

		const result = [partitionBy, partitions, subPartitionBy, subPartitions, partitionDefinitions].filter(Boolean);

		if (!result.length) {
			return '';
		}

		return '\n\t' + result.join('\n\t');
	};

	const getKeyWithAlias = key => {
		if (!key) {
			return '';
		}

		if (key.alias) {
			return `\`${key.name}\` as \`${key.alias}\``;
		} else {
			return `\`${key.name}\``;
		}
	};

	const getViewData = (keys, dbName = '') => {
		if (!Array.isArray(keys)) {
			return { tables: [], columns: [] };
		}

		return keys.reduce(
			(result, key) => {
				if (!key.tableName) {
					result.columns.push(getKeyWithAlias(key));

					return result;
				}

				let tableName = `\`${dbName}\`.\`${key.tableName}\``;

				if (!result.tables.includes(tableName)) {
					result.tables.push(tableName);
				}

				result.columns.push({
					statement: `${tableName}.${getKeyWithAlias(key)}`,
					isActivated: key.isActivated,
				});

				return result;
			},
			{
				tables: [],
				columns: [],
			},
		);
	};

	const getCharacteristics = udfCharacteristics => {
		const characteristics = [];

		if (udfCharacteristics.language) {
			characteristics.push('LANGUAGE SQL');
		}

		if (udfCharacteristics.deterministic) {
			characteristics.push(udfCharacteristics.deterministic);
		}

		if (udfCharacteristics.contains) {
			characteristics.push(udfCharacteristics.contains);
		}

		if (udfCharacteristics.sqlSecurity) {
			characteristics.push(`SQL SECURITY ${udfCharacteristics.sqlSecurity}`);
		}

		if (udfCharacteristics.comment) {
			characteristics.push(`COMMENT ${wrap(escapeQuotes(udfCharacteristics.comment))}`);
		}

		return characteristics;
	};

	const escapeQuotes = (str = '') => {
		return str.replace(/(')/gi, "'$1").replace(/\n/gi, '\\n');
	};

	return {
		getTableName,
		getTableOptions,
		getPartitions,
		getViewData,
		getCharacteristics,
		escapeQuotes,
	};
};
