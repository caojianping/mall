function $chttp(app) {
    if (Object.prototype.toString.call(app) !== "[object Object]") {
        throw new TypeError("无效的app类型！");
    }
    app.service("$chttp", ["$http", function ($http) {
        var $loader = $(".loader");

        this.common = function (data) {
            $loader.show();
            return $http(data).then(res => {
                $loader.hide();
                return res;
            }).catch(err => {
                $loader.hide();
                return Promise.reject(err);
            });
        };

        this.get = function (url, data, config) {
            $loader.show();
            return $http.get(url, data, config).then(res => {
                $loader.hide();
                return res;
            }).catch(err => {
                $loader.hide();
                return Promise.reject(err);
            });
        };

        this.post = function (url, data, config) {
            $loader.show();
            return $http.post(url, data, config).then(res => {
                $loader.hide();
                return res;
            }).catch(err => {
                $loader.hide();
                return Promise.reject(err);
            });
        };
    }]);
}

function catchError() {
    return function (err) {
        var msg = "";
        if (Object.prototype.toString.call(err) === "[object Object]") {
            msg = JSON.stringify(err, null, 2);
        } else {
            msg = String(err);
        }
        alert("err:" + msg);
    };
}