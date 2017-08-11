var GlobalParam = {};
GlobalParam.toAndroid = true;
GlobalParam.toIOS = true;
GlobalParam.alert = "";
GlobalParam.androidAlert = {};
GlobalParam.iosAlert = {};
GlobalParam.message = {};
GlobalParam.message.title = "";
GlobalParam.message.msg_content = "";
GlobalParam.extraMessage = {};
GlobalParam.timeToLive = 86400;
GlobalParam.apnsProduction = true;
GlobalParam.bigPushDuration = 0;
$(document).ready(function () {
    initEvent();
    initUiValue();
    $("#platform").multiselect();
    $("#alertType").multiselect();
    $("#pushSelect").multiselect();
    $("#apnsProduction").multiselect();
    $("#isBigPush").multiselect();
    $("#hasExtraMsg").multiselect();
});
initEvent = function () {
    $("#alertType").on("change", function () {
        switch ($("#alertType").val()) {
            case "all":
                $("#alertSpan").show();
                $("#alertSpan1").hide();
                break;
            case "def":
                $("#alertSpan1").show();
                $("#alertSpan").hide();
                break;
        }
    });
    $("#hasExtraMsg").on("change", function () {
        switch ($("#hasExtraMsg").val()) {
            case "0":
                $("#extraMsgSpan").hide();
                break;
            case "1":
                $("#extraMsgSpan").show();
                break;
        }
    });
    $("#isBigPush").on("change", function () {
        switch ($("#isBigPush").val()) {
            case "0":
                $("#bigPushSpan").hide();
                break;
            case "1":
                $("#bigPushSpan").show();
                break;
        }
    });
    $('[data-toggle="popover"]').popover({trigger: 'click', 'placement': 'bottom', "html": true});
    $("#submit").on("click", function () {
        if (validateData()) {
            console.log(JSON.stringify(GlobalParam));
            send2All();
        }
    });
};
initUiValue = function () {
    var hintAndroidAlert = "{<br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;\"alert\" : \"hello, JPush!\",<br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;\"title\" : \"JPush test\", <br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;\"builder_id\" : 3, <br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;\"extras\" : {<br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"news_id\" : 134, <br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"my_key\" : \"a value\"<br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br/>" +
        "}<br/>" +
        "<a href=\"http://docs.jiguang.cn/jpush/server/push/rest_api_v3_push/#notification\" target=\"blank\">Doumentations</a>";
    $("#popoverAndroidAlert").attr("data-content", hintAndroidAlert);
    var hintIosAlert = "{<br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;\"alert\" : \"hello, JPush!\",<br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;\"sound\" : \"sound.caf\", <br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;\"badge\" : 1, <br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;\"extras\" : {<br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"news_id\" : 134, <br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"my_key\" : \"a value\"<br/>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br/>" +
        "}<br/>" +
        "<a href=\"http://docs.jiguang.cn/jpush/server/push/rest_api_v3_push/#notification\" target=\"blank\">Doumentations</a>";
    $("#popoverIosAlert").attr("data-content", hintIosAlert);
    var hintExtraMessage = "JSON 格式的可选参数<br/>" +
        "<a href=\"http://docs.jiguang.cn/jpush/server/push/rest_api_v3_push/#message\" target=\"blank\">Doumentations</a>";
    $("#popoverExtraMsg").attr("data-content", hintExtraMessage);
};
validateData = function () {
    GlobalParam.message.title = $("#title").val();
    GlobalParam.message.msg_content = $("#msgContent").val();
    switch ($("#platform").val()) {
        case "all":
            GlobalParam.toAndroid = true;
            GlobalParam.toIOS = true;
            break;
        case "android":
            GlobalParam.toAndroid = true;
            GlobalParam.toIOS = false;
            break;
        case "ios":
            GlobalParam.toAndroid = false;
            GlobalParam.toIOS = true;
            break;
    }

    switch ($("#alertType").val()) {
        case "all":
            GlobalParam.androidAlert = {};
            GlobalParam.iosAlert = {};
            if ($("#alert").val().length === 0) {
                GlobalParam.alert = "";
            } else {
                GlobalParam.alert = $("#alert").val();
            }
            break;
        case "def":
            GlobalParam.alert = "";
            if ($("#androidAlert").val().length === 0) {
                GlobalParam.androidAlert = {};
            } else {
                try {
                    var androidAlert = JSON.parse($("#androidAlert").val());
                    GlobalParam.androidAlert = androidAlert;
                } catch (e) {
                    window.alert("请确保您输入的Android Alert是JSON Object.");
                    return false;
                }
            }
            if ($("#iosAlert").val().length === 0) {
                GlobalParam.iosAlert = {};
            } else {
                try {
                    var iosAlert = JSON.parse($("#iosAlert").val());
                    GlobalParam.iosAlert = iosAlert;
                } catch (e) {
                    window.alert("请确保您输入的IOS Alert是JSON Object.");
                    return false;
                }
            }
            break;
    }
    switch ($("#hasExtraMsg").val()) {
        case "0":
            GlobalParam.extraMessage = {};
            break;
        case "1":
            if ($("#extraMsg").val().length === 0) {
                GlobalParam.extraMessage = {};
            } else {
                try {
                    var eM = JSON.parse($("#extraMsg").val());
                    GlobalParam.extraMessage = eM;
                } catch (e) {
                    window.alert("请确认您填写的Extra Message 是 JSON object");
                    return false;
                }
            }
            break;
    }
    if ($("#timeToLive").val().length === 0) {
        GlobalParam.timeToLive = 86400;
    } else {
        console.log(parseInt($("#timeToLive").val()).toString());
        if (parseInt($("#timeToLive").val()).toString() === "NaN") {
            console.log("step1");
            GlobalParam.timeToLive = 86400;
        } else {
            console.log("step2");
            GlobalParam.timeToLive = parseInt($("#timeToLive").val());
        }
    }

    switch ($("#apnsProduction").val()) {
        case "0":
            GlobalParam.apnsProduction = false;
            break;
        case "1":
            GlobalParam.apnsProduction = true;
            break;
    }

    switch ($("#isBigPush").val()) {
        case "0":
            GlobalParam.bigPushDuration = 0;
            break;
        case "1":
            if ($("#bigPushDuration").val().length === 0) {
                GlobalParam.bigPushDuration = 0;
            } else {
                if (parseInt($("#bigPushDuration").val()) === "NaN") {
                    window.alert("请确保您填写的缓慢推送时间为整数.");
                    return false;
                }
                GlobalParam.bigPushDuration = parseInt($("#bigPushDuration").val());
            }
            break;
    }
    return true;
};
send2All = function () {
    $("#submit").attr("disabled", true);
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/push/sendToAll",
        data: JSON.stringify({"sendData": GlobalParam}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            console.log(JSON.stringify(resData));
            if (resData.code !== "0") {
                return;
            }
            console.log("ok");
            $("#myAlert").removeClass("my-alert-danger");
            $("#myAlert").addClass("my-alert-success");
            $("#myAlert").html("推送成功！");
            $("#myAlert").slideToggle(300, function () {
                setTimeout(function () {
                    $("#myAlert").slideToggle(300);
                    //$("#submit").removeAttr("disabled");
                }, 3000);
            });
        },
        failure: function (errMsg) {
            window.alert(errMsg);
            console.log("Failed:" + msg);
            $("#myAlert").removeClass("my-alert-success");
            $("#myAlert").addClass("my-alert-danger");
            $("#myAlert").html("<strong>出现错误</strong>：" + msg);
            $("#myAlert").slideToggle(300, function () {
                setTimeout(function () {
                    $("#myAlert").slideToggle(300);
                    //$("#submit").removeAttr("disabled");
                }, 3000);
            });
        }
    });
};