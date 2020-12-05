var app = angular.module("orderApp", []);

$chttp(app);
page(app, "/admin/order/page");

app.service("orderSvc", ["$chttp", function ($chttp) {
    var sendUrl = "/admin/order/send";

    this.send = function (id) {
        return $chttp.get(sendUrl, {params: {id: id}}, null);
    };
}]);