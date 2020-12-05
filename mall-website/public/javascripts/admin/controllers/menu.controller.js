app.controller("menuCtrl", ["$scope", "$rootScope", "menuSvc", function ($scope, $rootScope, menuSvc) {
    $scope.mode = "add";
    $scope.menu = {};

    $scope.add = function () {
        $scope.mode = "add";
        $scope.menu = {};
    };

    $scope.edit = function (item) {
        $scope.mode = "edit";
        $scope.menu = angular.copy(item);
    };

    $scope.save = function () {
        if (!$scope.menu.name) return alert("菜单名称不能为空！");

        if (!$scope.menu._id) {//添加菜单
            menuSvc.add($scope.menu).then(function (res) {
                var result = res.data;
                if (result.state !== 1) return alert(result.msg);
                $rootScope.pageHelper.executePage(false);
            }).catch(catchError());
        } else {//更新菜单
            menuSvc.update($scope.menu).then(function (res) {
                var result = res.data;
                if (result.state !== 1) return alert(result.msg);
                $rootScope.pageHelper.executePage(false);
            }).catch(catchError());
        }
    };

    $scope.remove = function (id) {
        menuSvc.remove(id).then(function (res) {
            var result = res.data;
            if (result.state !== 1) return alert(result.msg);
            $rootScope.pageHelper.executePage(false);
        }).catch(catchError());
    };
}]);