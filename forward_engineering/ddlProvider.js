const defaultTypes = require('./configs/defaultTypes');
const types = require('./configs/types');
const templates = require('./configs/templates');

module.exports = (baseProvider, options, app) => {
	const _ = app.require('lodash');
	const {
		tab,
		commentIfDeactivated,
		checkAllKeysDeactivated,
		divideIntoActivatedAndDeactivated,
		hasType,
		wrap,
		clean,
	} = app.require('@hackolade/ddl-fe-utils').general;
	const { assignTemplates, compareGroupItems } = app.require('@hackolade/ddl-fe-utils');
	const { decorateDefault, decorateType, canBeNational, getSign, createGeneratedColumn } = require('./helpers/columnDefinitionHelper')(
		_,
		wrap,
	);
	const { getTableName, getTableOptions, getPartitions, getViewData, getCharacteristics, escapeQuotes } =
		require('./helpers/general')(_, wrap);
	const { generateConstraintsString, foreignKeysToString, foreignActiveKeysToString, createKeyConstraint } =
		require('./helpers/constraintsHelper')({
			_,
			commentIfDeactivated,
			checkAllKeysDeactivated,
			divideIntoActivatedAndDeactivated,
			assignTemplates,
			escapeQuotes,
		});
	const keyHelper = require('./helpers/keyHelper')(_, clean);
	const { processIndexKeyName } = require('./helpers/indexHelper')(wrap);

	return {
		createDatabase({
			databaseName,
			ifNotExist,
			collation,
			characterSet,
			encryption,
			udfs,
			procedures,
			useDb = true,
		}) {
			let dbOptions = '';
			dbOptions += characterSet ? tab(`\nCHARACTER SET = '${characterSet}'`) : '';
			dbOptions += collation ? tab(`\nCOLLATE = '${collation}'`) : '';
			dbOptions += encryption ? tab(`\nENCRYPTION = 'Y'`) : '';

			const databaseStatement = assignTemplates(templates.createDatabase, {
				name: databaseName,
				ifNotExist: ifNotExist ? ' IF NOT EXISTS' : '',
				dbOptions: dbOptions,
				useDb: useDb ? `USE \`${databaseName}\`;\n` : '',
			});
			const udfStatements = udfs.map(udf => this.createUdf(databaseName, udf));
			const procStatements = procedures.map(procedure => this.createProcedure(databaseName, procedure));

			return [databaseStatement, ...udfStatements, ...procStatements].join('\n');
		},

		createTable(
			{
				name,
				columns,
				dbData,
				temporary,
				ifNotExist,
				likeTableName,
				selectStatement,
				options,
				partitioning,
				checkConstraints,
				foreignKeyConstraints,
				keyConstraints,
				selectIgnore,
				selectReplace,
			},
			isActivated,
		) {
			const tableName = getTableName(name, dbData.databaseName);
			const temporaryTable = temporary ? 'TEMPORARY ' : '';
			const ifNotExistTable = ifNotExist ? 'IF NOT EXISTS ' : '';

			if (likeTableName) {
				return commentIfDeactivated(assignTemplates(templates.createLikeTable, {
					name: tableName,
					likeTableName: getTableName(likeTableName, dbData.databaseName),
					temporary: temporaryTable,
					ifNotExist: ifNotExistTable,
				}), { isActivated });
			}

			const dividedKeysConstraints = divideIntoActivatedAndDeactivated(
				keyConstraints.map(createKeyConstraint(templates, isActivated)),
				key => key.statement,
			);
			const keyConstraintsString = generateConstraintsString(dividedKeysConstraints, isActivated);

			const dividedForeignKeys = divideIntoActivatedAndDeactivated(foreignKeyConstraints, key => key.statement);
			const foreignKeyConstraintsString = generateConstraintsString(dividedForeignKeys, isActivated);
			const ignoreReplace = selectStatement ? selectIgnore ? ' IGNORE' : selectReplace ? ' REPLACE' : '' : '';

			const tableStatement = assignTemplates(templates.createTable, {
				name: tableName,
				column_definitions: columns.join(',\n\t'),
				selectStatement: selectStatement ? ` AS ${selectStatement}` : '',
				temporary: temporaryTable,
				ifNotExist: ifNotExistTable,
				options: getTableOptions(options),
				partitions: getPartitions(partitioning),
				checkConstraints: checkConstraints.length ? ',\n\t' + checkConstraints.join(',\n\t') : '',
				foreignKeyConstraints: foreignKeyConstraintsString,
				keyConstraints: keyConstraintsString,
				ignoreReplace,
			});

			return commentIfDeactivated(tableStatement, { isActivated });
		},

		convertColumnDefinition(columnDefinition) {
			const type = _.toUpper(columnDefinition.type);
			const notNull = columnDefinition.nullable ? '' : ' NOT NULL';
			const primaryKey = columnDefinition.primaryKey ? ' PRIMARY KEY' : '';
			const unique = columnDefinition.unique ? ' UNIQUE' : '';
			const zeroFill = columnDefinition.zerofill ? ' ZEROFILL' : '';
			const autoIncrement = columnDefinition.autoIncrement ? ' AUTO_INCREMENT' : '';
			const invisible = columnDefinition.invisible ? ' INVISIBLE' : '';
			const national = columnDefinition.national && canBeNational(type) ? 'NATIONAL ' : '';
			const comment = columnDefinition.comment ? ` COMMENT='${escapeQuotes(columnDefinition.comment)}'` : '';
			const charset = type !== 'JSON' && columnDefinition.charset ? ` CHARSET ${columnDefinition.charset}` : '';
			const collate =
				type !== 'JSON' && columnDefinition.charset && columnDefinition.collation
					? ` COLLATE ${columnDefinition.collation}`
					: '';
			const generatedDefaultValue = createGeneratedColumn(columnDefinition.generatedDefaultValue);
			const defaultValue = (!_.isUndefined(columnDefinition.default) && !generatedDefaultValue)
				? ' DEFAULT ' + decorateDefault(type, columnDefinition.default)
				: '';
			const compressed = columnDefinition.compressionMethod
				? ` COMPRESSED=${columnDefinition.compressionMethod}`
				: '';
			const signed = getSign(type, columnDefinition.signed);

			return commentIfDeactivated(
				assignTemplates(templates.columnDefinition, {
					name: columnDefinition.name,
					type: decorateType(type, columnDefinition),
					not_null: notNull,
					primary_key: primaryKey,
					unique_key: unique,
					default: defaultValue,
					generatedDefaultValue,
					autoIncrement,
					compressed,
					signed,
					zeroFill,
					invisible,
					comment,
					national,
					charset,
					collate,
				}),
				{
					isActivated: columnDefinition.isActivated,
				},
			);
		},

		createIndex(tableName, index, dbData, isParentActivated = true, jsonSchema) {
			if ((_.isEmpty(index.indxKey) && _.isEmpty(index.indxExpression)) || !index.indxName) {
				return '';
			}

			const allDeactivated = checkAllKeysDeactivated(index.indxKey || []);
			const wholeStatementCommented = index.isActivated === false || !isParentActivated || allDeactivated;
			const indexType = index.indexType ? `${_.toUpper(index.indexType)} ` : '';
			const name = wrap(index.indxName || '', '`', '`');
			const table = getTableName(tableName, dbData.databaseName);
			const indexCategory = index.indexCategory ? ` USING ${index.indexCategory}` : '';
			let indexOptions = [];

			const dividedKeys = divideIntoActivatedAndDeactivated(
				index.indxKey || [],
				key => processIndexKeyName({ name: key.name, type: key.type, jsonSchema }),
			);
			const commentedKeys = dividedKeys.deactivatedItems.length
				? commentIfDeactivated(dividedKeys.deactivatedItems.join(', '), {
						isActivated: wholeStatementCommented,
						isPartOfLine: true,
				  })
				: '';
			const expressionKeys = (index.indxExpression || []).map(item => item.value?.replace(/\\/g, '\\\\')).filter(Boolean);

			if (index.indxKeyBlockSize) {
				indexOptions.push(`KEY_BLOCK_SIZE = ${index.indxKeyBlockSize}`);
			}

			if (index.indexType === 'FULLTEXT' && index.indxParser) {
				indexOptions.push(`WITH PARSER ${index.indxParser}`);
			}

			if (index.indexComment) {
				indexOptions.push(`COMMENT '${escapeQuotes(index.indexComment)}'`);
			}

			if (index.indxVisibility) {
				indexOptions.push(index.indxVisibility);
			}

			if (index.indexLock) {
				indexOptions.push(`LOCK ${index.indexLock}`);
			} else if (index.indexAlgorithm) {
				indexOptions.push(`ALGORITHM ${index.indexAlgorithm}`);
			}

			const indexStatement = assignTemplates(templates.index, {
				keys: expressionKeys.length ? `${expressionKeys.join(', ')}` :
					dividedKeys.activatedItems.join(', ') +
					(wholeStatementCommented && commentedKeys && dividedKeys.activatedItems.length
						? ', ' + commentedKeys
						: commentedKeys),
				indexOptions: indexOptions.length ? '\n\t' + indexOptions.join('\n\t') : '',
				name,
				table,
				indexType,
				indexCategory,
			});

			if (wholeStatementCommented) {
				return commentIfDeactivated(indexStatement, { isActivated: false });
			} else {
				return indexStatement;
			}
		},

		createCheckConstraint(checkConstraint) {
			return assignTemplates(templates.checkConstraint, {
				name: checkConstraint.name ? `${wrap(checkConstraint.name, '`', '`')} ` : '',
				expression: _.trim(checkConstraint.expression).replace(/^\(([\s\S]*)\)$/, '$1'),
				enforcement: checkConstraint.enforcement ? ` ${checkConstraint.enforcement}` : '',
			});
		},

		createForeignKeyConstraint(
			{ name, foreignKey, primaryTable, primaryKey, primaryTableActivated, foreignTableActivated },
			dbData,
		) {
			const isAllPrimaryKeysDeactivated = checkAllKeysDeactivated(primaryKey);
			const isAllForeignKeysDeactivated = checkAllKeysDeactivated(foreignKey);
			const isActivated =
				!isAllPrimaryKeysDeactivated &&
				!isAllForeignKeysDeactivated &&
				primaryTableActivated &&
				foreignTableActivated;

			return {
				statement: assignTemplates(templates.createForeignKeyConstraint, {
					primaryTable: getTableName(primaryTable, dbData.databaseName),
					name,
					foreignKey: isActivated ? foreignKeysToString(foreignKey) : foreignActiveKeysToString(foreignKey),
					primaryKey: isActivated ? foreignKeysToString(primaryKey) : foreignActiveKeysToString(primaryKey),
				}),
				isActivated,
			};
		},

		createForeignKey(
			{ name, foreignTable, foreignKey, primaryTable, primaryKey, primaryTableActivated, foreignTableActivated },
			dbData,
		) {
			const isAllPrimaryKeysDeactivated = checkAllKeysDeactivated(primaryKey);
			const isAllForeignKeysDeactivated = checkAllKeysDeactivated(foreignKey);

			return {
				statement: assignTemplates(templates.createForeignKey, {
					primaryTable: getTableName(primaryTable, dbData.databaseName),
					foreignTable: getTableName(foreignTable, dbData.databaseName),
					name,
					foreignKey: foreignKeysToString(foreignKey),
					primaryKey: foreignKeysToString(primaryKey),
				}),
				isActivated:
					!isAllPrimaryKeysDeactivated &&
					!isAllForeignKeysDeactivated &&
					primaryTableActivated &&
					foreignTableActivated,
			};
		},

		createView(viewData, dbData, isActivated) {
			const { deactivatedWholeStatement, selectStatement } = this.viewSelectStatement(viewData, isActivated);

			const algorithm =
				viewData.algorithm && viewData.algorithm !== 'UNDEFINED' ? `ALGORITHM ${viewData.algorithm} ` : '';

			return commentIfDeactivated(
				assignTemplates(templates.createView, {
					name: getTableName(viewData.name, dbData.databaseName),
					orReplace: viewData.orReplace ? 'OR REPLACE ' : '',
					ifNotExist: viewData.ifNotExist ? 'IF NOT EXISTS ' : '',
					sqlSecurity: viewData.sqlSecurity ? `SQL SECURITY ${viewData.sqlSecurity} ` : '',
					checkOption: viewData.checkOption ? `\nWITH ${viewData.checkOption} CHECK OPTION` : '',
					selectStatement,
					algorithm,
				}),
				{ isActivated: !deactivatedWholeStatement },
			);
		},

		createViewIndex(viewName, index, dbData, isParentActivated) {
			return '';
		},

		createUdt(udt, dbData) {
			return '';
		},

		getDefaultType(type) {
			return defaultTypes[type];
		},

		getTypesDescriptors() {
			return types;
		},

		hasType(type) {
			return hasType(types, type);
		},

		hydrateColumn({ columnDefinition, jsonSchema, dbData }) {
			return {
				name: columnDefinition.name,
				type: columnDefinition.type,
				primaryKey: keyHelper.isInlinePrimaryKey(jsonSchema),
				unique: keyHelper.isInlineUnique(jsonSchema),
				nullable: columnDefinition.nullable,
				default: columnDefinition.default,
				comment: columnDefinition.description || jsonSchema.refDescription || jsonSchema.description,
				isActivated: columnDefinition.isActivated,
				length: columnDefinition.enum,
				scale: columnDefinition.scale,
				precision: columnDefinition.precision,
				length: columnDefinition.length,
				national: jsonSchema.national,
				autoIncrement: jsonSchema.autoincrement,
				zerofill: jsonSchema.zerofill,
				invisible: jsonSchema.invisible,
				compressionMethod: jsonSchema.compressed ? jsonSchema.compression_method : '',
				enum: jsonSchema.enum,
				synonym: jsonSchema.synonym,
				signed: jsonSchema.zerofill || jsonSchema.signed,
				microSecPrecision: jsonSchema.microSecPrecision,
				charset: jsonSchema.characterSet,
				collation: jsonSchema.collation,
				generatedDefaultValue: jsonSchema.generatedDefaultValue,
			};
		},

		hydrateIndex(indexData, tableData) {
			return indexData;
		},

		hydrateViewIndex(indexData) {
			return {};
		},

		hydrateCheckConstraint(checkConstraint) {
			return {
				name: checkConstraint.chkConstrName,
				expression: checkConstraint.constrExpression,
				enforcement: checkConstraint.constrEnforcement,
			};
		},

		hydrateDatabase(containerData, data) {
			return {
				databaseName: containerData.name,
				ifNotExist: containerData.ifNotExist,
				characterSet: containerData.characterSet,
				collation: containerData.collation,
				encryption: containerData.ENCRYPTION === 'Yes' ? true : false,
				udfs: (data?.udfs || []).map(this.hydrateUdf),
				procedures: (data?.procedures || []).map(this.hydrateProcedure),
			};
		},

		hydrateTable({ tableData, entityData, jsonSchema }) {
			const detailsTab = entityData[0];
			const likeTable = _.get(tableData, `relatedSchemas[${detailsTab.like}]`, '');

			return {
				...tableData,
				keyConstraints: keyHelper.getTableKeyConstraints({ jsonSchema }),
				temporary: detailsTab.temporary,
				ifNotExist: !detailsTab.orReplace && detailsTab.ifNotExist,
				likeTableName: likeTable?.code || likeTable?.collectionName,
				selectStatement: _.trim(detailsTab.selectStatement),
				options: { ...detailsTab.tableOptions, description: detailsTab.description },
				partitioning: detailsTab.partitioning,
				selectIgnore: detailsTab.selectIgnore,
				selectReplace: detailsTab.selectReplace,
			};
		},

		hydrateViewColumn(data) {
			return {
				name: data.name,
				tableName: data.entityName,
				alias: data.alias,
				isActivated: data.isActivated,
			};
		},

		hydrateView({ viewData, entityData, relatedSchemas, relatedContainers }) {
			const detailsTab = entityData[0];

			return {
				name: viewData.name,
				tableName: viewData.tableName,
				keys: viewData.keys,
				orReplace: detailsTab.orReplace,
				ifNotExist: detailsTab.ifNotExist,
				selectStatement: detailsTab.selectStatement,
				sqlSecurity: detailsTab.SQL_SECURITY,
				algorithm: detailsTab.algorithm,
				checkOption: detailsTab.withCheckOption ? detailsTab.checkTestingScope : '',
			};
		},

		commentIfDeactivated(statement, data, isPartOfLine) {
			return statement;
		},

		hydrateUdf(udf) {
			return {
				name: udf.name,
				delimiter: udf.functionDelimiter,
				ifNotExist: udf.functionIfNotExist,
				definer: udf.functionDefiner,
				parameters: udf.functionArguments,
				type: udf.functionReturnType,
				characteristics: {
					sqlSecurity: udf.functionSqlSecurity,
					language: udf.functionLanguage,
					contains: udf.functionContains,
					deterministic: udf.functionDeterministic,
					comment: udf.functionDescription,
				},
				body: udf.functionBody,
			};
		},

		hydrateProcedure(procedure) {
			return {
				delimiter: procedure.delimiter,
				definer: procedure.definer,
				ifNotExist: procedure.procedureIfNotExist,
				name: procedure.name,
				parameters: procedure.inputArgs,
				body: procedure.body,
				characteristics: {
					comment: procedure.comments,
					contains: procedure.contains,
					language: procedure.language,
					deterministic: procedure.deterministic,
					sqlSecurity: procedure.securityMode,
				},
			};
		},

		createUdf(databaseName, udf) {
			const characteristics = getCharacteristics(udf.characteristics);
			let startDelimiter = udf.delimiter ? `DELIMITER ${udf.delimiter}\n` : '';
			let endDelimiter = udf.delimiter ? `DELIMITER ;\n` : '';

			return (
				startDelimiter +
				assignTemplates(templates.createFunction, {
					name: getTableName(udf.name, databaseName),
					definer: udf.definer ? `DEFINER=${udf.definer} ` : '',
					ifNotExist: udf.ifNotExist ? 'IF NOT EXISTS ' : '',
					characteristics: characteristics.join('\n\t'),
					type: udf.type,
					parameters: udf.parameters,
					body: udf.body,
					delimiter: udf.delimiter || ';',
				}) +
				endDelimiter
			);
		},

		createProcedure(databaseName, procedure) {
			const characteristics = getCharacteristics(procedure.characteristics);
			let startDelimiter = procedure.delimiter ? `DELIMITER ${procedure.delimiter}\n` : '';
			let endDelimiter = procedure.delimiter ? `DELIMITER ;\n` : '';

			return (
				startDelimiter +
				assignTemplates(templates.createProcedure, {
					name: getTableName(procedure.name, databaseName),
					ifNotExist: procedure.ifNotExist ? 'IF NOT EXISTS ' : '',
					definer: procedure.definer ? `DEFINER=${procedure.definer} ` : '',
					parameters: procedure.parameters,
					characteristics: characteristics.join('\n\t'),
					body: procedure.body,
					delimiter: procedure.delimiter || ';',
				}) +
				endDelimiter
			);
		},

		dropIndex(tableName, dbData, index) {
			const table = getTableName(tableName, dbData.databaseName);
			const indexName = index.name;

			return `ALTER TABLE ${table} DROP INDEX IF EXISTS \`${indexName}\`;`;
		},

		viewSelectStatement(viewData, isActivated = true) {
			const allDeactivated = checkAllKeysDeactivated(viewData.keys || []);
			const deactivatedWholeStatement = allDeactivated || !isActivated;
			const { columns, tables } = getViewData(viewData.keys);
			let columnsAsString = columns.map(column => column.statement).join(',\n\t\t');

			if (!deactivatedWholeStatement) {
				const dividedColumns = divideIntoActivatedAndDeactivated(columns, column => column.statement);
				const deactivatedColumnsString = dividedColumns.deactivatedItems.length
					? commentIfDeactivated(dividedColumns.deactivatedItems.join(',\n\t\t'), {
							isActivated: false,
							isPartOfLine: true,
					  })
					: '';
				columnsAsString = dividedColumns.activatedItems.join(',\n\t\t') + deactivatedColumnsString;
			}

			const selectStatement = _.trim(viewData.selectStatement)
				? _.trim(tab(viewData.selectStatement))
				: assignTemplates(templates.viewSelectStatement, {
						tableName: tables.join(', '),
						keys: columnsAsString,
				  });

			return { deactivatedWholeStatement, selectStatement };
		},

		dropDatabase(dropDbData) {
			return assignTemplates(templates.dropDatabase, dropDbData);
		},

		alterDatabase(alterDbData) {
			const alterStatements = [];
			const databaseName = alterDbData.name;

			if (alterDbData.collation || alterDbData.characterSet) {
				alterStatements.push(
					assignTemplates(templates.alterDatabaseCharset, {
						name: databaseName,
						characterSet: alterDbData.characterSet,
						collation: alterDbData.collation,
					}),
				);
			}

			if (alterDbData.encryption) {
				alterStatements.push(
					assignTemplates(templates.alterDatabaseEncryption, {
						name: databaseName,
						encryption: alterDbData.encryption,
					}),
				);
			}

			if (!_.isEmpty(alterDbData.udfs?.deleted)) {
				alterDbData.udfs?.deleted.forEach((udf) => {
					alterStatements.push(this.dropUdf(databaseName, udf));
				});
			}

			if (!_.isEmpty(alterDbData.udfs?.added)) {
				alterDbData.udfs.added.forEach((udf) => {
					alterStatements.push(this.createUdf(databaseName, udf));
				});
			}

			if (!_.isEmpty(alterDbData.udfs?.modified)) {
				alterDbData.udfs.modified.forEach((udf) => {
					alterStatements.push(
						this.dropUdf(databaseName, udf) + '\n' +
						this.createUdf(databaseName, udf),
					);
				});
			}

			if (!_.isEmpty(alterDbData.procedures?.deleted)) {
				alterDbData.procedures?.deleted.forEach((procedure) => {
					alterStatements.push(this.dropProcedure(databaseName, procedure));
				});
			}

			if (!_.isEmpty(alterDbData.procedures?.added)) {
				alterDbData.procedures.added.forEach((procedure) => {
					alterStatements.push(this.createProcedure(databaseName, procedure));
				});
			}

			if (!_.isEmpty(alterDbData.procedures?.modified)) {
				alterDbData.procedures.modified.forEach((procedure) => {
					alterStatements.push(
						this.dropProcedure(databaseName, procedure) + '\n' +
						this.createProcedure(databaseName, procedure),
					);
				});
			}

			return alterStatements.join('\n\n');
		},

		dropUdf(databaseName, udf) {
			return assignTemplates(templates.dropUdf, { name: getTableName(udf.name, databaseName) });
		},

		dropProcedure(databaseName, procedure) {
			return assignTemplates(templates.dropProcedure, { name: getTableName(procedure.name, databaseName) });
		},

		hydrateDropDatabase(containerData) {
			return {
				name: containerData[0]?.name || '', 
			};
		},

		hydrateAlterDatabase({ containerData, compModeData }) {
			const data = containerData[0] || {};
			const isCharacterSetModified = compModeData.characterSet?.new !== compModeData.characterSet?.old;
			const isCollationModified = compModeData.collation?.new !== compModeData.collation?.old;
			const encryption = compModeData.ENCRYPTION?.new !== compModeData.ENCRYPTION?.old;
			const procedures = compareGroupItems(
				(compModeData.Procedures?.old || []).map(this.hydrateProcedure),
				(compModeData.Procedures?.new || []).map(this.hydrateProcedure),
			);
			const udfs = compareGroupItems(
				(compModeData.UDFs?.old || []).map(this.hydrateUdf),
				(compModeData.UDFs?.new || []).map(this.hydrateUdf),
			);
	
			return {
				name: data.name || '',
				...((isCharacterSetModified || isCollationModified) ? {
					characterSet: data.characterSet,
					collation: data.collation,
				} : {}),
				...(encryption ? { encryption: data.ENCRYPTION === 'Yes' ? 'Y' : 'N' } : {}),
				procedures,
				udfs,
			};
		},
	};
};
