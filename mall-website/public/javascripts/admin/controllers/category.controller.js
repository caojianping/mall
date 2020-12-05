app.controller("categoryCtrl", ["$scope", "$rootScope", "categorySvc", function ($scope, $rootScope, categorySvc) {
    $rootScope.menus = [];
    $scope.mode = "add";
    $scope.category = {};

    (function init() {
        categorySvc.getMenus().then(res => {
            var result = res.data;
            if (result.state !== 1) return alert(result.msg);
            $rootScope.menus = result.data;
            $rootScope.menus.unshift({name: "请选择菜单", value: ""});
        }).catch(catchError());
    })();

    $scope.add = function () {
        $scope.mode = "add";
        $scope.category = {};
    };

    $scope.edit = function (item) {
        $scope.mode = "edit";
        $scope.category = {
            _id: item._id,
            name: item.name,
            parent: item.parent ? item.parent._id : "",
            img: item.img
        };
    };

    $scope.save = function () {
        if (!$scope.category.name) return alert("分类名称不能为空！");
        if (!$scope.category.parent) return alert("父级菜单不能为空！");

        if (!$scope.category._id) {//添加分类
            var fd = new FormData(document.querySelector("#categoryForm"));
            alert("save:" + JSON.stringify(fd, null, 2));
            categorySvc.add(fd).then(res => {
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
                        else if (code === "LIMIT_FILE_SIZE") return alert("单个文件大小不可以大于500KB！");
                    }
                    alert(JSON.stringify(msg, null, 2));
                } else alert(result.msg);
            }).catch(catchError());
        } else {//更新分类
            categorySvc.update($scope.category).then(res => {
                let result = res.data;
                if (result.state !== 1) return alert(result.msg);
                $rootScope.pageHelper.executePage(false);
            }).catch(catchError());
        }
    };

    $scope.remove = function (id) {
        categorySvc.remove(id).then(res => {
            let result = res.data;
            if (result.state !== 1) return alert(result.msg);
            $rootScope.pageHelper.executePage(false);
        }).catch(catchError());
    };

    $scope.addImg = function () {
        var id = $scope.category._id,
            fd = new FormData(document.querySelector("#imgForm"));
        fd.append("id", id);
        alert("addImg:" + JSON.stringify(fd, null, 2));
        categorySvc.addImg(fd).then(res => {
            var result = res.data,
                state = result.state;
            if (state === 1) {
                var img = result.data.img;
                if ($scope.category._id === id) {
                    $scope.category.img = img;
                }
                $rootScope.dataList.forEach(function (item) {
                    if (item._id === id) {
                        item.img = img;
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
        categorySvc.removeImg(id, img).then(res => {
            var result = res.data;
            if (result.state !== 1) return alert(result.msg);

            if ($scope.category._id === id) {
                $scope.category.img = null;
            }
            $rootScope.dataList.forEach(function (item) {
                if (item._id === id) {
                    item.img = null;
                }
            });
        }).catch(catchError());
    };
}]);