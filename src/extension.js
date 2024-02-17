const vscode = require('vscode');
const commands = require('./commands');
const utils = require('./utils');
const provider = require('./providers');

let originalJsonUri;

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	let disposable = vscode.workspace.onDidOpenTextDocument(document => {
		if (document.languageId === 'json' && document.uri.scheme === 'file') {
			try {
				const jsonContent = JSON.parse(document.getText());
				if (utils.validationUtils.isValidJsonFormat(jsonContent)) {
					vscode.window.showInformationMessage('Das JSON-Format ist korrekt.');
					originalJsonUri = document.uri;
					if (utils.validationUtils.headerExists(document.getText())) {
						vscode.window.showInformationMessage('Azure Synapse Studio SQL-Header detected. Opening query in new tab.');
						const sqlQueryWithComments = `${jsonContent.properties.content.query}`;
						utils.openSqlTabUtils.openQueryInNewTab(sqlQueryWithComments);
					} else {
						vscode.window.showInformationMessage('No Azure Synapse Studio SQL-Header detected. Adding SQL-Header.');
						const metaDataString = utils.headerGeneratorUtils.generateSqlComment(jsonContent, originalJsonUri);
						const sqlQueryWithComments = `${metaDataString}\n\n${jsonContent.properties.content.query}`;
						utils.openSqlTabUtils.openQueryInNewTab(sqlQueryWithComments);
					}
				} else {
					vscode.window.showErrorMessage('Invalid JSON format.');
				}
			} catch (e) {
				vscode.window.showErrorMessage('Error parsing JSON file: ' + e.message);
			}
		}
	});

	// Registriere den Befehl "extension.checkSqlHeader"
	vscode.commands.registerCommand('extension.checkSqlHeader', commands.cmdCheckSqlHeader);
	// Registriere den Befehl "extension.openQueryInNewTab"
	vscode.commands.registerCommand('extension.openQueryInNewTab', commands.cmdOpenQueryInNewTab);
	// Registriere den Befehl "extension.saveToJson"
	vscode.commands.registerCommand('extension.saveToJson', commands.cmdSaveToJson);
	// Registriere den Befehl "extension.setFolderPath"
	vscode.commands.registerCommand('extension.setFolderPath', async () => {
		return commands.cmdSetFolderPath(context)
	});
	// Registriere den Befehl "extension.getFolderPath"
	vscode.commands.registerCommand('extension.getFolderPath', async () => {
		return commands.cmdGetFolderPath(context)
	});

	const folderPath = await vscode.commands.executeCommand('extension.getFolderPath');

	if (folderPath) {
		vscode.window.showInformationMessage('Folder path is set to: ' + folderPath);
		const folderTreeDataProvider = new provider.folderTreeDataProvider(folderPath);
		vscode.window.createTreeView('myFolderTreeView', {
			treeDataProvider: folderTreeDataProvider
		});
	}

	context.subscriptions.push(disposable);


	// Registriere einen Event-Listener, der auf das Speichern von Dokumenten reagiert
	let saveListener = vscode.workspace.onDidSaveTextDocument(document => {
		if (document.languageId === 'sql') {
			// Parse den SQL-Text und extrahiere die Kommentare am Anfang, um die Metadaten zu erhalten
			const sqlText = document.getText();
			const { metadata, query } = utils.parserUtils.parseSqlCommentsToMetadata(sqlText);

			// Überprüfe, ob der Pfad der Original-JSON-Datei in den Metadaten enthalten ist
			if (metadata && metadata.originalFilePath) {
				// Aktualisiere das ursprüngliche JSON-Dokument mit den neuen Informationen
				utils.parserUtils.updateJsonFileWithSqlQuery(metadata, query).catch(err => {
					vscode.window.showErrorMessage('Error: ' + err.message);
				});
			}
		}
	});

	context.subscriptions.push(saveListener);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};