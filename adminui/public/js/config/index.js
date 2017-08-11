$(document).ready(function () {
    $("#configMenu a").on("click", function (e) {
        e.preventDefault();
        $("#configMenu a").removeClass("myActive");
        $(this).addClass("myActive");
        var destUrl = GlobalRootPath + $(this).attr("href");
        console.log(destUrl);
        $("#configContent").load(destUrl);
    });
    $("#configMenu a").first().click();
    //$("#configContent").load(destUrl);
});