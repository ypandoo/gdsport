'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.logger = undefined;
exports.configureLogger = configureLogger;
exports.addGroup = addGroup;

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _winstonDailyRotateFile = require('winston-daily-rotate-file');

var _winstonDailyRotateFile2 = _interopRequireDefault(_winstonDailyRotateFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LOGS_FOLDER = './logs/';

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    LOGS_FOLDER = './test_logs/';
}

LOGS_FOLDER = process.env.PARSE_SERVER_LOGS_FOLDER || LOGS_FOLDER;

var currentLogsFolder = LOGS_FOLDER;

function generateTransports(level) {
    var transports = [new _winstonDailyRotateFile2.default({
        filename: 'parse-server.info',
        dirname: currentLogsFolder,
        name: 'parse-server',
        json: false,
        stringify: true,
        prettyPrint: true,
        timestamp: true,
        humanReadableUnhandledException: true,
        level: level
    }), new _winstonDailyRotateFile2.default({
        filename: 'parse-server.err',
        dirname: currentLogsFolder,
        name: 'parse-server-error',
        json: false,
        stringify: true,
        prettyPrint: true,
        timestamp: true,
        humanReadableUnhandledException: true,
        level: 'error'
    })];
    if (!process.env.TESTING || process.env.VERBOSE) {
        transports = [new _winston2.default.transports.Console({
            colorize: true,
            level: level
        })].concat(transports);
    }
    return transports;
}

var logger = new _winston2.default.Logger();

function configureLogger(_ref) {
    var logsFolder = _ref.logsFolder,
        _ref$level = _ref.level,
        level = _ref$level === undefined ? _winston2.default.level : _ref$level;

    _winston2.default.level = level;
    logsFolder = logsFolder || currentLogsFolder;

    if (!_path2.default.isAbsolute(logsFolder)) {
        logsFolder = _path2.default.resolve(process.cwd(), logsFolder);
    }
    try {
        _fs2.default.mkdirSync(logsFolder);
    } catch (exception) {
        // Ignore, assume the folder already exists
    }
    currentLogsFolder = logsFolder;

    logger.configure({
        transports: generateTransports(level)
    });
}

configureLogger({ logsFolder: LOGS_FOLDER });

function addGroup(groupName) {
    var level = _winston2.default.level;
    var transports = generateTransports().concat(new _winstonDailyRotateFile2.default({
        filename: groupName,
        dirname: currentLogsFolder,
        name: groupName,
        level: level
    }));

    _winston2.default.loggers.add(groupName, {
        transports: transports
    });
    return _winston2.default.loggers.get(groupName);
}

exports.logger = logger;
exports.default = logger;