var app = angular.module("commodityApp", []);

$chttp(app);
page(app, "/admin/commodity/page");

app.service("commoditySvc", ["$chttp", function ($chttp) {
    var addUrl = "/admin/commodity/add",
        updateUrl = "/admin/commodity/update",
        removeUrl = "/admin/commodity/remove",
        addImgUrl = "/admin/commodity/addImg",
        removeImgUrl = "/admin/commodity/removeImg",
        categoriesUrl = "/admin/category/list",
        addGrouponUrl = "/admin/groupon/add",
        updateGrouponUrl = "/admin/groupon/update",
        removeGrouponUrl = "/admin/groupon/remove";

    this.add = function (fd) {
        return $chttp.common({
            method: "POST",
            url: addUrl,
            data: fd,
            headers: {"Content-Type": undefined},
            transformRequest: angular.identity,
        });
    };

    this.update = function (commodity) {
        return $chttp.post(updateUrl, commodity, null);
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

    this.getCategories = function () {
        return $chttp.get(categoriesUrl);
    };

    this.addGroupon = function (groupon) {
        return $chttp.post(addGrouponUrl, groupon, null);
    };

    this.updateGroupon = function (groupon) {
        return $chttp.post(updateGrouponUrl, groupon, null);
    };

    this.removeGroupon = function (id) {
        return $chttp.get(removeGrouponUrl, {params: {id: id}}, null);
    };
}]);