const vscode = require('vscode');
const path = require('path');

/**
 * Parses a SQL file and extracts metadata from comments
 * @param {string} sqlText
 * @returns {object}
 */
function parseSqlCommentsToMetadata(sqlText) {
    const lines = sqlText.split('\n');
    const metadata = {};

    lines.forEach(line => {
        if (line.includes('Original JSON File:')) {
            metadata.originalFilePath = line.split(': ')[1].trim();
        } else if (line.includes('Name:')) {
            metadata.name = line.split(': ')[1].trim();
        } else if (line.includes('Folder:')) {
            metadata.folder = line.split(': ')[1].trim();
        } else if (line.includes('Type:')) {
            metadata.type = line.split(': ')[1].trim();
        } else if (line.includes('Language:')) {
            metadata.language = line.split(': ')[1].trim();
        } else if (line.includes('Database:')) {
            metadata.database = line.split(': ')[1].trim();
        } else if (line.includes('poolName:')) {
            metadata.poolName = line.split(': ')[1].trim();
        } else if (line.includes('MaxRows:')) {
            metadata.maxRows = parseInt(line.split(': ')[1].trim(), 10);
        }
    });

    return { metadata, query: sqlText };
}

/**
 * Updates a JSON file with a new SQL query
 * @param {object} metadata
 * @param {string} query
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function updateJsonFileWithSqlQuery(metadata, query) {
    // Der Pfad zur JSON-Datei, extrahiert aus den Metadaten
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
    const absoluteJsonFilePath = path.join(workspacePath, metadata.originalFilePath);

    try {
        const jsonDocument = await vscode.workspace.openTextDocument(absoluteJsonFilePath);
        let jsonContent = JSON.parse(jsonDocument.getText());

        // Aktualisiere den SQL-Query im JSON-Objekt sowie weitere Metadaten
        //jsonContent.name = metadata.name;
        //jsonContent.properties.folder.name = metadata.folder;
        //jsonContent.properties.type = metadata.type;
        jsonContent.properties.content.query = query;
        //jsonContent.properties.content.metadata.language = metadata.language;
        //jsonContent.properties.content.currentConnection.databaseName = metadata.database;
        //jsonContent.properties.content.currentConnection.poolName = metadata.poolName;
        //jsonContent.properties.content.resultLimit = metadata.maxRows;

        // Erstelle ein WorkspaceEdit-Objekt, um das JSON-Dokument zu aktualisieren
        const edit = new vscode.WorkspaceEdit();
        edit.replace(jsonDocument.uri, new vscode.Range(0, 0, jsonDocument.lineCount, 0), JSON.stringify(jsonContent, null, 4));

        // Wende die Änderungen an
        await vscode.workspace.applyEdit(edit);

        // Speichere die Datei
        await jsonDocument.save();

        // Informiere den Benutzer, dass die Aktualisierung erfolgreich war
        vscode.window.showInformationMessage('JSON-Datei erfolgreich aktualisiert.');
    } catch (err) {
        // Zeige eine Fehlermeldung, falls etwas schiefgeht
        vscode.window.showErrorMessage('Fehler beim Aktualisieren der JSON-Datei: ' + err.message);
    }
}

module.exports = {
    parseSqlCommentsToMetadata,
    updateJsonFileWithSqlQuery
};