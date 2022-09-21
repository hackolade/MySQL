const connectionHelper = require('../reverse_engineering/helpers/connectionHelper');

const removeDelimiter = (statement) => {
	const regExp = /delimiter (.*)/i;

	if (!regExp.test(statement)) {
		return statement;
	}

	const delimiter = statement.match(regExp)[1];
	const statementWithoutDelimiter = statement.replace(new RegExp(regExp, 'gi'), '');

	return statementWithoutDelimiter.trim().replace(new RegExp(delimiter.split('').map(n => '\\' + n).join('') + '$'), '');
};

const applyToInstance = async (connectionInfo, logger, app) => {
	const _ = app.require('lodash');
	const async = app.require('async');
	const connection = connectionHelper.createInstance(
		await connectionHelper.connect(connectionInfo),
		logger,
	);

	try {
		const queries = connectionInfo.script.split('\n\n').map((query) => {
			return removeDelimiter(_.trim(query));
		}).filter(Boolean).filter(q => !q.startsWith('USE'));

		await async.mapSeries(queries, async query => {
			const message = 'Query: ' + query.split('\n').shift().substr(0, 150);
			logger.progress({ message });
			try{
				await connection.query(query);
			}catch(e){
				logger.error('query %s failed with: %O', query, e);
				throw e;
			}
		});

	} catch (e) {
		connectionHelper.close();
		throw e;
	}

};

module.exports = { applyToInstance };
