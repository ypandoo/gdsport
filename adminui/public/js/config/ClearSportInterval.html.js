var aliasName = "ClearSportInterval";
var destId = "configValue";
var commonConfig = new CommonConfig();
var name = "清除运动数据周期";

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

/*var globalClearSportIntervalData = "";
var globalClearSportIntervalAlias = "ClearSportInterval";
var globalClearSportIntervalName = "清除运动数据周期";
$(document).ready(function () {
    initData();
    // $("#chk").on("change", function () {
    //     console.log($(this).is(":checked"));
    // });
    $("#submit").on("click", function () {
        updateData();
    });
});

initData = function () {
    $.ajax({
        type: "POST",
        url: "/config/getOne",
        data:
        JSON.stringify({
            alias: globalClearSportIntervalAlias
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            if (resData.code !== "0") {
                globalClearSportIntervalData = "";
                return;
            } else {
                globalClearSportIntervalData = resData.data.value;
            }
            console.log(globalClearSportIntervalData);
            $("#sportUploadInterval").val(globalClearSportIntervalData);
        },
        failure: function (errMsg) {
            //alert(errMsg);
        }
    });
};

updateData = function () {
    globalClearSportIntervalData = $("#sportUploadInterval").val();
    $.ajax({
        type: "POST",
        url: "/config/getOne",
        data:
        JSON.stringify({
            alias: globalClearSportIntervalAlias
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
    var newValue = globalClearSportIntervalData;
    $.ajax({
        type: "POST",
        url: "/config/add",
        data:
        JSON.stringify({
            name: globalClearSportIntervalName,
            alias: globalClearSportIntervalAlias,
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
    var newValue = globalClearSportIntervalData;
    $.ajax({
        type: "POST",
        url: "/config/update",
        data:
        JSON.stringify({
            name: globalClearSportIntervalName,
            alias: globalClearSportIntervalAlias,
            value: newValue
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            initData();
            $("#retNotice").removeClass("lable-danger");
            $("#retNotice").removeClass("lable-success");
            $("#retNotice").addClass("label-success");
            $("#retNotice").html("修改成功");
            $("#retNoticeOuter").slideToggle("fast", function () {
                setTimeout(function () {
                    $("#retNoticeOuter").slideToggle("fast");
                }, 5000);
            });
        },
        failure: function (errMsg) {
            $("#retNotice").removeClass("lable-danger");
            $("#retNotice").removeClass("lable-success");
            $("#retNotice").addClass("label-danger");
            $("#retNotice").html("修改失败");
            $("#retNoticeOuter").slideToggle("fast", function () {
                setTimeout(function () {
                    $("#retNoticeOuter").slideToggle("fast");
                }, 5000);
            });
        }
    });
};
*/