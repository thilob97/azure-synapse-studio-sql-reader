const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

/**
 * @class Folder
 * @description Represent a folder
 */
class Folder {
    constructor(name) {
        this.name = name;
        this.files = [];
    }
}

/**
 * @class File
 * @description Represent a file
 */
class File {
    constructor(name, path) {
        this.name = name;
        this.path = path;
    }
}

/**
 * @class FolderTreeDataProvider
 * @description Provide the data for the folder tree view
 */
class FolderTreeDataProvider {
    constructor(folderPath) {
        this.folderPath = folderPath;
        this.folders = {};
    }

    /**
     * @param {vscode.TreeItem} element
     * @returns {Promise<vscode.TreeItem[]>}
     * @description Get the children of the element
     */
    async getChildren(element) {
        if (!element) {
            await this.readAndOrganizeFiles();
            return Object.values(this.folders).map(folder => new Folder(folder.name));
        } else if (element instanceof Folder) {
            return this.folders[element.name].files.map(file => new File(file.name, file.path));
        }
    }

    /**
     * @param {vscode.TreeItem} element
     * @returns {vscode.TreeItem}
     * @description Get the tree item of the element
     */
    getTreeItem(element) {
        if (element instanceof Folder) {
            return new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.Collapsed);
        } else if (element instanceof File) {
            const treeItem = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
            treeItem.command = {
                command: 'vscode.open',
                title: "Open File",
                arguments: [vscode.Uri.file(element.path)]
            };
            treeItem.tooltip = `Open ${element.name}`;
            treeItem.iconPath = new vscode.ThemeIcon('file');
            return treeItem;
        }
    }

    /**
     * @returns {Promise<void>}
     * @description Read and organize the files in the folder
     */
    async readAndOrganizeFiles() {
        const files = await fs.readdir(this.folderPath);
        for (let fileName of files) {
            const filePath = path.join(this.folderPath, fileName);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const json = JSON.parse(content);
                const folderName = json.properties?.folder?.name;
                const name = json.name;
                if (folderName && name) {
                    if (!this.folders[folderName]) {
                        this.folders[folderName] = new Folder(folderName);
                    }
                    this.folders[folderName].files.push(new File(name, filePath));
                }
            } catch (error) {
                console.error(`Failure to read file: ${fileName}: ${error}`);
            }
        }
    }
}

module.exports = FolderTreeDataProvider;
