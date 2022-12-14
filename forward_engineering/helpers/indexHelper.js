module.exports = (wrap) => {
	const findProperty = (namePath, jsonSchema) => {
		const isArrayItem = (name) => /\[\d*\]/.test(name);
		let schema = jsonSchema;
	
		for (let i = 0; i < namePath.length; i++) {
			const name = namePath[i];
	
			if (!schema) {
				return;
			}
	
			if (isArrayItem(name)) {
				if (Array.isArray(schema.items)) {
					schema = schema.items[(+name.match(/\[(\d*)\]/)?.[1]) || 0];
				} else {
					schema = schema.items;
				}
			} else if (schema.properties?.[name]) {
				schema = schema.properties?.[name];
			}
		}
	
		return schema;
	};
	
	const getCastingTypeBySchema = (schema) => {
		if (schema.type === 'jsonArray') {
			return 'UNSIGNED ARRAY';
		}
	
		if (schema.type === 'jsonNumber') {
			return 'DECIMAL(5,2)'
		}
	
		return `CHAR(${schema.maxLength || schema.minLength || 50})`;
	};
	
	const processIndexKeyName = ({ name, type, jsonSchema }) => {
		const namePath = name.split('.');
	
		if (namePath.length <= 1) {
			return `\`${name}\`${type === 'DESC' ? ' DESC' : ''}`;
		}
	
		const schema = findProperty(namePath, jsonSchema);
	
		if (!schema) {
			return `\`${name}\`${type === 'DESC' ? ' DESC' : ''}`;
		}
	
		return `(CAST(${wrap(namePath[0], '`', '`')}->'$.${namePath.slice(1).join('.')}' AS ${getCastingTypeBySchema(schema)}))`
	};

	return { processIndexKeyName };
};
