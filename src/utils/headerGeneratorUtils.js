const path = require('path');
const vscode = require('vscode');

/**
 * Generates a SQL comment block based on the JSON content
 * @param {object} jsonContent
 * @param {vscode.Uri} originalJsonUri
 * @returns {string}
 */
function generateSqlComment(jsonContent, originalJsonUri) {

    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
    const relativePath = path.relative(workspacePath, originalJsonUri.fsPath);


    const comment = `
/************************************************************/
/* This SQL query was generated from a JSON file            */
/* using the vscode extension azure-synapse-studio-sql      */
/************************************************************/
/*
    --- JSON Information ---
    Original JSON File: ${relativePath}
    Name: ${jsonContent.name}
    Folder: ${jsonContent.properties.folder.name}
    Type: ${jsonContent.properties.type}

    --- MetaData ---
    Language: ${jsonContent.properties.content.metadata.language}

    --- Connection ---
    Database: ${jsonContent.properties.content.currentConnection.databaseName}
    poolName: ${jsonContent.properties.content.currentConnection.poolName}

    --- limits ---
    MaxRows: ${jsonContent.properties.content.resultLimit}
*/
`;
    return comment;
}

module.exports = {
    generateSqlComment
};