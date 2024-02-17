const cmdCheckSqlHeader = require('./fileCommands/cmdCheckSqlHeader');
const cmdOpenQueryInNewTab = require('./fileCommands/cmdOpenQueryInNewTab');
const cmdSaveToJson = require('./fileCommands/cmdSaveToJson');
const cmdSetFolderPath = require('./setupCommands/cmdSetFolderPath');
const cmdGetFolderPath = require('./setupCommands/cmdGetFolderPath');

module.exports = {
    cmdGetFolderPath,
    cmdSetFolderPath,
    cmdCheckSqlHeader,
    cmdOpenQueryInNewTab,
    cmdSaveToJson
};
