/** 
 * Check if the given SQL text contains the header
 * @param {string} sqlText
 * @returns {boolean}
 */
function headerExists(sqlText) {
    const headerLine1 = "/* Dieser SQL-Query wurde aus einer JSON-Datei generiert    */";
    const headerLine2 = "/* mit Hilfe der vscode-Erweiterung azure-synapse-studio-sql */";

    return sqlText.includes(headerLine1) && sqlText.includes(headerLine2);
}

/**
 * Check if the given JSON object has the correct format
 * @param {object} jsonContent 
 * @returns {boolean}
 */
function isValidJsonFormat(jsonContent) {
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
