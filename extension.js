// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

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
					openQueryInNewTab(jsonContent.properties.content.query);
				} else {
					vscode.window.showErrorMessage('Das JSON-Format entspricht nicht dem erwarteten Format.');
				}
			} catch (e) {
				vscode.window.showErrorMessage('Fehler beim Parsen der JSON-Datei.');
			}
		}
	});

	context.subscriptions.push(disposable);
}

function isValidJsonFormat(jsonContent) {
	// Überprüfe das JSON-Format. Dies ist eine sehr grundlegende Überprüfung.
	// Du kannst diese Funktion erweitern, um spezifischere Überprüfungen basierend auf deinen Anforderungen durchzuführen.
	return jsonContent.hasOwnProperty('name') &&
		jsonContent.hasOwnProperty('properties') &&
		jsonContent.properties.hasOwnProperty('folder') &&
		jsonContent.properties.hasOwnProperty('content') &&
		jsonContent.properties.content.hasOwnProperty('query') &&
		jsonContent.properties.hasOwnProperty('type');
}

async function openQueryInNewTab(query) {
	// Erstellt ein neues unsichtbares Textdokument
	const document = await vscode.workspace.openTextDocument({ content: query, language: 'sql' });
	// Öffnet das Dokument in einem neuen Editor-Tab
	await vscode.window.showTextDocument(document, { preview: false });
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};