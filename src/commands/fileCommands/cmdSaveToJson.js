const vscode = require('vscode');
const utils = require('../../utils');

/**
 * @description This function is used to save the SQL query to a JSON file
 */
function cmdSaveToJson() {
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
    if (utils.validationUtils.headerExists(text)) {
        vscode.window.showInformationMessage('The extenstion header is present in the SQL script');
        const { metadata, query } = utils.parserUtils.parseSqlCommentsToMetadata(text);
        if (metadata && metadata.originalFilePath) {
            utils.parserUtils.updateJsonFileWithSqlQuery(metadata, query).catch(err => {
                vscode.window.showErrorMessage('Error: ' + err.message);
            });
        }
    } else {
        vscode.window.showInformationMessage('The extension header is not present in the SQL script');
    }
}

module.exports = cmdSaveToJson;
