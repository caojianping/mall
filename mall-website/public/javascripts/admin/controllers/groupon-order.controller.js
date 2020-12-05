app.controller("grouponOrderCtrl", ["$scope", "$rootScope", "grouponOrderSvc", function ($scope, $rootScope, grouponOrderSvc) {
    $rootScope.states = {"已取消": -10, "拼团失败": -1, "待付款": 0, "待拼团": 1, "待发货": 2, "待收货": 3, "已完成": 10};
    $rootScope.times = {"当天": 1, "最近3天": 3, "一周内": 7, "当月": 30, "半年内": 182, "一年内": 365, "全部": -1};

    $scope.send = function (id) {
        grouponOrderSvc.send(id).then(res => {
            let result = res.data;
            if (result.state !== 1) return alert(result.msg);
            $rootScope.pageHelper.executePage(false);
        }).catch(catchError());
    };
}]);