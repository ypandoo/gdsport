CommonConfig = function () {

};

CommonConfig.prototype.orig = "";
CommonConfig.prototype.destId = "";
CommonConfig.prototype.cb = null;
CommonConfig.prototype.aliasName = "";
CommonConfig.prototype.name = "";


/**
 * 
 * @param {type} aliasName
 * @param {type} destId the UI dest element id
 * @returns {undefined}
 */
CommonConfig.prototype.initData = function (aliasName, destId) {
    console.log(aliasName);
    var theInst = this;
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/config/getOne",
        data: JSON.stringify({"alias": aliasName}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            console.log(JSON.stringify(resData));
            if (resData.code !== "0") {
                return;
            }
            var data = resData.data.value;
            var destIdVal = "#" + destId;
            theInst.orig = data;
            $(destIdVal).val(data);
        },
        failure: function (errMsg) {
            alert(errMsg);
        }
    });
};

/**
 * 
 * @param {type} aliasName
 * @param {type} name
 * @param {type} destId
 * @param {type} cb callback
 * @returns {undefined}
 */
CommonConfig.prototype.add = function (aliasName, name, destId, cb) {
    var theInst = this;
    this.destId = destId;
    this.cb = cb;
    this.aliasName = aliasName;
    this.name = name;
    var destIdVal = "#" + destId;
    var utilJson = new UtilJson();
    if ($(destIdVal).val() === null || $(destIdVal).val().length === 0) {
        cb("-2", "配置项值为空");
        return;
    }
    if (utilJson.hasChnSign($(destIdVal).val())) {
        cb("-3", "配置项中有中文标点，无法保存");
        return;
    }
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/config/getOne",
        data:
                JSON.stringify({
                    alias: aliasName
                }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            if (resData.code !== "0") {
                theInst.addNew();
            } else {
                theInst.update();
            }
        },
        failure: function (errMsg) {
            theInst.cb("-4", errMsg);
        }
    });
    return;
};

/**
 * 
 * @returns {undefined}
 */
CommonConfig.prototype.addNew = function () {
    var theInst = this;
    var destIdVal = "#" + this.destId;
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/config/add",
        data:
                JSON.stringify({
                    name: theInst.name,
                    value: $(destIdVal).val(),
                    alias: theInst.aliasName
                }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            if (resData.code !== "0") {
                theInst.cb("-5", "数据库写入失败");
            } else {
                theInst.orig = $(destIdVal).val();
                theInst.cb("0", "");
            }
        },
        failure: function (errMsg) {
            theInst.cb("-5", "数据库写入失败" + errMsg);
        }
    });
};


/**
 * 
 * @returns {undefined}
 */
CommonConfig.prototype.update = function () {
    var theInst = this;
    var destIdVal = "#" + this.destId;
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/config/update",
        data:
                JSON.stringify({
                    name: theInst.name,
                    value: $(destIdVal).val(),
                    alias: theInst.aliasName
                }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            console.log("recv from the add new city:" + JSON.stringify(resData));
            if (resData.code !== "0") {
                theInst.cb("-5", "数据库写入失败");
            } else {
                theInst.orig = $(destIdVal).val();
                theInst.cb("0", "");
            }
        },
        failure: function (errMsg) {
            theInst.cb("-5", "数据库写入失败:" + errMsg);
        }
    });
};

