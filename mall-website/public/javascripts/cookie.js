function Cookie() {
    this._isObject = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Object]";
    };
    this._setExpire = function (time) {
        time = Number(time);
        time = !isNaN(time) ? time : 24 * 7;
        var HOUR = 3600000,
            date = new Date();
        date.setTime(date.getTime() + HOUR * time);
        return "expires=" + date.toGMTString();
    };
}

Cookie.prototype = {
    get: function (key) {
        if (!key) {
            return null;
        }
        var skey = key + "=",
            arrs = document.cookie.split(";");
        if (arrs.length <= 0) {
            return null;
        }
        var result = "";
        for (var i = 0; i < arrs.length; i++) {
            var item = arrs[i];
            if (item.indexOf(skey) === 0) {
                result = item.substring(skey.length, item.length);
                break;
            }
        }
        return result;
    },
    set: function (key, value, time) {
        if (!key) {
            return;
        }
        var that = this,
            expire = that._setExpire(time);
        document.cookie = key + "=" + value + ";" + expire;
    },
    setMulti: function (obj, time) {
        var that = this;
        if (!obj || !that._isObject(obj)) {
            return;
        }
        for (var key in obj) {
            that.set(key, obj[key], time);
        }
    },
    clear: function (key) {
        this.set(key, "", -1);
    }
};