const vscode = require('vscode');
const { headerExists } = require('../../utils/validationUtils');

/**
 * Command to check if the SQL header is present in the active document
 */
function cmdCheckSqlHeader() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Document not found');
        return;
    }

    const document = editor.document;
    if (document.languageId !== 'sql') {
        vscode.window.showInformationMessage('This is not a SQL document');
        return;
    }

    const text = document.getText();
    if (headerExists(text)) {
        vscode.window.showInformationMessage('The extenstion header is present in the SQL script');
    } else {
        vscode.window.showInformationMessage('The extension header is not present in the SQL script');
    }
}

module.exports = cmdCheckSqlHeader;
