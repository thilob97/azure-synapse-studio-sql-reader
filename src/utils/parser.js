const vscode = require('vscode');
const { headerExists } = require('./analytics');

async function openQueryInNewTab(sqlQueryWithComments, jsonContent, originalJsonUri) {
    const document = await vscode.workspace.openTextDocument({ language: 'sql' });
    const documentText = document.getText();


    const edit = new vscode.WorkspaceEdit();
    edit.insert(document.uri, new vscode.Position(0, 0), sqlQueryWithComments);
    await vscode.workspace.applyEdit(edit);

    // Öffne das Dokument in einem neuen Editor-Tab
    await vscode.window.showTextDocument(document, { preview: false });
}

module.exports = {
    openQueryInNewTab
};