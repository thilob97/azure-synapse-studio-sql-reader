const vscode = require('vscode');

/**
 * @param {string} key
 * @param {any} value
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<void>}
 * @description Set the global state
 */
async function setGlobalState(key, value, context) {
    await context.globalState.update(key, value);
}

/**
 * @param {string} key
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<any>}
 * @description Get the global state
 */
async function getGlobalState(key, context) {
    return await context.globalState.get(key);
}

module.exports = {
    setGlobalState,
    getGlobalState
};