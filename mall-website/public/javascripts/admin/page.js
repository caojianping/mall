function page(app, pageUrl) {
    if (Object.prototype.toString.call(app) !== "[object Object]") {
        throw new TypeError("无效的app类型！");
    }

    app.value("pageUrl", pageUrl);

    app.factory("$exceptionHandler", function () {
        return function (exception, cause) {
            alert(exception.message);
        };
    });

    app.service("pageSvc", ["$chttp", "pageUrl", function ($chttp, pageUrl) {
        this.page = function (params) {
            return $chttp.get(pageUrl, {params: params});
        };
    }]);

    app.controller("pageCtrl", ["$scope", "$rootScope", "pageSvc", function ($scope, $rootScope, pageSvc) {
        $rootScope.dataList = [];//数据列表
        $rootScope.totalCount = 0;//总数量
        $rootScope.querystring = {pageIndex: 1, pageSize: 10};//查询对象
        $rootScope.pageNumberCount = 0;//页码数量
        $rootScope.pageIndexCount = 0;//页索引数量
        $rootScope.currentPageIndex = 1;//当前页索引
        $rootScope.selectedNumber = 1;//选中的页码
        $rootScope.pageNumberList = [];//页码列表
        $rootScope.pageSizeList = [
            {name: 5, value: 5},
            {name: 10, value: 10},
            {name: 20, value: 20},
            {name: 50, value: 50},
            {name: 100, value: 100},
            {name: 200, value: 200},
            {name: 500, value: 500},
            {name: 1000, value: 1000}
        ];//页尺寸列表

        var pageHelper = {
            resetPage: function () {
                $rootScope.querystring.pageIndex = 1;
                $rootScope.querystring.pageSize = 10;
                $rootScope.currentPageIndex = 1;
                $rootScope.selectedNumber = 1;
            },
            executePage: function (isInit) {
                isInit = !!isInit;
                var that = this;
                pageSvc.page($rootScope.querystring).then(res => {
                    var result = res.data;
                    if (result.state === 1) {
                        $rootScope.dataList = result.data;
                        $rootScope.totalCount = result.count;
                        $rootScope.pageNumberCount = Math.ceil($rootScope.totalCount / $rootScope.querystring.pageSize);
                        $rootScope.pageIndexCount = Math.ceil($rootScope.pageNumberCount / 10);
                        that.refreshPageNumberList();
                    } else {
                        if (!isInit) {
                            $rootScope.dataList = [];
                            $rootScope.totalCount = 0;
                            $rootScope.pageNumberList = [];
                        }
                    }
                }).catch(err => alert(err.message));
            },
            refreshPageNumberList: function () {
                var startNumber = ($rootScope.currentPageIndex - 1) * 10 + 1,
                    endNumber = $rootScope.currentPageIndex * 10 + 1;
                $rootScope.pageNumberList = [];
                for (var i = 0; i < $rootScope.pageNumberCount; i++) {
                    var pageNumber = i + 1;
                    if (pageNumber >= startNumber && pageNumber < endNumber) {
                        $rootScope.pageNumberList.push(pageNumber);
                    }
                }
            },
            setSelectedNumber: function (number) {
                if (number && !isNaN(number)) {
                    $rootScope.selectedNumber = number;
                } else {
                    $rootScope.selectedNumber = ($rootScope.currentPageIndex - 1) * 10 + 1;
                }
                $rootScope.querystring.pageIndex = $rootScope.selectedNumber;
            }
        };
        $rootScope.pageHelper = pageHelper;

        pageHelper.executePage(true);

        $rootScope.search = function () {
            pageHelper.resetPage();
            pageHelper.executePage();
        };

        $rootScope.pageFirst = function () {
            $rootScope.currentPageIndex = 1;
            pageHelper.setSelectedNumber();
            pageHelper.executePage();
        };

        $rootScope.pageLast = function () {
            $rootScope.currentPageIndex = $rootScope.pageIndexCount;
            pageHelper.setSelectedNumber();
            pageHelper.executePage();
        };

        $rootScope.pageUp = function () {
            if ($rootScope.currentPageIndex > 1) {
                $rootScope.currentPageIndex--;
                pageHelper.setSelectedNumber();
                pageHelper.executePage();
            }
        };

        $rootScope.pageDown = function () {
            if ($rootScope.currentPageIndex < $rootScope.pageIndexCount) {
                $rootScope.currentPageIndex++;
                pageHelper.setSelectedNumber();
                pageHelper.executePage();
            }
        };

        $rootScope.pageNumber = function (number) {
            pageHelper.setSelectedNumber(number);
            pageHelper.executePage();
        };

        $rootScope.pageSize = function () {
            $rootScope.querystring.pageIndex = 1;
            $rootScope.currentPageIndex = 1;
            $rootScope.selectedNumber = 1;
            pageHelper.executePage();
        };

        $rootScope.buildImgSrc = function (data, path) {
            path = path || "/imgs/";
            let result = "/images/empty.png";
            if (data) {
                if (Array.isArray(data)) {
                    if (data.length > 0 && data[0]) {
                        result = path + data[0];
                    }
                } else if (typeof data === "string") {
                    result = path + data;
                }
            }
            return result;
        };
    }]);
}