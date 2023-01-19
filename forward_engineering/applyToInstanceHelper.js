const connectionHelper = require('../reverse_engineering/helpers/connectionHelper');

const TABLESPACE_EXISTS_ERROR = 1813;

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
		const queries = joinFunctionBodies(
			splitUpDropCreateStatements(
				connectionInfo.script.split('\n\n'),
			),
		).map((query) => {
			return removeDelimiter(_.trim(query));
		}).filter(
			(q) => [
				Boolean,
				q => !q.startsWith('USE'),
				q => !(q.startsWith('/*') && q.endsWith('*/')),
			].every(f => f(q)),
		);

		await async.mapSeries(queries, async query => {
			const message = 'Query: ' + query.split('\n').shift().substr(0, 150);
			logger.progress({ message });
			try {
				await connection.rawQuery(query);
			} catch (e) {
				logger.log('error', { message: `query ${query} failed with: ${e.message}`, error: e }, 'Apply to instance');
				if (![TABLESPACE_EXISTS_ERROR].includes(e.errno)) {
					throw e;
				}
			}
		});

	} catch (e) {
		connectionHelper.close();
		throw e;
	}

};

const joinFunctionBodies = (queries) => {
	const ACCUMULATING_STATE = 0;
	const JOINING_STATE = 1;
	const statements = [];
	let state = ACCUMULATING_STATE;

	for (let i = 0; i < queries.length; i++) {
		const query = queries[i];

		if (state === ACCUMULATING_STATE) {
			if (/^create\s+(function|procedure)/i.test(query)) {
				state = JOINING_STATE;
			}

			statements.push(query);
			continue;
		}

		if (/\bend\s+(.+)/i.test(query)) {
			state = ACCUMULATING_STATE;
		}

		statements[statements.length - 1] += '\n\n' + query;
	}

	return statements;
};

const splitUpDropCreateStatements = (queries) => {
	return queries.flatMap((query) => {
		if (!(
			/^\s*drop\s+[\s\S]+?\s+create/i.test(query)
			|| /^\s*alter\s+table\s+\`?([\s\S]+?)\`\.\`?([\s\S]+?)\`?\s+drop\s+[\s\S]+?\s+(add|create)/i.test(query)
		)) {
			return query;
		}
		const divided = query.trim().split('\n');

		return [divided[0], divided.slice(1).join('\n')]
	});
};

module.exports = { applyToInstance };
