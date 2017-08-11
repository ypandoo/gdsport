$(document).ready(function () {
    refreshUi();
});

initEvent = function () {
    $(".activityStop").on("click", function (e) {
        e.preventDefault();
        handleModify("stop", $(this).attr("href"));
        console.log("Stop " + $(this).attr("href"));
    });

    $(".activityStart").on("click", function (e) {
        e.preventDefault();
        handleModify("start", $(this).attr("href"));
        console.log("Start " + $(this).attr("href"));
    });

    $(".activityRemove").on("click", function (e) {
        e.preventDefault();
        var itemName = $(this).attr("name");
        if (window.confirm("请确定要删除 " + itemName + " 么？")) {
            handleModify("remove", $(this).attr("href"));
            console.log("Remove " + $(this).attr("href"));
        }
    });
};

refreshUi = function () {
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/activity/getAll",
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            console.log(JSON.stringify(resData));
            if (resData.code !== "0") {
                if (resData.code === "-3") {
                    $("#versionTbody").html("");
                }
                return;
            }
            $("#versionTbody").html("");
            console.log("ok");
            var data = resData.data;
            if (data.length > 0) {
                var appendData = "";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    appendData += "<tr><td>";
                    appendData += (i + 1) + "</td><td>";
                    appendData += item.title + "</td><td>";
                    appendData += item.duration + "</td><td>";
                    appendData += item.startAfter + "</td><td>";
                    appendData += item.endBefore + "</td><td>";
                    appendData += item.createAt.toString() + "</td><td>";
                    if (item.isAvail === "1") {
                        appendData += "<span style=\"color:#009900\">是</span></td><td>";
                    } else {
                        appendData += "<span style=\"color:#FF0000\">否</span></td><td>";
                    }
                    if (item.isAvail === "1") {
                        appendData += "<a href=\"" + item.id + "\" class=\"activityStop\">停用</a>";
                    } else {
                        appendData += "<a href=\"" + item.id + "\" class=\"activityStart\">启用</a>";
                    }
                    appendData += "&nbsp;&nbsp;<a href=\"" + item.id + "\" ";
                    appendData += "class=\"activityRemove\" name=\"" + item.title + "\">删除 ";
                    appendData += "</a></td></tr>";
                }
                $("#versionTbody").html(appendData);
                initEvent();
            }
        },
        failure: function (errMsg) {

        }
    });
};

handleModify = function (type, id) {
    var sendData = {};
    sendData.type = type;
    sendData.data = id;
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/activity/modify",
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