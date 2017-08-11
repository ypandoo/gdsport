var globalData = {};
var globalType = "";
var GlobalRootPath;
$(document).ready(function () {
    GlobalRootPath = PathTools.getRootPath();
    $("#features").multiselect();
    $("#group").multiselect();
    initBtnEvent();
});

clearUI = function () {
    $("#name").val("");
    $("#password1").val("");
    $("#password").val("");
    $("#realName").val("");
    $("#group").val("");
    $("#features").val("");
}

initBtnEvent = function () {
    $("#submit").on("click", function (e) {
        if ($("#name").val().length === 0) {
            window.alert("请填写用户名");
            $("#name").focus();
            return;
        }
        if ($("#password").val().length === 0) {
            window.alert("请填写密码");
            $("#password").focus();
            return;
        }
        if ($("#password1").val() !== $("#password").val()) {
            window.alert("请确定两次填写的密码一致");
            $("#password1").focus();
            return;
        }
        if ($("#realName").val().length === 0) {
            window.alert("请填写真实姓名");
            $("#name").focus();
            return;
        }
        var sendData = {};
        sendData.name = $("#name").val();
        sendData.password = $("#password").val();
        sendData.realName = $("#realName").val();
        sendData.group = $("#group").val();
        sendData.features = $("#features").val();
        $.ajax({
            type: "POST",
            url: GlobalRootPath + "/user/add",
            data: JSON.stringify({"sendData": sendData}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (resData) {
                console.log(JSON.stringify(resData));
                if (resData.code !== "0") {
                    $("#alert").removeClass("my-alert-success");
                    $("#alert").addClass("my-alert-danger");
                    $("#alert").html("<strong>出现错误</strong>：" + resData.msg);
                    $("#alert").slideToggle(300, function () {
                        setTimeout(function () {
                            $("#alert").slideToggle(300, function () {

                            });
                        }, 3000);
                    });
                    return;
                }
                console.log("ok");
                $("#alert").removeClass("my-alert-danger");
                $("#alert").addClass("my-alert-success");
                $("#alert").html("添加成功");
                $("#alert").slideToggle(300, function () {
                    setTimeout(function () {
                        $("#alert").slideToggle(300, function () {
                            window.location.href = GlobalRootPath + "/index#user";
                            window.location.reload();
                        });
                    }, 3000);
                });
            },
            failure: function (errMsg) {
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

    });
    $("#cancel").on("click", function (e) {
        if (window.confirm("您确定放弃已经填写的内容么？")) {

            clearUI();
        }
    });
};

var PathTools = {
    getRootPath: function () {
        var pathName = window.location.pathname;
        var pos = pathName.lastIndexOf("/");
        var rootPath = pathName.substring(0, pos);
        return rootPath;
    }
};

