var hasConfig = false;
$(document).ready(function () {
    checkConfig();
    $("#configMenu a").on("click", function (e) {
        e.preventDefault();
        $("#configMenu a").removeClass("myActive");
        $(this).addClass("myActive");
        var destHref = $(this).attr("href");
        if (destHref === "import" && hasConfig === false) {
            window.alert("请先配置导入规则。");
            return;
        }
        var destUrl = GlobalRootPath + "/factory/index/" + $(this).attr("href");
        console.log(destUrl);
        $("#configContent").load(destUrl);
    });
    $("#configMenu a").first().click();
    //$("#configContent").load(destUrl);
});
var checkConfig = function () {
    console.log("hehe");
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/factory/reloadConfig#test",
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            console.log(JSON.stringify(resData));
            if (resData.code === "0") {
                hasConfig = true;
                $("#import").show();
            } else {
                hasConfig = false;
                $("#import").hide();
            }
        },
        failure: function (errMsg) {
            console.log(errMsg);
            return;
        }
    });
};