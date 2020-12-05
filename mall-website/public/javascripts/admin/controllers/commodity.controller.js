app.controller("commodityCtrl", ["$scope", "$rootScope", "$filter", "commoditySvc", function ($scope, $rootScope, $filter, commoditySvc) {
    $rootScope.categories = [];
    $scope.mode = "add";
    $scope.commodity = {units: [], imgs: []};
    $scope.unit = {standard: "500g", price: 1.00, desc: "", discount: 1, stock: 99999, isDelete: false};
    $scope.unitShow = false;
    $scope.unitType = 0;
    $scope.groupon = null;

    (function init() {
        commoditySvc.getCategories().then(res => {
            var result = res.data;
            if (result.state !== 1) return alert(result.msg);
            $rootScope.categories = result.data;
            $rootScope.categories.unshift({name: "请选择商品分类", value: ""});
        }).catch(catchError());
    })();

    $scope.addUnit = function () {
        $scope.unitShow = true;
        $scope.unitType = 0;
        $scope.unit = {standard: "500g", price: 1.00, discount: 1, stock: 99999, desc: "", isDelete: false};
    };

    $scope.editUnit = function (unit) {
        $scope.unitShow = true;
        $scope.unitType = 1;
        $scope.unit = unit;
    };

    $scope.removeUnit = function (unit) {
        var units = $scope.commodity.units,
            isAdd = !unit._id;
        for (var i = 0; i < units.length; i++) {
            var item = units[i];
            if (isAdd) {
                if (unit.$$hashKey === item.$$hashKey) {
                    unit["isDelete"] = true;
                    item["isDelete"] = true;
                    break;
                }
            } else {
                if (unit._id === item._id) {
                    unit["isDelete"] = true;
                    item["isDelete"] = true;
                    break;
                }
            }
        }
    };

    $scope.saveUnit = function () {
        var isExist = $scope.commodity.units.some(function (item) {
            if ($scope.unit._id) return $scope.unit._id === item._id;
            else return $scope.unit.$$hashKey === item.$$hashKey;
        });
        if (isExist) {//编辑操作
            for (var i = 0; i < $scope.commodity.units.length; i++) {
                var item = $scope.commodity.units[i];
                if (!$scope.unit._id) {
                    if ($scope.unit.$$hashKey === item.$$hashKey) {
                        $scope.commodity.units.splice(i, 1, $scope.unit);
                        $scope.unit = {standard: "500g", price: 1.00, discount: 1, stock: 99999, desc: ""};
                        $scope.unitShow = false;
                        return true;
                    }
                } else {
                    if ($scope.unit._id === item._id) {
                        $scope.commodity.units.splice(i, 1, $scope.unit);
                        $scope.unit = {standard: "500g", price: 1.00, discount: 1, stock: 99999, desc: ""};
                        $scope.unitShow = false;
                        return true;
                    }
                }
            }
        } else {//添加操作
            $scope.commodity.units.push($scope.unit);
            $scope.unit = {standard: "500g", price: 1.00, discount: 1, stock: 99999, desc: ""};
            $scope.unitShow = false;
        }
    };

    $scope.add = function () {
        $scope.mode = "add";
        $scope.commodity = {units: [], imgs: []};
    };

    $scope.edit = function (item) {
        $scope.mode = "edit";
        var citem = angular.copy(item);
        citem.category = item.category._id;
        $scope.commodity = citem;
    };

    $scope.save = function () {
        if (!$scope.commodity.name) return alert("商品名称不能为空！");
        if (!$scope.commodity.category) return alert("商品分类不能为空！");
        if ($scope.commodity.units.length <= 0) return alert("价格单位不能为空！");

        if (!$scope.commodity._id) {//添加商品
            var fd = new FormData(document.querySelector("#commodityForm"));
            fd.append("units", JSON.stringify($scope.commodity.units));
            commoditySvc.add(fd).then(res => {
                var result = res.data,
                    state = result.state;
                if (state === 1) {
                    $rootScope.pageHelper.resetPage();
                    $rootScope.pageHelper.executePage(false);
                } else if (state === 0) {
                    var msg = result.msg;
                    if (msg) {
                        var code = msg.code;
                        if (code === "LIMIT_UNEXPECTED_FILE") return alert("上传的文件数不可以大于2个！");
                        else if (code === "LIMIT_FILE_SIZE") alert("单个文件大小不可以大于500KB！");
                    }
                    alert(JSON.stringify(msg, null, 2));
                } else alert(result.msg);
                $scope.unitShow = false;
            }).catch(catchError());
        } else {//编辑商品
            commoditySvc.update($scope.commodity).then(res => {
                var result = res.data;
                if (result.state !== 1) alert(result.msg);
                else $rootScope.pageHelper.executePage(false);
                $scope.unitShow = false;
            }).catch(catchError());
        }
    };

    $scope.remove = function (id) {
        commoditySvc.remove(id).then(res => {
            var result = res.data;
            if (result.state !== 1) return alert(result.msg);
            $rootScope.pageHelper.executePage(false);
        }).catch(catchError());
    };

    $scope.addImg = function () {
        var fd = new FormData(document.querySelector("#imgForm")),
            id = $scope.commodity._id;
        fd.append("id", id);
        commoditySvc.addImg(fd).then(res => {
            var result = res.data,
                state = result.state;
            if (state === 1) {
                var img = result.data.img;
                $scope.commodity.imgs.push(img);
                $rootScope.dataList.forEach(function (item) {
                    if (item._id === id) {
                        item.imgs.push(img);
                        return false;
                    }
                });
            } else if (state === 0) {
                var msg = result.msg;
                if (msg) {
                    var code = msg.code;
                    if (code === "LIMIT_UNEXPECTED_FILE") return alert("上传的文件数不可以大于2个！");
                    else if (code === "LIMIT_FILE_SIZE") return alert("单个文件大小不可以大于500KB！");
                }
                alert(JSON.stringify(msg, null, 2));
            } else alert(result.msg);
        }).catch(catchError());
    };

    $scope.removeImg = function (id, img) {
        commoditySvc.removeImg(id, img).then(res => {
            var result = res.data;
            if (result.state !== 1) return alert(result.msg);

            if (id === $scope.commodity._id) {
                var imgs = $scope.commodity.imgs;
                for (var i = 0; i < imgs.length; i++) {
                    var item = imgs[i];
                    if (img === item) {
                        imgs.splice(i, 1);
                        break;
                    }
                }
            }
            for (var j = 0; j < $rootScope.dataList.length; j++) {
                var item = $rootScope.dataList[j];
                if (id === item._id) {
                    for (var k = 0; k < item.imgs.length; k++) {
                        var kitem = item.imgs[k];
                        if (img === kitem) {
                            item.imgs.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }).catch(catchError());
    };

    $scope.setGroupon = function (item) {
        var groupon = item.groupon;
        if (groupon) {
            var cgroupon = angular.copy(groupon);
            cgroupon.startTime = $filter("date")(groupon.startTime, "yyyy-MM-dd");
            cgroupon.endTime = $filter("date")(groupon.endTime, "yyyy-MM-dd");
            $scope.groupon = cgroupon;
        } else {
            var now = new Date();
            $scope.groupon = {
                commodity: item._id,
                name: item.name,
                startTime: $filter("date")(now, "yyyy-MM-dd"),
                endTime: $filter("date")(now, "yyyy-MM-dd"),
            };
        }
    };

    $scope.saveGroupon = function () {
        if (!$scope.groupon.commodity) return alert("无效的关联商品编号！");
        if (!$scope.groupon.name) return alert("无效的团购商品名称！");
        if (!$scope.groupon.price || isNaN($scope.groupon.price)) return alert("无效的团购商品单价！");
        if (!$scope.groupon.standard) return alert("无效的团购商品规格！");
        if (!$scope.groupon.population || isNaN($scope.groupon.population)) return alert("无效的团购商品开团人数！");
        if (!$scope.groupon.startTime) return alert("无效的开团时间！");
        if (!$scope.groupon.endTime) return alert("无效的结束时间！");

        if (!$scope.groupon._id) {//设置团购
            commoditySvc.addGroupon($scope.groupon).then(res => {
                var result = res.data;
                if (result.state !== 1) alert(result.msg);
                else $rootScope.pageHelper.executePage(false);
                $scope.unitShow = false;
            }).catch(catchError());
        } else {//编辑团购
            commoditySvc.updateGroupon($scope.groupon).then(res => {
                var result = res.data;
                if (result.state !== 1) alert(result.msg);
                else $rootScope.pageHelper.executePage(false);
                $scope.unitShow = false;
            }).catch(catchError());
        }
    };

    $scope.removeGroupon = function (id) {
        if (!id) return alert("无效的团购商品编号！");
        commoditySvc.removeGroupon(id).then(res => {
            var result = res.data;
            if (result.state !== 1) return alert(result.msg);
            $rootScope.pageHelper.executePage(false);
        }).catch(catchError());
    };
}]);