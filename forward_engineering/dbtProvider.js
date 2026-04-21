/**
 * @typedef {import('./types').AppInstance} AppInstance
 * @typedef {import('./types').ColumnDefinition} ColumnDefinition
 * @typedef {import('./types').JsonSchema} JsonSchema
 * @typedef {import('./types').ConstraintDto} ConstraintDto
 */
const { toLower, toUpper, identity } = require('lodash');

const types = require('./configs/types');
const defaultTypes = require('./configs/defaultTypes');
const getKeyHelper = require('./helpers/keyHelper');
const getColumnDefinitionHelper = require('./helpers/columnDefinitionHelper');

class DbtProvider {
	/**
	 * @returns {DbtProvider}
	 */
	static createDbtProvider() {
		return new DbtProvider();
	}

	/**
	 * @param {string} type
	 * @returns {string | undefined}
	 */
	getDefaultType(type) {
		return defaultTypes[type];
	}

	/**
	 * @returns {Record<string, object>}
	 */
	getTypesDescriptors() {
		return types;
	}

	/**
	 * @param {string} type
	 * @returns {boolean}
	 */
	hasType(type) {
		return Object.keys(types).map(toLower).includes(toLower(type));
	}

	/**
	 * @param {{ type: string; columnDefinition: ColumnDefinition }}
	 * @returns {string}
	 */
	decorateType({ type, columnDefinition }) {
		const columnDefinitionHelper = getColumnDefinitionHelper(identity);

		return columnDefinitionHelper.decorateType(toUpper(type), columnDefinition);
	}

	/**
	 * @param {{ jsonSchema: JsonSchema }}
	 * @returns {ConstraintDto[]}
	 */
	getCompositeKeyConstraints({ jsonSchema }) {
		const keyHelper = getKeyHelper(identity);

		return keyHelper.getCompositeKeyConstraints({ jsonSchema });
	}

	/**
	 * @param {{ columnDefinition: ColumnDefinition }}
	 * @returns {ConstraintDto[]}
	 */
	getColumnConstraints({ columnDefinition }) {
		const keyHelper = getKeyHelper(identity);

		return keyHelper.getColumnConstraints({ columnDefinition });
	}

	/**
	 * @param {{ modelData: object[]; containerData: object[]; entityData: object[];}}
	 * @returns {{ databaseName?: string, schemaName?: string }}
	 */
	getEntityProperties({ modelData, containerData, entityData }) {
		return {
			databaseName: containerData?.[0]?.code ?? containerData?.[0]?.name,
		};
	}
}

module.exports = DbtProvider;
