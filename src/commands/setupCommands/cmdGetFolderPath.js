const vscode = require('vscode');
const provider = require('../../providers');

let folderPath;

/**
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<string>}
 * @description Get the folder path to the Synapse sqlscripts folder
 */
async function getFolderPath(context) {
    folderPath = await provider.workspaceStateProvider.getWorkspaceState('folderPath', context);

    if (!folderPath) {
        await vscode.window.showInformationMessage('Please set the folder path to your Synapse sqlscripts folder');
        await vscode.commands.executeCommand('synapse.setFolderPath');
    } else {
        return folderPath;
    }
}

module.exports = getFolderPath;