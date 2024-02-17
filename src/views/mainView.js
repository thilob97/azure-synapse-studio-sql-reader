const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

class FolderTreeDataProvider {
    constructor(folderPath) {
        this.folderPath = folderPath;
    }

    async getChildren(element) {
        if (!element) {
            // Kein Element bedeutet, dass wir die Wurzelelemente (Top-Level-Ordner und -Dateien) holen
            const files = await fs.readdir(this.folderPath);
            return files.map(file => ({
                resourceUri: vscode.Uri.file(path.join(this.folderPath, file)),
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
            }));
        } else {
            // Element vorhanden, hole Kind-Elemente (wenn Ordner)
            const stat = await fs.stat(element.resourceUri.fsPath);
            if (stat.isDirectory()) {
                const files = await fs.readdir(element.resourceUri.fsPath);
                return files.map(file => ({
                    resourceUri: vscode.Uri.file(path.join(element.resourceUri.fsPath, file)),
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
                }));
            }
            return []; // Dateien haben keine Kinder
        }
    }

    getTreeItem(element) {
        // Erstelle TreeItem aus dem Element
        return new vscode.TreeItem(element.resourceUri, element.collapsibleState);
    }
}

module.exports = FolderTreeDataProvider;
