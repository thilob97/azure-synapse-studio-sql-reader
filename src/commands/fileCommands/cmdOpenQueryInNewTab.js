const vscode = require('vscode');
const { isValidJsonFormat } = require('../../utils/validationUtils');
const { openQueryInNewTab } = require('../../utils/openSqlTabUtils');


/*
* Command to open the SQL query from a JSON document in a new tab
*/
function cmdOpenQueryInNewTab() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Document not found');
        return;
    }

    const document = editor.document;
    if (document.languageId !== 'json') {
        vscode.window.showInformationMessage('This is not a JSON document');
        return;
    }

    const jsonContent = JSON.parse(document.getText());

    if (!isValidJsonFormat(jsonContent)) {
        vscode.window.showErrorMessage('The JSON document is not in the expected format.');
        return;
    }

    if (jsonContent.properties.content.query) {
        openQueryInNewTab(jsonContent.properties.content.query);
    } else {
        vscode.window.showErrorMessage('The JSON document does not contain a SQL query');
    }
}

module.exports = cmdOpenQueryInNewTab;
