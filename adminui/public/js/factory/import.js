$(document).ready(function () {
    $("#doImport").on("click", function (e) {
        $("#waitingDiv").show();
        $("#doImport").hide();
        doImport();
    });
    $("#csvFile").on("change", function (e) {
        $("#doImport").hide();
        handleFileUpload("csvFile", function (fr) {
            var encoded = escape(fr.result);
            $("#tmpStore").html(encoded);
            $("#doImport").show();
        });
    });
});

doImport = function () {
    var sendData = $("#tmpStore").html();
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/factory/importCsv",
        data: JSON.stringify({"sendData": sendData}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            $("#waitingDiv").hide();
            console.log(JSON.stringify(resData));
            if (resData.code !== "0") {
                return;
            }
            console.log("ok");
            $("#alert").removeClass("my-alert-danger");
            $("#alert").addClass("my-alert-success");
            $("#alert").html("添加成功");
            $("#alert").slideToggle(300, function () {
                setTimeout(function () {
                    $("#alert").slideToggle(300);
                }, 3000);
            });
        },
        failure: function (errMsg) {
            $("#waitingDiv").hide();
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
};