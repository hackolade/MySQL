const dropStatementProxy = ({ commentIfDeactivated }) => (applyDropStatements, ddlProvider) => {
	let hasDropStatements = false;

	return {
		...ddlProvider,
		...[
			'dropDatabase',
			'dropUdf',
			'dropProcedure',
			'dropTable',
			'dropColumn',
			'dropIndex',
			'dropCheckConstraint',
			'dropView',
		].reduce((result, method) => {
			return {
				...result,
				[method]: (...params) => {
					hasDropStatements = true;
					const script = ddlProvider[method](...params);

					if (applyDropStatements) {
						return script;
					}

					return commentIfDeactivated(script, { isActivated: false });
				},
			}
		}, {}),
		isDropInStatements() {
			return hasDropStatements;
		},
	};
};

module.exports = dropStatementProxy;
