if (typeof GlobalRootPath === "undefined") {
    var getRootPath = function () {
        var pathName = window.location.pathname;
        var pos = pathName.lastIndexOf("/");
        var rootPath = pathName.substring(0, pos);
        return rootPath;
    };
    var destPath = getRootPath() + "/index";
    window.location.href = destPath;
} else {
    $(document).ready(function () {

        $("#submit").on("click", function () {
            doSubmit();
        });

        $("#name").on("keypress", function (e) {
            var code = e.keycode || e.which;
            if (code === 13) {
                doSubmit();
            }
        });

        $("#password").on("keypress", function (e) {
            var code = e.keycode || e.which;
            if (code === 13) {
                doSubmit();
            }
        });
    });

    doSubmit = function () {
        var name = $("#name").val();
        var password = $("#password").val();
        $.ajax({
            type: "POST",
            url: GlobalRootPath + "/login/doLogin",
            data: JSON.stringify({"name": name, "password": password}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (resData) {
                console.log(JSON.stringify(resData));
                if (resData.code !== "0") {
                    console.log(resData.msg);
                    $("#myAlert").removeClass("my-alert-success");
                    $("#myAlert").addClass("my-alert-danger");
                    $("#myAlert").html("<strong>出现错误</strong>：用户名或密码错误");
                    $("#myAlert").slideToggle(300, function () {
                        setTimeout(function () {
                            $("#myAlert").slideToggle(300);
                        }, 1500);
                    });
                    return;
                }
                console.log("ok");
                window.location.href = GlobalRootPath + "/index#welcome";
                window.location.reload();
//            $("#myAlert").removeClass("my-alert-danger");
//            $("#myAlert").addClass("my-alert-success");
//            $("#myAlert").html("登录成功！");
//            $("#myAlert").slideToggle(300, function () {
//                setTimeout(function () {
//                    $("#myAlert").slideToggle(300);
//                    window.location.href = "/#config";
//                    window.location.reload();
//                }, 1500);
//            });
            },
            failure: function (errMsg) {
                console.log("Failed:" + msg);
                $("#myAlert").removeClass("my-alert-success");
                $("#myAlert").addClass("my-alert-danger");
                $("#myAlert").html("<strong>出现错误</strong>：" + msg);
                $("#myAlert").slideToggle(300, function () {
                    setTimeout(function () {
                        $("#myAlert").slideToggle(300);
                    }, 1500);
                });
            }
        });
    };
}
