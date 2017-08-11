var features = null;
$(document).ready(function () {
    refreshUi();
    features = JSON.parse($("#features").html());
});

isInArray = function (val, arr) {
    for (var key in arr) {
        if (arr[key] === val) {
            return true;
        }
    }
    return false;
}

initEvent = function () {
    $(".activityStop").on("click", function (e) {
        e.preventDefault();
        handleModify("isAvail", $(this).attr("href"), "false");
        console.log("Stop " + $(this).attr("href"));
    });

    $(".activityStart").on("click", function (e) {
        e.preventDefault();
        handleModify("isAvail", $(this).attr("href"), "true");
        console.log("Start " + $(this).attr("href"));
    });

    $(".activityPass").on("click", function (e) {
        e.preventDefault();
        $(".activityPass").attr("disabled", "disabled");
        var modifyPassDiv = "<div class=\"radiusDiv\" style=\"display:none\" id=\"modifyPassDiv\">" +
            "<div>为用户" + $(this).attr("name") + "修改密码</div>" +
            "<div>请您输入密码：<input id=\"pass1\" type=\"password\"></div>" +
            "<div>再次输入密码：<input id=\"pass2\" type=\"password\"></div>" +
            "<div style=\"display:none\" id=\"passId\">" + $(this).attr("href") + "</div>" +
            "<div><button id=\"passOk\">确定</button>&nbsp;&nbsp;<button id=\"passCancel\">取消</button></div>" +
            "</div>";
        $(this).parent().append(modifyPassDiv);
        $("#modifyPassDiv").show("fast");
        initPassEvt();
    });


    $(".activityAuth").on("click", function (e) {
        e.preventDefault();
        $(".activityAuth").attr("disabled", "disabled");
        var prevFeatures = $(this).attr("features").split(",");
        var modifyAuthDiv = "<div class=\"radiusDiv\" style=\"display:none\" id=\"modifyAuthDiv\"><div style=\"text-align: left;\">" +
            "<div>为用户" + $(this).attr("name") + "修改权限</div>"
        for (var ftKey in features) {
            modifyAuthDiv += "<div>&nbsp;&nbsp;<input type=\"checkbox\" name=\"userFeature\"";
            if (isInArray(ftKey, prevFeatures)) {
                modifyAuthDiv += " checked=\"checked\" ";
            }
            modifyAuthDiv += " value=\"" + ftKey + "\"/>&nbsp;&nbsp;" + features[ftKey] + "</div>";
        }
        modifyAuthDiv += "</div><div style=\"display:none\" id=\"authId\">" + $(this).attr("href") + "</div>";
        modifyAuthDiv += "<div><button id=\"authOk\">确定</button>&nbsp;&nbsp;<button id=\"authCancel\">取消</button></div>"
        modifyAuthDiv += "</div>";
        $(this).parent().append(modifyAuthDiv);
        $("#modifyAuthDiv").show("fast");
        initAuthEvt();
    });

    $(".activityGroupUp").on("click", function (e) {
        e.preventDefault();
        handleModify("group", $(this).attr("href"), "admin");
    });

    $(".activityGroupDown").on("click", function (e) {
        e.preventDefault();
        handleModify("group", $(this).attr("href"), "user");
    })
};

initPassEvt = function () {
    $("#passOk").on("click", function (e) {
        if ($("#pass1").val().length === 0) {
            window.alert("新密码不能为空");
            return;
        }
        if ($("#pass1").val() !== $("#pass2").val()) {
            window.alert("两次密码输入不一致");
            retrun;
        }
        handleModify("password", $("#passId").html(), $("#pass1").val());
    });

    $("#passCancel").on("click", function (e) {
        $(this).parent().parent().hide("fast", function () {
            $(this).remove();
            $(".activityPass").removeAttr("disabled");
        });
    });
};

initAuthEvt = function () {
    $("#authOk").on("click", function (e) {
        var checkedFeatures = [];
        $('input[name="userFeature"]:checked').each(function () {
            checkedFeatures.push($(this).val());
        })
        console.log(checkedFeatures.toString());
        handleModify("features", $("#authId").html(), checkedFeatures);
    });

    $("#authCancel").on("click", function (e) {
        $(this).parent().parent().hide("fast", function () {
            $(this).remove();
            $(".activityAuth").removeAttr("disabled");
        });
    });
};

refreshUi = function () {
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/user/getAll",
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            console.log(JSON.stringify(resData));
            if (resData.code !== "0") {
                if (resData.code === "-3") {
                    $("#userTbody").html("");
                }
                return;
            }
            $("#versionTbody").html("");
            var data = resData.data;
            if (data.length > 0) {
                var appendData = "";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (item.name === "admin") {
                        continue;
                    }
                    appendData += "<tr><td>";
                    appendData += (i + 1) + "</td><td>";
                    appendData += item.name + "</td><td>";
                    appendData += item.realName + "</td><td>";
                    if (item.group === "admin") {
                        appendData += "<a href=\"" + item.id + "\" class=\"activityGroupDown\" alt=\"降级为普通操作员\">" +
                            "<span style=\"color:#009900\">" +
                            "超级管理员</span></a></td><td>";
                    } else {
                        appendData += "<a href=\"" + item.id + "\" class=\"activityGroupUp\" alt=\"升级为超级管理员\">" +
                            "<span style=\"color:#000000\">" +
                            "普通操作员</span></a></td><td>";
                    }
                    //appendData += item.createAt.toString() + "</td><td>";
                    if (item.isAvail) {
                        appendData += "<span style=\"color:#009900\">启用</span></td><td>";
                    } else {
                        appendData += "<span style=\"color:#FF0000\">停用</span></td><td>";
                    }

                    if (typeof item.features !== "undefined") {
                        if (item.features.length > 0) {
                            var ftArr = item.features;
                            var ftDisp = "<table><tr>";
                            for (var o = 0; o < ftArr.length; o++) {
                                var itemFtKey = ftArr[o];
                                ftDisp += "<td>" + features[itemFtKey];
                                if (o % 2 == 0) {
                                    ftDisp += "&nbsp;&nbsp;&nbsp;&nbsp;</td>";
                                } else {
                                    ftDisp += "&nbsp;&nbsp;</td></tr>";
                                }
                            }
                            ftDisp += "</table>";
                            appendData += ftDisp;
                        }
                    }
                    appendData += "</td><td>";
                    if (item.isAvail) {
                        appendData += "<a href=\"" + item.id + "\" class=\"activityStop\">停用</a>";
                    } else {
                        appendData += "<a href=\"" + item.id + "\" class=\"activityStart\">启用</a>";
                    }
                    appendData += "&nbsp;&nbsp;<a href=\"" + item.id + "\" ";
                    appendData += "class=\"activityPass\" name=\"" + item.name + "\">密码 ";
                    appendData += "</a>";
                    appendData += "&nbsp;&nbsp;<a href=\"" + item.id + "\" ";
                    appendData += "class=\"activityAuth\" name=\"" + item.name + "\" features=\"" + item.features + "\">权限 ";
                    appendData += "</a></td></tr>";
                }
                $("#userTbody").html(appendData);
                initEvent();
            }
        },
        failure: function (errMsg) {

        }
    });
};

handleModify = function (type, id, value) {
    var sendData = {};
    sendData.type = type;
    sendData.id = id;
    sendData.val = value;
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/user/modify",
        data: JSON.stringify({sendData: sendData}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            console.log(JSON.stringify(resData));
            if (resData.code !== "0") {
                return;
            }
            console.log("Modify Ok");
            refreshUi();
        },
        failure: function (errMsg) {

        }
    });
};