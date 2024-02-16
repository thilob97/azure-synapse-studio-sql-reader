const vscode = require('vscode');
const commands = require('./commands');
const utils = require('./utils');

let originalJsonUri;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.workspace.onDidOpenTextDocument(document => {
		if (document.languageId === 'json' && document.uri.scheme === 'file') {
			try {
				const jsonContent = JSON.parse(document.getText());
				if (utils.validationUtils.isValidJsonFormat(jsonContent)) {
					vscode.window.showInformationMessage('Das JSON-Format ist korrekt.');
					originalJsonUri = document.uri;
					if (utils.validationUtils.headerExists(document.getText())) {
						vscode.window.showInformationMessage('Azure Synapse Studio SQL-Header erkannt.');
						const sqlQueryWithComments = `${jsonContent.properties.content.query}`;
						utils.openSqlTabUtils.openQueryInNewTab(sqlQueryWithComments);
					} else {
						vscode.window.showInformationMessage('Azure Synapse Studio SQL-Header nicht erkannt.');
						const metaDataString = utils.headerGeneratorUtils.generateSqlComment(jsonContent, originalJsonUri);
						const sqlQueryWithComments = `${metaDataString}\n\n${jsonContent.properties.content.query}`;
						utils.openSqlTabUtils.openQueryInNewTab(sqlQueryWithComments);
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
			const { metadata, query } = utils.parserUtils.parseSqlCommentsToMetadata(sqlText);

			// Überprüfe, ob der Pfad der Original-JSON-Datei in den Metadaten enthalten ist
			if (metadata && metadata.originalFilePath) {
				// Aktualisiere das ursprüngliche JSON-Dokument mit den neuen Informationen
				utils.parserUtils.updateJsonFileWithSqlQuery(metadata, query).catch(err => {
					vscode.window.showErrorMessage('Fehler beim Aktualisieren der JSON-Datei: ' + err.message);
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