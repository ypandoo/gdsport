var logger = (function () {
    var logLevels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        trace: 4
    },
    currentLogLevel = logLevels.debug, // default log level. One of: debug, info, warn or error. Applied to transports File and Console
            winston = require('winston'),
            fs = require('fs'),
            mkdirp = require('mkdirp'),
            folder = require('../../config/constants').LOGS_FOLDER;
    logDir = (mkdirp.sync(folder) ? folder : mkdirp.sync(folder)), // Log into "logs" dir if it exists
            //logDir = (fs.existsSync(folder) ? folder : fs.mkdirSync(folder)),     // Log into "logs" dir if it exists
            json = false, // JSON is required for querying logs. Useful for live.

            config = {
                levels: logLevels,
                colors: {
                    debug: 'magenta',
                    info: 'green',
                    warn: 'yellow',
                    error: 'red',
                    trace: 'saffron'
                }
            },
    winston.addColors(config.colors); // Make winston aware of these colors
    var _logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                level: Object.keys(config.levels)[config.levels.debug]}),
            new (winston.transports.File)({
                filename: logDir === null ? (fs.existsSync(folder) ? folder : fs.mkdirSync(folder)) + '/log_' + new Date().getDate() + '_' + new Date().getMonth() + '_' + new Date().getFullYear() + ".txt" :
                        logDir + '/log_' + new Date().getDate() + '_' + new Date().getMonth() + '_' + new Date().getFullYear() + ".txt",
                json: json,
                level: Object.keys(config.levels)[config.levels.debug],
                prettyPrint: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: true,
                zippedArchive: true,
                logstash: true,
                tailable: true})
        ],
        levels: config.levels
    });

    // This must be exposed on the web server. See server.js
    function updateLogLevel(level) {
        this.currentLogLevel = config.levels[level];
    }
    ;

    // Wrap original loggers in order to filter log level according to the one we set dynamically
    function log() {
        if (config.levels[arguments[0]] >= this.currentLogLevel) {
            _logger.log.apply(_logger, arguments);
            return true;
        }
        return false;
    }
    ;

    function error() {
        _logger.error.apply(_logger, arguments);
    }
    ;

    return {log: log,
        error: error,
        updateLogLevel: updateLogLevel,
        currentLogLevel: currentLogLevel,
        logLevels: logLevels        // exposed for testing only
    };


})();
