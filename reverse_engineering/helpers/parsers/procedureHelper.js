const parseProcedure = (query) => {
	const parseRegexp = /create(\s+definer\s*=(?<definer>[\s\S]+?))?\s+procedure(?<ifNotExists>\s+if\s+not\s+exists)?\s+\`(?<name>[\s\S]+?)\`\s*\((?<parameters>[\s\S]*?)\)(?<characteristics>(\s+(\s*language\s+sql)|(\s*(not)?\s+deterministic)|(\s*(contains\s+sql|no\s+sql|reads\s+sql\s+data|modifies\s+sql\s+data))|(\s*sql\s+security\s+(definer|invoker))|(\s*comment\s+\'[\s\S]+?\'))*)\s+(?<body>([a-z_\-0-9]+\:\s*)?(begin|return)([\s\S]+))/i;

	if (!parseRegexp.test(query)) {
		throw new Error('Cannot parse procedure');
	}

	const result = String(query).match(parseRegexp);
	const {
		definer,
		ifNotExists,
		name,
		parameters,
		characteristics,
		body,
	} = result.groups;

	return {
		definer: definer,
		ifNotExists: Boolean(ifNotExists),
		name: name,
		parameters: parameters,
		characteristics: characteristics || '',
		body: body || '',
	};
};

module.exports = {
	parseProcedure,
};
