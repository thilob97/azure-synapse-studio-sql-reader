const vscode = require('vscode');
const { isValidJsonFormat } = require('../utils/analytics');
const { openQueryInNewTab } = require('../utils/parser');

function cmdOpenQueryInNewTab() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Kein Dokument geöffnet');
        return;
    }

    const document = editor.document;
    if (document.languageId !== 'json') {
        vscode.window.showInformationMessage('Das geöffnete Dokument ist kein JSON-Dokument');
        return;
    }

    const jsonContent = JSON.parse(document.getText());

    if (!isValidJsonFormat(jsonContent)) {
        vscode.window.showErrorMessage('Das JSON-Dokument entspricht nicht dem erwarteten Format');
        return;
    }

    if (jsonContent.properties.content.query) {
        openQueryInNewTab(jsonContent.properties.content.query, jsonContent);
    } else {
        vscode.window.showErrorMessage('Das JSON-Dokument enthält kein SQL-Query');
    }
}

module.exports = cmdOpenQueryInNewTab;
