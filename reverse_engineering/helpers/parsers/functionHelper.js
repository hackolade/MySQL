
const parseFunctionQuery = (query) => {
	const parseRegexp = /create(?:\s+definer\s*=(?<definer>[\s\S]+?))?\s+function(?<ifNotExists>\s+if\s+not\s+exists)?\s+\`(?<funcName>[\s\S]+?)\`\s*\((?<funcParameters>[\s\S]*?)\)\s+returns\s+(?<returnType>[a-z0-9\(\),]+)(?<characteristics>(\s+(\s*language\s+sql)|(\s*(not)?\s+deterministic)|(\s*(contains\s+sql|no\s+sql|reads\s+sql\s+data|modifies\s+sql\s+data))|(\s*sql\s+security\s+(definer|invoker))|(\s*comment\s+\'[\s\S]+?\'))*)\s+(?<funcBody>(begin|return)([\s\S]+))/i;

	if (!parseRegexp.test(query)) {
		throw Error('Cannot parse function');
	}

	const result = String(query).match(parseRegexp);
	const {
		definer,
		ifNotExists,
		funcName,
		funcParameters,
		returnType,
		characteristics,
		funcBody,
	} = result.groups;

	return {
		definer: definer,
		ifNotExists: Boolean(ifNotExists),
		name: funcName,
		parameters: funcParameters,
		returnType: returnType,
		characteristics: characteristics || '',
		body: funcBody || '',
	};
};

const getLanguage = (characteristics) => {
	return /language sql/i.test(characteristics) ? 'SQL' : '';
}

const getDeterministic = (characteristics) => {
	if (/not deterministic/i.test(characteristics)) {
		return 'NOT DETERMINISTIC';
	} else if (/deterministic/i.test(characteristics)) {
		return 'DETERMINISTIC';
	} else {
		return '';
	}
};

const getContains = (characteristics) => {
	if (/contains\s+sql/i.test(characteristics)) {
		return 'SQL';
	} else if (/no\s+sql/i.test(characteristics)) {
		return 'NO SQL';
	} else if (/reads\s+sql\s+data/i.test(characteristics)) {
		return 'READS SQL DATA';
	} else if (/modifies\s+sql\s+data/i.test(characteristics)) {
		return 'MODIFIES SQL DATA';
	} else {
		return '';
	}
};

const getDefiner = (characteristics) => {
	if (/SQL\s+SECURITY\s+DEFINER/i.test(characteristics)) {
		return 'DEFINER';
	} else if (/SQL\s+SECURITY\s+INVOKER/i.test(characteristics)) {
		return 'INVOKER';
	} else {
		return '';
	}
};

const getComment = (characteristics) => {
	const commentRegexp = /comment\s\'([\s\S]+?)\'/i;

	if (!commentRegexp.test(characteristics)) {
		return '';
	}

	const result = characteristics.match(commentRegexp);

	return result[1] || '';
}

module.exports = {
	parseFunctionQuery,
	getLanguage,
	getDeterministic,
	getContains,
	getDefiner,
	getComment,
};
