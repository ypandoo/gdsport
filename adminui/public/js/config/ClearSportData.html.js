
var aliasName = "ClearSportData";
var destId = "configValue";
var commonConfig = new CommonConfig();
var name = "清除运动数据";

$(document).ready(function () {
    initUi();
    initEvent();
});

initEvent = function () {
    $("#submit").on("click", function () {
        commonConfig.add(aliasName, name, destId, function (code, msg) {
            if (code === "0") {
                console.log("ok");
                $("#alert").removeClass("my-alert-danger");
                $("#alert").addClass("my-alert-success");
                $("#alert").html("修改成功");
                $("#alert").slideToggle(300, function () {
                    setTimeout(function () {
                        $("#alert").slideToggle(300);
                    }, 800);
                });
            } else {
                console.log("Failed:" + msg);
                $("#alert").removeClass("my-alert-success");
                $("#alert").addClass("my-alert-danger");
                $("#alert").html("<strong>出现错误</strong>：" + msg);
                $("#alert").slideToggle(300, function () {
                    setTimeout(function () {
                        $("#alert").slideToggle(300);
                    }, 800);
                });
            }
        });
    });

    $("#cancel").on("click", function () {
        $("#configValue").val(commonConfig.orig);
    });
};

initUi = function () {
    commonConfig.initData(aliasName, destId);
};

/*
var globalClearSportData = false;
var globalClearSportAlias = "ClearSportData";
var globalClearSportName = "清除运动数据";
$(document).ready(function () {
    $("#chbox").bootstrapSwitch('offColor', "danger");
    initData();
});

initData = function () {
    $.ajax({
        type: "POST",
        url: "/config/getOne",
        data:
        JSON.stringify({
            alias: globalClearSportAlias
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            if (resData.code !== "0") {
                globalClearSportData = false;
            } else {
                globalClearSportData = resData.data.value == 0 ? false : true;
            }
            console.log(globalClearSportData);
            $("#chbox").bootstrapSwitch('state', globalClearSportData);
            $("#chbox").bootstrapSwitch('onSwitchChange', function (event, state) {
                if (state === globalClearSportData) {
                    return;
                }
                var notice = "开启";
                if (globalClearSportData) {
                    notice = "关闭";
                }
                if (window.confirm("您需要" + notice + "该配置项么？")) {
                    globalClearSportData = !globalClearSportData;
                    $("#chbox").bootstrapSwitch('state', globalClearSportData);
                    updateData();
                } else {
                    $("#chbox").bootstrapSwitch('state', globalClearSportData);
                }
            });
        },
        failure: function (errMsg) {
            //alert(errMsg);
        }
    });
};

updateData = function () {
    $.ajax({
        type: "POST",
        url: "/config/getOne",
        data:
        JSON.stringify({
            alias: globalClearSportAlias
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            if (resData.code !== "0") {
                addNewData();
            } else {
                updateNewData();
            }
        },
        failure: function (errMsg) {
            //alert(errMsg);
        }
    });
};

addNewData = function () {
    var newValue = globalClearSportData ? 1 : 0;
    $.ajax({
        type: "POST",
        url: "/config/add",
        data:
        JSON.stringify({
            name: globalClearSportName,
            alias: globalClearSportAlias,
            value: newValue
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            if (resData.code !== "0") {
                addNewData();
            } else {
                updateNewData();
            }
        },
        failure: function (errMsg) {
            //alert(errMsg);
        }
    });
};

updateNewData = function () {
    var newValue = globalClearSportData ? 1 : 0;
    $.ajax({
        type: "POST",
        url: "/config/update",
        data:
        JSON.stringify({
            name: globalClearSportName,
            alias: globalClearSportAlias,
            value: newValue
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            initData();
        },
        failure: function (errMsg) {
            //alert(errMsg);
        }
    });
};
*/