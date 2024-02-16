const vscode = require('vscode');
const { headerExists } = require('../utils/analytics');

function cmdCheckSqlHeader() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Kein Dokument geöffnet');
        return;
    }

    const document = editor.document;
    if (document.languageId !== 'sql') {
        vscode.window.showInformationMessage('Das geöffnete Dokument ist kein SQL-Skript');
        return;
    }

    const text = document.getText();
    if (headerExists(text)) {
        vscode.window.showInformationMessage('Der Header ist im SQL-Skript vorhanden');
    } else {
        vscode.window.showInformationMessage('Der Header ist NICHT im SQL-Skript vorhanden');
    }
}

module.exports = cmdCheckSqlHeader;
