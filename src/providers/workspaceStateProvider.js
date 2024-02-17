const vscode = require('vscode');

/**
 * @param {string} key
 * @param {any} value
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<void>}
 * @description Set the workspace state
 */
async function setWorkspaceState(key, value, context) {
    await context.workspaceState.update(key, value);
}

/**
 * @param {string} key
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<any>}
 * @description Get the workspace state
 */
async function getWorkspaceState(key, context) {
    return context.workspaceState.get(key);
}

module.exports = {
    setWorkspaceState,
    getWorkspaceState
};