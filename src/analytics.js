function headerExists(sqlText) {
    const headerLine1 = "/* Dieser SQL-Query wurde aus einer JSON-Datei generiert    */";
    const headerLine2 = "/* mit Hilfe der vscode-Erweiterung azure-synapse-studio-sql */";

    return sqlText.includes(headerLine1) && sqlText.includes(headerLine2);
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


module.exports = {
    headerExists,
    isValidJsonFormat
};
