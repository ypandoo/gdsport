var GlobalRootPath;
$(document).ready(function () {
    GlobalRootPath = PathTools.getRootPath();
    $("#navbar a").on("click", function (e) {
        var url = $(this).attr("href");
        var hashName = GlobalRootPath + "/" + url.split("#")[1].toString();
        //var hashName = window.location.hash.toString().replace("#", "") + ".html";
        console.log("ssadsddds");
        console.log("hashName:" + hashName);
        $("#loader").load(hashName);
        $("#navbar li").removeClass("active");
        $(this).parent().addClass("active");
    });

    $("#logoutBtn").on("click", function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: GlobalRootPath + "/login/doLogout",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (resData) {
                console.log(JSON.stringify(resData));
                if (resData.code !== "0") {
                    console.log(resData.msg);
                    return;
                }
                console.log("ok");
                window.location.href = GlobalRootPath + "/index#login";
                window.location.reload();
            },
            failure: function (errMsg) {
                console.log("Failed:" + msg);
            }
        });
    });
    console.log(window.location.href);
    if (window.location.href.indexOf("#") > 0) {
        var hashName = GlobalRootPath + "/" + window.location.href.split("#")[1].toString();
        $("#loader").load(hashName);
    } else {
        var hashName = GlobalRootPath + "/login";
        $("#loader").load(hashName);
    }
});

var PathTools = {
    getRootPath: function () {
        var pathName = window.location.pathname;
        var pos = pathName.lastIndexOf("/");
        var rootPath = pathName.substring(0, pos);
        return rootPath;
    }
};


