var GlobalParam = {};
$(document).ready(function () {
    $("#dtFrom").datetimepicker({
        "format": "YYYY/MM/DD"
    });
    $("#dtTo").datetimepicker({
        "format": "YYYY/MM/DD"
    });
    $("#submit").on("click", function () {
        GlobalParam.from = $("#from").val();
        GlobalParam.to = $("#to").val();
        sendData();
    });
});

sendData = function () {
    console.log(JSON.stringify(GlobalParam));
    $.ajax({
        type: "POST",
        url: GlobalRootPath + "/push/receiveds",
        data: JSON.stringify({"sendData": GlobalParam}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (resData) {
            $("#versionTbody").html("");
            console.log(JSON.stringify(resData));
            if (resData.code !== "0") {
                return;
            }
            console.log("ok");
            var docs = resData.data;
            var num = 0;
            for (var i in docs) {
                var itemHtml = "<tr>";
                itemHtml += "<td>" + (num + 1) + "</a></td>";
                itemHtml += "<td>" + docs[i].time + "</td>";
                itemHtml += "<td>" + docs[i].title + "</td>";
                /*itemHtml += "<td>" + docs[i].url + "</td>";*/
                itemHtml += "<td>" + docs[i].androidRecvs + "</td>";
                itemHtml += "<td>" + docs[i].iosApns + "</td>";
                itemHtml += "<td>" + docs[i].iosRecvs + "</td>";
                itemHtml += "<td>" + docs[i].message + "</td>";
                itemHtml += "</tr>";
                num++;
                $("#versionTbody").append(itemHtml);
            }

        },
        failure: function (errMsg) {
            console.log(errMsg);
        }
    });
};