var aliasName = "BindBandConstraint";
var destId = "configValue";
var commonConfig = new CommonConfig();
var name = "手环绑定限制";

$(document).ready(function () {
    initUi();
    initEvent();
});

initEvent = function () {
    $("#submit").on("click", function () {
        commonConfig.add(aliasName, name, destId, function (code, msg) {
            if (code === "0") {
                console.log("ok");
                $("#alert").removeClass("my-alert-danger");
                $("#alert").addClass("my-alert-success");
                $("#alert").html("修改成功");
                $("#alert").slideToggle(300, function () {
                    setTimeout(function () {
                        $("#alert").slideToggle(300);
                    }, 800);
                });
            } else {
                console.log("Failed:" + msg);
                $("#alert").removeClass("my-alert-success");
                $("#alert").addClass("my-alert-danger");
                $("#alert").html("<strong>出现错误</strong>：" + msg);
                $("#alert").slideToggle(300, function () {
                    setTimeout(function () {
                        $("#alert").slideToggle(300);
                    }, 800);
                });
            }
        });
    });

    $("#cancel").on("click", function () {
        $("#configValue").val(commonConfig.orig);
    });
};

initUi = function () {
    commonConfig.initData(aliasName, destId);
};

/*
 $(document).ready(function () {
 initData();
 initBtnEvent();
 addAddEvent();
 addSearchEvent();
 });
 var globalCityData = [];
 var globalCityName = "电子现金适用城市";
 var globalCityAlias = "ECashCity";
 initData = function () {
 $.ajax({
 type: "POST",
 url: "/config/getOne",
 data: JSON.stringify({ "alias": globalCityAlias }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 console.log(JSON.stringify(resData));
 if (resData.code !== "0") {
 return;
 }
 var data = JSON.parse(resData.data.value);
 globalCityData = data;
 var html = "";
 for (var i = 0; i < data.length; i++) {
 html += "<tr><td>" + (i + 1) + "</td><td>" + data[i] + "</td><td>"
 + "<a href=\"" + data[i] + "\" class=\"delBtn\">删除</a></td></tr>";
 }
 $("#configCityTbody").html(html);
 initBtnEvent();
 },
 failure: function (errMsg) {
 alert(errMsg);
 }
 });
 };

 initBtnEvent = function () {
 $(".delBtn").on("click", function (e) {
 e.preventDefault();
 var hData = $(this).attr("href");
 deleteCity(hData);
 });
 }

 deleteCity = function (cityName) {
 if (window.confirm("您确定要删除城市：" + cityName + " ？")) {
 var sendData = [];
 for (var i = 0; i < globalCityData.length; i++) {
 if (cityName !== globalCityData[i]) {
 sendData.push(globalCityData[i]);
 }
 }
 $.ajax({
 type: "POST",
 url: "/config/update",
 data: JSON.stringify({
 "name": globalCityName,
 "value": JSON.stringify(sendData),
 "alias": globalCityAlias
 }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 if (resData.code === "0") {
 initData();
 }
 },
 failure: function (errMsg) {
 alert(errMsg);
 }
 });
 }
 };

 addAddEvent = function () {
 $("#addCityLink").on("click", function (e) {
 e.preventDefault();
 $("#addCityLink").toggle("fast", function () {
 $("#addCityDiv").slideToggle("fast");
 });
 });
 $("#cancelCityBtn").on("click", function () {
 $("#addCityDiv").toggle("fast", function () {
 $("#addCityLink").slideToggle("fast");
 });
 });
 $("#addCityBtn").on("click", function () {
 if ($("#addCityName").val() === "") {
 window.alert("请填写要添加城市的名称！");
 return;
 }
 var addCityName = $("#addCityName").val();
 for (var i = 0; i < globalCityData.length; i++) {
 if (addCityName === globalCityData[i]) {
 window.alert("要添加的城市名称已经存在！");
 return;
 }
 }
 console.log("addCityName:" + $("#addCityName").val());
 $.ajax({
 type: "POST",
 url: "/config/getOne",
 data:
 JSON.stringify({
 alias: globalCityAlias
 }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 if (resData.code !== "0") {
 addNewCity();
 } else {
 updateNewCity();
 }
 },
 failure: function (errMsg) {
 //alert(errMsg);
 }
 });

 });
 };

 updateNewCity = function () {
 globalCityData.push($("#addCityName").val());
 $.ajax({
 type: "POST",
 url: "/config/update",
 data:
 JSON.stringify({
 name: globalCityName,
 value: JSON.stringify(globalCityData),
 alias: globalCityAlias
 }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 console.log("recv from the add new city:" + JSON.stringify(resData));
 if (resData.code !== "0") {
 window.alert("添加城市名称失败");
 } else {
 initData();
 }
 },
 failure: function (errMsg) {
 //alert(errMsg);
 }
 });
 };

 addNewCity = function () {
 globalCityData = [];
 globalCityData.push($("#addCityName").val());
 $.ajax({
 type: "POST",
 url: "/config/add",
 data:
 JSON.stringify({
 name: globalCityName,
 value: JSON.stringify(globalCityData),
 alias: globalCityAlias
 }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 console.log("recv from the add new city:" + JSON.stringify(resData));
 if (resData.code !== "0") {
 window.alert("添加城市名称失败");
 } else {
 initData();
 }
 },
 failure: function (errMsg) {
 //alert(errMsg);
 }
 });
 };

 addSearchEvent = function () {
 $("#searchCityLink").on("click", function (e) {
 e.preventDefault();
 $("#searchCityLink").hide();
 $("#searchCityDiv").show();
 });
 $("#cancelCityBtn1").on("click", function () {
 $("#searchCityDiv").hide();
 $("#searchCityLink").show();
 });
 };
 */
