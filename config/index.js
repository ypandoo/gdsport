const os = require('os')
const env = process.env.GDSPORT2_ENV;
const env_db = process.env.GDSPORT2_DB_ENV;
const db_conn_string = process.env.GDSPORT2_DB_CONN_URL;
const env_port = process.env.GDSPORT2_PORT;
const log_level = process.env.LOG_LEVEL;

const disable_dashboard = process.env.DISABLE_DASHBOARD;

const disable_adminui = process.env.DISABLE_ADMINUI;

const disable_apiservice = process.env.DISABLE_APISERVICE;


const appId = process.env.APP_ID;
const masterKey = process.env.MASTER_KEY;
const serverURL = process.env.SERVER_URL


const mountPath = process.env.GDSPORT2_MOUNT;
const serverId = process.env.SERVER_ID || os.hostname();


var db, cfg, protocol;


// env specific config
if (env) {
    cfg = require('./env/' + env);
} else {
    console.log('ERROR: Kindly set the environment variable GDSPORT2_ENV')
}

//DB specific configuration
if (db_conn_string) {
    db = db_conn_string;
} else if (env_db) {
    db = require('./database/' + env_db).db_connection_string;
} else {
    console.log('ERROR : Kindly set the environment variables GDSPORT2_DB_ENV or GDSPORT2_DB_CONN_URL');
}

cfg.env = env;
cfg.db = db;
cfg.log_level = (log_level + "").toLowerCase();

cfg.server_id=serverId;
cfg.disable_dashboard = disable_dashboard;
cfg.disable_apiservice = disable_apiservice;
cfg.disable_adminui = disable_adminui;


if (env_port) {
    cfg.port = env_port;
}
if (appId) {
    cfg.app_id = appId;
}
if (masterKey) {
    cfg.master_key = masterKey;
}
if (serverURL) {
    cfg.server_url = serverURL;
}

if (mountPath) {
    cfg.mount_path = mountPath;
}

module.exports = cfg;