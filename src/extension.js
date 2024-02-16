const vscode = require('vscode');
const path = require('path');
const commands = require('./commands');
const { headerExists, isValidJsonFormat } = require('./utils/validationUtils');
const { openQueryInNewTab } = require('./utils/openSqlTabUtils');

let originalJsonUri;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.workspace.onDidOpenTextDocument(document => {
		if (document.languageId === 'json' && document.uri.scheme === 'file') {
			try {
				const jsonContent = JSON.parse(document.getText());
				if (isValidJsonFormat(jsonContent)) {
					vscode.window.showInformationMessage('Das JSON-Format ist korrekt.');
					originalJsonUri = document.uri;
					if (headerExists(document.getText())) {
						vscode.window.showInformationMessage('Azure Synapse Studio SQL-Header erkannt.');
						const sqlQueryWithComments = `${jsonContent.properties.content.query}`;
						openQueryInNewTab(sqlQueryWithComments);
					} else {
						vscode.window.showInformationMessage('Azure Synapse Studio SQL-Header nicht erkannt.');
						const metaDataString = generateSqlComment(jsonContent, originalJsonUri);
						const sqlQueryWithComments = `${metaDataString}\n\n${jsonContent.properties.content.query}`;
						openQueryInNewTab(sqlQueryWithComments);
					}
				} else {
					vscode.window.showErrorMessage('Das JSON-Format entspricht nicht dem erwarteten Format.');
				}
			} catch (e) {
				vscode.window.showErrorMessage('Fehler beim Parsen der JSON-Datei.');
			}
		}
	});

	// Registriere den Befehl "extension.checkSqlHeader"
	vscode.commands.registerCommand('extension.checkSqlHeader', commands.cmdCheckSqlHeader);
	// Registriere den Befehl "extension.openQueryInNewTab"
	vscode.commands.registerCommand('extension.openQueryInNewTab', commands.cmdOpenQueryInNewTab);



	// Füge den Event-Listener zur Liste der Abonnements hinzu

	context.subscriptions.push(disposable);

	// Registriere einen Event-Listener, der auf das Speichern von Dokumenten reagiert
	let saveListener = vscode.workspace.onDidSaveTextDocument(document => {
		if (document.languageId === 'sql') {
			// Parse den SQL-Text und extrahiere die Kommentare am Anfang, um die Metadaten zu erhalten
			const sqlText = document.getText();
			const { metadata, query } = parseSqlCommentsToMetadata(sqlText);

			// Überprüfe, ob der Pfad der Original-JSON-Datei in den Metadaten enthalten ist
			if (metadata && metadata.originalFilePath) {
				// Aktualisiere das ursprüngliche JSON-Dokument mit den neuen Informationen
				updateJsonFileWithSqlQuery(metadata, query).catch(err => {
					vscode.window.showErrorMessage('Fehler beim Aktualisieren der JSON-Datei: ' + err.message);
				});
			}
		}
	});

	context.subscriptions.push(saveListener);
}

function generateSqlComment(jsonContent, originalJsonUri) {

	const workspaceFolders = vscode.workspace.workspaceFolders;
	const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
	const relativePath = path.relative(workspacePath, originalJsonUri.fsPath);


	const comment = `
/************************************************************/
/* Dieser SQL-Query wurde aus einer JSON-Datei generiert    */
/* mit Hilfe der vscode-Erweiterung azure-synapse-studio-sql */
/************************************************************/
/*
    --- JSON-Informationen ---
    Original JSON-Datei: ${relativePath}
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

function parseSqlCommentsToMetadata(sqlText) {
	const lines = sqlText.split('\n');
	const metadata = {};

	lines.forEach(line => {
		if (line.includes('Original JSON-Datei:')) {
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

function deactivate() { }

module.exports = {
	activate,
	deactivate
};