var Parse = null;
//var Quill = null;
/*require.config({
 baseUrl: "js/"
 });
 console.log(GlobalRootPath);
 require(['js/jquery.min.js', 'js/bootstrap.min.js', 'js/activity/quill.js', 'js/bootstrap-multiselect.js'
 , 'js/bootstrap-datetimepicker.min.js'
 , 'js/imgUtil.js', 'js/parseUtil.js', 'activity/parse'], function () {
 Parse = require("activity/parse");
 Parse.initialize("appworld-cibxdl");
 Parse.serverURL = "http://127.0.0.1:20371/parse";
 console.log("Parse initialized ok");
 Quill = require("js/activity/quill.js");
 //require("js/bootstrap-multiselect.js");
 initUi();
 initEvent();
 });*/


var editor = null;
var direction = "portrait";
var dispContent = null;
var dispContentHtml = "";
var uiData = {};
$(document).ready(function () {
    initUi();
    initEvent();
});
initEvent = function () {


    $("#submit").on("click", function () {
        if ($("#title").val().length === 0) {
            window.alert("请填写指南名称");
            return;
        }

        uiData.title = $("#title").val();
        $("#handleDiv").html(dispContentHtml);
        var srcList = [];
        var imgs = $("#handleDiv img");
        console.log(imgs.length);
        for (var i = 0; i < imgs.length; i++) {
            srcList.push(imgs[i].src);
        }
        var replSrcs = [];
        var specChars = "MyCibUrlReplaceXXXXX_";
        for (var i = 0; i < imgs.length; i++) {
            var replName = specChars + i;
            replSrcs.push(replName);
            imgs[i].src = replName;
        }
        console.log($("#handleDiv").html());
        uiData.content = escape($("#handleDiv").html());
        var finalData = {};
        finalData.src = srcList;
        finalData.rep = replSrcs;
        finalData.ui = uiData;
        // var parseUtilFile = new ParseUtilFile();
        // parseUtilFile.handle(srcList, function (retList) {
        //     if (retList === null) {
        //         console.log("Error for the parse file save");
        //         return;
        //     }
        //     console.log(retList.length);
        //     var i = 0;
        //     if (typeof uiData.tile1 !== "undefined") {
        //         uiData.tile1 = retList[i];
        //         i++;
        //     }
        //     if (typeof uiData.tile2 !== "undefined") {
        //         uiData.tile2 = retList[i];
        //         i++;
        //     }
        //     for (var j = i, k = 0; k < imgs.length; j++, k++) {
        //         imgs[k].src = retList[j];
        //     }
        //     uiData.content = escape($("#handleDiv").html());
        //});


        $.ajax({
            type: "POST",
            url: GlobalRootPath + "/guide/add",
            data: JSON.stringify({"sendData": finalData}),
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
                $("#alert").html("添加成功");
                $("#alert").slideToggle(300, function () {
                    setTimeout(function () {
                        $("#alert").slideToggle(300);
                        window.location.href = GlobalRootPath + "/index#guide";
                        window.location.reload();
                    }, 800);
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


        //console.log($("#handleDiv").html());


        /*
         var parseFile = new Parse.File(mokeName, {base64: uiData.tile1});
         parseFile.save().then(function (obj) {
         console.log("File Url:" + parseFile.url());
         console.log("File Name:" + parseFile.name());
         console.log("Success:" + obj.id);
         }, function (err) {
         console.log("Failed:" + err)
         });*/

        return;


    });
    $("#show").on("click", function (e) {
        if ($("#title").val().length === 0) {
            window.alert("请填写指南名称");
            return;
        }
        if (direction === "portrait") {
            $("#disp").css({
                "width": "375px",
                "height": "667px"
            });
            $("#dispOuter").css({
                "width": "405px",
                "height": "697px"
            });
            $("#show").html("手机效果预览(横屏)");
            direction = "landscape";
        } else {
            $("#disp").css({
                "width": "667px",
                "height": "375px"
            });
            $("#dispOuter").css({
                "width": "697px",
                "height": "405px"
            });
            $("#show").html("手机效果预览(竖屏)");
            direction = "portrait";
        }
        $("#disp").css({
            "border-width": "1px",
            "border-style": "solid",
            "border-color": "#DDDDDD",
            "background-color": "#FFFFFF"
        });
        dispContentHtml = "<p><br></p>";
        dispContentHtml += "<div class=\"ql-editor\" contenteditable=\"true\">";
        dispContentHtml += "<p><span class=\"ql-size-large\"><strong><font face=\"黑体\">" + $("#title").val() + "</font></strong></span></p>";
        dispContentHtml += "<p><br></p></div>";
        dispContentHtml += $("#editor").html();
        //console.log(dispContentHtml);
        dispContent = new Quill('#dispContent', {readOnly: true, theme: 'bubble'});
        dispContent.clipboard.dangerouslyPasteHTML(dispContentHtml);
        //disp.clipboard.dangerouslyPasteHTML(decodeURIComponent(encoded));
        $("#submit").show();
    });
    editor.on("text-change", function (delta, oldDelta, source) {
        $("#submit").hide();
    });
};
initUi = function () {
    $("#submit").hide();
    editor = new Quill('#editor', {
        modules: {toolbar: '#toolbar-container'},
        theme: 'snow'
    });
    $("#editor").css({
        "height": "400px",
        "border-bottom-left-radius": "5px",
        "border-bottom-right-radius": "5px",
        "background-color": "#FFFFFF"
    });
    dispContent = new Quill('#dispContent', {readOnly: true, theme: 'bubble'});
};

selectFileItem = function (showImgId, fileId) {
    var showImg = document.getElementById(showImgId);
    if (document.getElementById(fileId).value.length === 0) {
        showImg.style.display = "none";
        showImg.src = "";
    } else {
        handleFileSelect(fileId, function (fr) {
            showImg.src = fr.result;
            showImg.onload = function () {
                showImg.style.display = "block";
            };
        });
    }
};