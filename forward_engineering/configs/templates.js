module.exports = {
	createDatabase: 'CREATE DATABASE${ifNotExist} `${name}`${dbOptions};\n',

	createTable:
		'CREATE ${temporary}TABLE ${ifNotExist}${name} (\n' +
		'\t${column_definitions}${keyConstraints}${checkConstraints}${foreignKeyConstraints}\n' +
		')${options}${partitions}${ignoreReplace}${selectStatement};\n',

	createLikeTable: 'CREATE ${orReplace}${temporary}TABLE ${ifNotExist}${name} LIKE ${likeTableName};\n',

	columnDefinition:
		'`${name}` ${national}${type}${signed}${charset}${collate}${generatedDefaultValue}${primary_key}${unique_key}${default}${autoIncrement}${zeroFill}${not_null}${invisible}${compressed}${comment}',

	checkConstraint: 'CONSTRAINT ${name}CHECK (${expression})${enforcement}',

	createForeignKeyConstraint:
		'CONSTRAINT `${name}` FOREIGN KEY (${foreignKey}) REFERENCES ${primaryTable}(${primaryKey})',

	createKeyConstraint: '${constraintName}${keyType}${columns}${using}${blockSize}${comment}${ignore}',

	createForeignKey:
		'ALTER TABLE ${foreignTable} ADD CONSTRAINT `${name}` FOREIGN KEY (${foreignKey}) REFERENCES ${primaryTable}(${primaryKey});',

	index:
		'CREATE ${indexType}INDEX ${name}${indexCategory}\n' +
		'\tON ${table} ( ${keys} )${indexOptions};\n',

	createView:
		'CREATE ${orReplace}${algorithm}${sqlSecurity}VIEW ${ifNotExist}${name} AS ${selectStatement}${checkOption};\n',

	viewSelectStatement: 'SELECT ${keys}\n\tFROM ${tableName}',

	createFunction:
		'CREATE ${definer}FUNCTION ${ifNotExist}${name}\n' +
		'\t(${parameters})\n' +
		'\tRETURNS ${type}\n' +
		'\t${characteristics}\n' +
		'${body} ${delimiter}\n',

	createProcedure:
		'CREATE ${definer}PROCEDURE ${ifNotExist}${name}\n(${parameters})\n' + '\t${characteristics}\n' + '${body} ${delimiter}\n',

	alterView: 'ALTER${algorithm}${sqlSecurity} VIEW ${name}\nAS ${selectStatement}${checkOption};',

	dropDatabase: 'DROP DATABASE IF EXISTS \`${name}\`;',

	alterDatabaseCharset: 'ALTER DATABASE \`${name}\` CHARACTER SET=\'${characterSet}\' COLLATE=\'${collation}\';',

	alterDatabaseEncryption: 'ALTER DATABASE \`${name}\` ENCRYPTION=\'${encryption}\';',

	dropUdf: 'DROP FUNCTION IF EXISTS ${name};',

	dropProcedure: 'DROP PROCEDURE IF EXISTS ${name};',

	dropTable: 'DROP${temporary} TABLE IF EXISTS ${name};',

	alterTable: 'ALTER TABLE ${table} ${alterStatement};',

	dropIndex: 'DROP INDEX ${indexName}',

	dropCheckConstraint: 'DROP CHECK ${name}',

	addCheckConstraint: 'ADD ${checkConstraint}',

	alterCharset: '${default}CHARACTER SET=\'${charset}\'${collation}',

	dropView: 'DROP VIEW IF EXISTS ${viewName};',

	addColumn: 'ADD COLUMN ${columnDefinition}',

	dropColumn: 'DROP COLUMN ${name}',

	renameColumn: 'RENAME COLUMN ${oldName} TO ${newName}',

	changeColumn: 'CHANGE ${oldName} ${columnDefinition}',

	modifyColumn: 'MODIFY ${columnDefinition}',
};
