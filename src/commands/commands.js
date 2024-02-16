const vscode = require('vscode');
const { headerExists, isValidJsonFormat } = require('../utils/analytics');
const { openQueryInNewTab } = require('../utils/parser');

function cmdcheckSqlHeader() {
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




module.exports = {
    cmdcheckSqlHeader,
    cmdOpenQueryInNewTab
};
