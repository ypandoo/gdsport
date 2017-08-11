var aliasName = "BehaveTrace";
var destId = "configValue";
var commonConfig = new CommonConfig();
var name = "是否收集上传用户行为数据";

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


/*var globalSwitchOnBankWorldData = false;
 var globalSwitchOnBankWorldAlias = "SwitchOnBankWorld";
 var globalSwitchOnBankWorldName = "开启BankWorld功能";
 $(document).ready(function () {
 $("#chbox").bootstrapSwitch('offColor', "danger");
 initData();
 });

 initData = function () {
 $.ajax({
 type: "POST",
 url: "/config/getOne",
 data:
 JSON.stringify({
 alias: globalSwitchOnBankWorldAlias
 }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 if (resData.code !== "0") {
 globalSwitchOnBankWorldData = false;
 } else {
 globalSwitchOnBankWorldData = resData.data.value == 0 ? false : true;
 }
 console.log(globalSwitchOnBankWorldData);
 $("#chbox").bootstrapSwitch('state', globalSwitchOnBankWorldData);
 $("#chbox").bootstrapSwitch('onSwitchChange', function (event, state) {
 if (state === globalSwitchOnBankWorldData) {
 return;
 }
 var notice = "开启";
 if (globalSwitchOnBankWorldData) {
 notice = "关闭";
 }
 if (window.confirm("您需要" + notice + "该配置项么？")) {
 globalSwitchOnBankWorldData = !globalSwitchOnBankWorldData;
 $("#chbox").bootstrapSwitch('state', globalSwitchOnBankWorldData);
 updateData();
 } else {
 $("#chbox").bootstrapSwitch('state', globalSwitchOnBankWorldData);
 }
 });
 },
 failure: function (errMsg) {
 //alert(errMsg);
 }
 });
 };

 updateData = function () {
 $.ajax({
 type: "POST",
 url: "/config/getOne",
 data:
 JSON.stringify({
 alias: globalSwitchOnBankWorldAlias
 }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 if (resData.code !== "0") {
 addNewData();
 } else {
 updateNewData();
 }
 },
 failure: function (errMsg) {
 //alert(errMsg);
 }
 });
 };

 addNewData = function () {
 var newValue = globalSwitchOnBankWorldData ? 1 : 0;
 $.ajax({
 type: "POST",
 url: "/config/add",
 data:
 JSON.stringify({
 name: globalSwitchOnBankWorldName,
 alias: globalSwitchOnBankWorldAlias,
 value: newValue
 }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 if (resData.code !== "0") {
 addNewData();
 } else {
 updateNewData();
 }
 },
 failure: function (errMsg) {
 //alert(errMsg);
 }
 });
 };

 updateNewData = function () {
 var newValue = globalSwitchOnBankWorldData ? 1 : 0;
 $.ajax({
 type: "POST",
 url: "/config/update",
 data:
 JSON.stringify({
 name: globalSwitchOnBankWorldName,
 alias: globalSwitchOnBankWorldAlias,
 value: newValue
 }),
 contentType: "application/json; charset=utf-8",
 dataType: "json",
 success: function (resData) {
 initData();
 },
 failure: function (errMsg) {
 //alert(errMsg);
 }
 });
 }; */