var globalData = {};
var globalType = "android";


$(document).ready(function () {
    initLocalData();
    initUi();
    initBtnEvent();
    $("#dtRd").datetimepicker({
        "format": "YYYY/MM/DD"
    });
    $("#versionListMenu a").first().click();
});

initBtnEvent = function () {
    $("#versionListMenu a").on("click", function (e) {
        e.preventDefault();
        $("#versionListMenu a").removeClass("myActive");
        $(this).addClass("myActive");
        updateData($(this).attr("href"));
    });

    $("#versionAddNav a").on("click", function (e) {
        e.preventDefault();
        storeData();
        $("#versionAddNav li").removeClass("active");
        $(this).parent().addClass("active");
        globalType = $(this).attr("href");
        refreshUI();
    });
    $("#forceUpdate").bootstrapSwitch('onSwitchChange', function (event, state) {
        if (globalType === "android") {
            if (state === globalData.android.forceUpdate) {
                return;
            }
            globalData.android.forceUpdate = !globalData.android.forceUpdate;
        } else if (globalType === "ios") {
            if (state === globalData.ios.forceUpdate) {
                return;
            }
            globalData.ios.forceUpdate = !globalData.ios.forceUpdate;
        }
    });
    $("#current").bootstrapSwitch('onSwitchChange', function (event, state) {
        if (globalType === "android") {
            if (state === globalData.android.current) {
                return;
            }
            globalData.android.current = !globalData.android.current;
        } else if (globalType === "ios") {
            if (state === globalData.ios.current) {
                return;
            }
            globalData.ios.current = !globalData.ios.current;
        }
    });
    $("#submit").on("click", function (e) {
        if ($("#name").val().length === 0) {
            window.alert("请填写版本号");
            $("#name").focus();
            return;
        }
        globalData.android.name = $("#name").val();
        globalData.ios.name = $("#name").val();
        storeData();
        var sendData = [];
        if (typeof globalData.android.url !== "undefined" && globalData.android.url.length > 0) {
            sendData.push(globalData.android);
        }
        if (typeof globalData.ios.url !== "undefined" && globalData.ios.url.length > 0) {
            sendData.push(globalData.ios);
        }
        if (sendData.length > 0) {
            $.ajax({
                type: "POST",
                url: GlobalRootPath + "/version/update",
                data: JSON.stringify({"sendData": sendData}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (resData) {
                    console.log(JSON.stringify(resData));
                    if (resData.code !== "0") {
                        return;
                    }
                    console.log("ok");
                    $("#alert").removeClass("my-alert-danger");
                    $("#alert").addClass("my-alert-success");
                    $("#alert").html("修改成功");
                    $("#alert").slideToggle(300, function () {
                        setTimeout(function () {
                            $("#alert").slideToggle(300);
                        }, 3000);
                    });
                },
                failure: function (errMsg) {
                    window.alert(errMsg);
                    console.log("Failed:" + msg);
                    $("#alert").removeClass("my-alert-success");
                    $("#alert").addClass("my-alert-danger");
                    $("#alert").html("<strong>出现错误</strong>：" + msg);
                    $("#alert").slideToggle(300, function () {
                        setTimeout(function () {
                            $("#alert").slideToggle(300);
                        }, 3000);
                    });
                }
            });
        } else {
            window.alert("没有修改成功");
            return;
        }
    });
    $("#cancel").on("click", function (e) {
        if (window.confirm("您确定放弃已经填写的内容么？")) {
            initLocalData();
            clearUI();
        }
    });
};

updateData = function (versionName) {
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/version/getSome",
        data: JSON.stringify({"name": versionName}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            console.log(JSON.stringify(resData));
            if (resData.code !== "0") {
                return;
            }
            handleRecvData(resData.data);
            refreshUI();
        },
        failure: function (errMsg) {

        }
    });
};

handleRecvData = function (recvData) {
    for (var i = 0; i < recvData.length; i++) {
        var item = recvData[i];
        console.log(JSON.stringify(item));
        if (item.type === "android") {
            globalData.android.name = item.name;
            globalData.ios.name = item.name;
            globalData.android.url = item.url;
            globalData.android.memo = item.memo;
            globalData.android.size = item.size;
            globalData.android.code = item.code;
            globalData.android.releaseDate = item.releaseDate;
            globalData.android.forceUpdate = item.forceUpdate;
            globalData.android.current = item.current;
        }
        if (item.type === "ios") {
            globalData.android.name = item.name;
            globalData.ios.name = item.name;
            globalData.ios.url = item.url;
            globalData.ios.size = item.size;
            globalData.ios.code = item.code;
            globalData.ios.memo = item.memo;
            globalData.ios.releaseDate = item.releaseDate;
            globalData.ios.forceUpdate = item.forceUpdate;
            globalData.ios.current = item.current;
        }
    }

};

initLocalData = function () {
    globalData.android = {};
    globalData.ios = {};
    globalData.android.name = "";
    globalData.ios.name = "";
    globalData.android.url = "";
    globalData.ios.url = "";
    globalData.android.size = "";
    globalData.ios.size = "";
    globalData.android.code = "";
    globalData.ios.code = "";
    globalData.android.type = "android";
    globalData.ios.type = "ios";
    globalData.android.releaseDate = "";
    globalData.ios.releaseDate = "";
    globalData.android.forceUpdate = false;
    globalData.ios.forceUpdate = false;
    globalData.android.current = false;
    globalData.ios.current = false;
    globalData.android.memo = "";
    globalData.ios.memo = "";
    globalType = "android";
};

initUi = function () {
    $("#forceUpdate").bootstrapSwitch({'offColor': "danger", "size": "small", "state": false});
    $("#current").bootstrapSwitch({'offColor': "danger", "size": "small", "state": false});
};

refreshUI = function () {
    if (globalType === "android") {
        $("#name").val(globalData.android.name);
        $("#url").val(globalData.android.url);
        $("#memo").val(globalData.android.memo);
        $("#size").val(globalData.android.size);
        $("#code").val(globalData.android.code);
        $("#releaseDate").val(globalData.android.releaseDate);
        console.log(JSON.stringify(globalData.android));
        $("#forceUpdate").bootstrapSwitch("state", globalData.android.forceUpdate);
        $("#current").bootstrapSwitch('state', globalData.android.current);
    } else if (globalType === "ios") {
        $("#name").val(globalData.ios.name);
        $("#url").val(globalData.ios.url);
        $("#memo").val(globalData.ios.memo);
        $("#size").val(globalData.ios.size);
        $("#code").val(globalData.ios.code);
        $("#releaseDate").val(globalData.ios.releaseDate);
        console.log(JSON.stringify(globalData.ios));
        $("#forceUpdate").bootstrapSwitch("state", globalData.ios.forceUpdate);
        $("#current").bootstrapSwitch('state', globalData.ios.current);
    }
};

clearUI = function () {
    $("#name").val("");
    $("#url").val("");
    $("#size").val("");
    $("#code").val("");
    $("#releaseDate").val("");
    $("#memo").val("");
    $("#forceUpdate").bootstrapSwitch("state", false);
    $("#current").bootstrapSwitch('state', false);
};

storeData = function () {
    if (globalType === "android") {
        globalData.android.name = $("#name").val();
        globalData.android.url = $("#url").val();
        globalData.android.size = $("#size").val();
        globalData.android.code = $("#code").val();
        globalData.android.memo = $("#memo").val();
        globalData.android.releaseDate = $("#releaseDate").val();
    } else if (globalType === "ios") {
        globalData.ios.name = $("#name").val();
        globalData.ios.code = $("#code").val();
        globalData.ios.size = $("#size").val();
        globalData.ios.url = $("#url").val();
        globalData.ios.memo = $("#memo").val();
        globalData.ios.releaseDate = $("#releaseDate").val();
    }
};