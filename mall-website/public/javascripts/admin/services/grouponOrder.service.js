var app = angular.module("grouponOrderApp", []);

$chttp(app);
page(app, "/admin/grouponOrder/page");

app.service("grouponOrderSvc", ["$chttp", function ($chttp) {
    var sendUrl = "/admin/grouponOrder/send";

    this.send = function (id) {
        return $chttp.get(sendUrl, {params: {id: id}}, null);
    };
}]);