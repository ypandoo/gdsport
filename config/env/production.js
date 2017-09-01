//here we will configure the port and logging for the application
var production = {
    "port": 20388,
    "greeting": "Local Environment",
    "loglevel": {
        "level": "info",
        "stdout": false
    },
    "cloud": {

    },
    "eventbus": "http://127.0.0.1:20081/eventbus/",
    "app_id": "appworld-gdsport",
    "master_key": "XXXXXX",
    "mount_path": "/parse",
    "server_url": "http://127.0.0.1:20388/parse",
    "dashboard_users": [{
            "user": "test",
            "pass": "111111"
        },
        {
            "user": "user2",
            "pass": "pass"
        }
    ],
    "parse_keys": {
        "applicationId": "appworld-gdsport",
        "clientKey": "XXXXXX"
    },
    "gdsport_keys": {
        "applicationId": "appworld-gdsport",
        "apiKey": "XXXXXX"
    }
}

module.exports = production;