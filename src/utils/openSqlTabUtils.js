const vscode = require('vscode');
const { headerExists } = require('./validationUtils');

/**
 * Open a new tab with the given SQL query
 * @param {string} sqlQueryWithComments 
 * @returns {Promise<void>}
 */
async function openQueryInNewTab(sqlQueryWithComments) {
    const document = await vscode.workspace.openTextDocument({ language: 'sql' });

    const edit = new vscode.WorkspaceEdit();
    edit.insert(document.uri, new vscode.Position(0, 0), sqlQueryWithComments);
    await vscode.workspace.applyEdit(edit);

    await vscode.window.showTextDocument(document, { preview: false });
}

module.exports = {
    openQueryInNewTab
};