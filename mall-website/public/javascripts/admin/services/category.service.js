var app = angular.module("categoryApp", []);

$chttp(app);
page(app, "/admin/category/page");

app.service("categorySvc", ["$chttp", function ($chttp) {
    var addUrl = "/admin/category/add",
        updateUrl = "/admin/category/update",
        removeUrl = "/admin/category/remove",
        addImgUrl = "/admin/category/addImg",
        removeImgUrl = "/admin/category/removeImg",
        menusUrl = "/admin/menu/list";

    this.add = function (fd) {
        return $chttp.common({
            method: "POST",
            url: addUrl,
            data: fd,
            headers: {"Content-Type": undefined},
            transformRequest: angular.identity,
        });
    };

    this.update = function (category) {
        return $chttp.post(updateUrl, category, null);
    };

    this.remove = function (id) {
        return $chttp.get(removeUrl, {params: {id: id}}, null);
    };

    this.addImg = function (fd) {
        return $chttp.common({
            method: "POST",
            url: addImgUrl,
            data: fd,
            headers: {"Content-Type": undefined},
            transformRequest: angular.identity,
        });
    };

    this.removeImg = function (id, img) {
        return $chttp.get(removeImgUrl, {params: {id: id, img: img}}, null);
    };

    this.getMenus = function () {
        return $chttp.get(menusUrl, null, null);
    };
}]);