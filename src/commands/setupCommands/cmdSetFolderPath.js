const vscode = require('vscode');
const provider = require('../../providers');

let path;
let workspacePath;

/**
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<void>}
 * @description Set the folder path to the Synapse sqlscripts folder
 */
async function setFolderPath(context) {
    path = await vscode.window.showInputBox({
        placeHolder: "Sources/sqlscript",
        prompt: "Please enter the folder to your Synapse sqlscripts folder",
    });

    workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
    path = `${workspacePath}/${path}`;

    await provider.workspaceStateProvider.setWorkspaceState('folderPath', path, context);
}


module.exports = setFolderPath;