var app = angular.module("menuApp", []);

$chttp(app);
page(app, "/admin/menu/page");

app.service("menuSvc", ["$chttp", function ($chttp) {
    var addUrl = "/admin/menu/add",
        updateUrl = "/admin/menu/update",
        removeUrl = "/admin/menu/remove";

    this.add = function (menu) {
        return $chttp.post(addUrl, menu, null);
    };

    this.update = function (menu) {
        return $chttp.post(updateUrl, menu, null);
    };

    this.remove = function (id) {
        return $chttp.get(removeUrl, {params: {id: id}}, null);
    };
}]);