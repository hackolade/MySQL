const mysql2 = require('mysql2/promise');
const fs = require('fs');

let connection;
let useSshTunnel;

const getSslOptions = (connectionInfo) => {
	if (connectionInfo.sslType === 'Off') {
		return false;
	}

	if (connectionInfo.sslType === 'Unvalidated') {
		return {
			rejectUnauthorized: false
		};
	}

	if (connectionInfo.sslType === 'TRUST_CUSTOM_CA_SIGNED_CERTIFICATES') {
		return {
			ca: fs.readFileSync(connectionInfo.certAuthority),
		};
	}

	if (connectionInfo.sslType === 'TRUST_SERVER_CLIENT_CERTIFICATES') {
		return {
			ca: fs.readFileSync(connectionInfo.certAuthority),
			cert: fs.readFileSync(connectionInfo.clientCert),
			key: fs.readFileSync(connectionInfo.clientPrivateKey),
		};
	}
};

const createConnection = async (connectionInfo, sshService) => {
	if (connectionInfo.ssh) {
		useSshTunnel = true;
		const { options } = await sshService.openTunnel({
			sshAuthMethod: connectionInfo.ssh_method === 'privateKey' ? 'IDENTITY_FILE' : 'USER_PASSWORD',
			sshTunnelHostname: connectionInfo.ssh_host,
			sshTunnelPort: connectionInfo.ssh_port,
			sshTunnelUsername: connectionInfo.ssh_user,
			sshTunnelPassword: connectionInfo.ssh_password,
			sshTunnelIdentityFile: connectionInfo.ssh_key_file,
			sshTunnelPassphrase: connectionInfo.ssh_key_passphrase,
			host: connectionInfo.host,
			port: connectionInfo.port,
		});
		connectionInfo = {
			...connectionInfo,
			host: options.host,
			port: options.port.toString(),
		};
	}

	return await mysql2.createConnection({
		host: connectionInfo.host,
		user: connectionInfo.userName,
		password: connectionInfo.userPassword,
		port: connectionInfo.port,
		metaAsArray: false,
		ssl: getSslOptions(connectionInfo),
		dateStrings: true ,
		supportBigInt: true,
		autoJsonMap: false,
		connectTimeout: Number(connectionInfo.queryRequestTimeout) || 60000,
		database: connectionInfo.databaseName,
	});
};

const connect = async (connectionInfo, sshService) => {
	if (connection) {
		return connection;
	}

	connection = await createConnection(connectionInfo, sshService);

	return connection;
};

const createInstance = (connection, logger) => {
	const ping = async () => {
		return await connection.ping();
	};

	const getDatabases = async (systemDatabases) => {
		const databases = await query('show databases;');

		return databases.map(item => item.Database).filter(dbName => !systemDatabases.includes(dbName));
	};

	const getTables = async (dbName) => {
		const tables = await query(`show full tables from \`${dbName}\`;`);

		return tables;
	};

	const getCount = async (dbName, tableName) => {
		const count = await query(`SELECT COUNT(*) as count FROM \`${dbName}\`.\`${tableName}\`;`);

		return Number(count[0]?.count || 0);
	};

	const getRecords = async (dbName, tableName, limit) => {
		const result = await query({
			sql: `SELECT * FROM \`${dbName}\`.\`${tableName}\` LIMIT ${limit};`
		});

		return result;
	};

	const getVersion = async () => {
		const version = await query('select version() as version;');

		return version[0].version;
	};

	const describeDatabase = async (dbName) => {
		const data = await query(`show create database \`${dbName}\`;`);

		return data[0]['Create Database'];
	};

	const getFunctions = async (dbName) => {
		const functions = await query(`show function status WHERE Db = '${dbName}'`);

		return Promise.all(
			functions.map(
				f => query(`show create function \`${dbName}\`.\`${f.Name}\`;`).then(functionCode => ({
					meta: f,
					data: functionCode,
				}))
			)
		);
	};

	const getProcedures = async (dbName) => {
		const functions = await query(`show procedure status WHERE Db = '${dbName}'`);

		return Promise.all(
			functions.map(
				f => query(`show create procedure \`${dbName}\`.\`${f.Name}\`;`).then(functionCode => ({
					meta: f,
					data: functionCode,
				}))
			)
		);
	};

	const showCreateTable = async (dbName, tableName) => {
		const result = await query(`show create table \`${dbName}\`.\`${tableName}\`;`);

		return result[0]?.['Create Table'];
	};

	const getConstraints = async (dbName, tableName) => {
		try {
			const result = await query(`select * from information_schema.TABLE_CONSTRAINTS where CONSTRAINT_SCHEMA='${dbName}' AND TABLE_NAME='${tableName}';`);

			return result;
		} catch (error) {
			logger.log('error', {
				message: '[Warning] ' + error.message,
				stack: error.stack,
			});
			return [];
		}
	};

	const getColumns = async (dbName, tableName) => {
		const result = await query(`show fields from \`${dbName}\`.\`${tableName}\`;`);

		return result;
	};

	const getIndexes = async (dbName, tableName) => {
		const result = await query(`show index from \`${tableName}\` from \`${dbName}\`;`);

		return result;
	};

	const showCreateView = async (dbName, viewName) => {
		const result = await query(`show create view \`${dbName}\`.\`${viewName}\`;`);

		return result[0]?.['Create View'];
	};

	const query = async (sql) => {
		const [rows, _] = await connection.execute(sql);
		return rows;
	};

	const rawQuery = async (sql) => {
		await connection.query(sql);
	};

	const serverVersion = async () => {
		const result = await query('select VERSION() as version;');

		return result[0]?.version || '';
	};

	const getInnoDBTablespaces = async () => {
		try {
			const tableSpacesInfo = await query(`
				SELECT ts.*, tsb.PATH
				FROM INFORMATION_SCHEMA.INNODB_TABLESPACES_BRIEF tsb JOIN INFORMATION_SCHEMA.INNODB_TABLESPACES ts ON ts.NAME = tsb.NAME
				WHERE
					tsb.SPACE_TYPE='General' OR (tsb.SPACE_TYPE='Single' AND tsb.PATH NOT LIKE './%')
					AND
					ts.STATE = 'active'
				;
			`);

			return tableSpacesInfo;
		} catch (e) {
			logger.log('error', { message: '[Warning] ' + e.message, stack: e.stack });
		}
	};

	const getNDBTablespaces = async () => {
		try {
			const tableSpaces = await query(`SELECT * FROM INFORMATION_SCHEMA.FILES WHERE ENGINE='ndbcluster' && FILE_TYPE='DATAFILE' && TABLESPACE_NAME IS NOT NULL;`);

			return tableSpaces;
		} catch (e) {
			logger.log('error', { message: '[Warning] ' + e.message, stack: e.stack });
		}
	};

	return {
		getCount,
		getRecords,
		getVersion,
		describeDatabase,
		getFunctions,
		getProcedures,
		showCreateTable,
		getConstraints,
		getColumns,
		getIndexes,
		showCreateView,
		query,
		serverVersion,
		ping,
		getDatabases,
		getTables,
		rawQuery,
		getInnoDBTablespaces,
		getNDBTablespaces,
	};
};

const close = async (sshService) => {
	if (connection) {
		connection.end();
		connection = null;
	}

	if (useSshTunnel) {
		useSshTunnel = false;
		await sshService.closeConsumer();
	}
};

module.exports = {
	connect,
	createInstance,
	close,
};
