"use strict";

String.prototype.startsWith = function (str) {
    return this.indexOf(str) === 0;
};

String.prototype.equals = function (str) {
    return this.toString() === str;
};

Date.prototype.addDays = function (value) {
    if (!value || isNaN(value)) {
        value = 0;
    }
    let clone = new Date(this.getTime()),
        result = clone.setDate(clone.getDate() + value);
    return new Date(result);
};

Date.prototype.getMorning = function () {
    let year = this.getFullYear(),
        month = this.getMonth(),
        day = this.getDate();
    return new Date(year, month, day);
};

Date.prototype.getWeeks = function () {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    let d1 = this,
        d2 = new Date(d1.getFullYear(), 0, 1),
        diff = d1 - d2,
        days = Math.ceil(diff / ONE_DAY);
    return Math.ceil(days / 7);
};

Date.prototype.toFormatString = function (format, zero) {
    format = format || "yyyy-MM-dd hh:mm:ss";
    zero = !!zero;
    let dy = this.getFullYear(),
        dM = this.getMonth() + 1,
        dd = this.getDate(),
        dh = this.getHours(),
        dm = this.getMinutes(),
        ds = this.getSeconds(),
        dS = this.getMilliseconds(),
        config = {
            "y+": dy.toString(),
            "M+": !zero ? dM.toString() : dM < 10 ? "0" + dM : dM.toString(),
            "d+": !zero ? dd.toString() : dd < 10 ? "0" + dd : dd.toString(),
            "h+": !zero ? dh.toString() : dh < 10 ? "0" + dh : dh.toString(),
            "m+": !zero ? dm.toString() : dm < 10 ? "0" + dm : dm.toString(),
            "s+": !zero ? ds.toString() : ds < 10 ? "0" + ds : ds.toString(),
            "S": dS.toString()
        };
    for (let i in config) {
        let item = config[i],
            pattern = new RegExp(i);
        if (pattern.test(format)) {
            let matches = format.match(pattern);
            if (matches) {
                let first = matches[0];
                if (i === "S") {
                    format = format.replace(first, item);
                } else {
                    format = format.replace(first, item.substr(item.length - first.length));
                }
            }
        }
    }
    return format;
};

Date.prototype.toLottoString = function () {
    const SECOND = 1000;//1秒
    const MINUTE = 60 * 1000;//1分钟
    const HOUR = 60 * 60 * 1000;//1小时
    const DAY = 24 * 60 * 60 * 1000;//1天
    const MONTH = 30 * 24 * 60 * 60 * 1000;//1月
    const YEAR = 12 * 30 * 24 * 60 * 60 * 1000;//1年
    let diff = new Date().getTime() - this.getTime();
    if (diff >= 0 && diff < 30 * SECOND) {
        return "刚刚";
    } else if (diff >= 30 * SECOND && diff < MINUTE) {
        return Math.floor(diff / SECOND) + "秒之前";
    } else if (diff >= MINUTE && diff < HOUR) {
        return Math.floor(diff / MINUTE) + "分钟之前";
    } else if (diff >= HOUR && diff < DAY) {
        return Math.floor(diff / HOUR) + "小时之前";
    } else if (diff >= DAY && diff < MONTH) {
        let days = Math.floor(diff / DAY);
        return days % 7 === 0 ? (days / 7) + "个星期之前" : days + "天之前";
    } else if (diff >= MONTH && diff < YEAR) {
        let months = Math.floor(diff / MONTH);
        return months === 6 ? "半年之前" : months + "个月之前";
    } else if (diff >= YEAR && diff < YEAR + 7 * DAY) {
        return "一年之前";
    } else {
        return this.toFormatString("yyyy/MM/dd", true);
    }
};

Array.prototype.isExist = function (key, value) {
    if (!key) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return true;
            }
        }
        return false;
    } else {
        for (let i = 0; i < this.length; i++) {
            let item = this[i];
            if (item.hasOwnProperty(key) && item[key] === value) {
                return true;
            }
        }
        return false;
    }
};

Array.prototype.sum = function (key) {
    let result = 0;
    if (!key) {
        for (let i = 0; i < this.length; i++) {
            result += this[i];
        }
    } else {
        for (let i = 0; i < this.length; i++) {
            let item = this[i];
            if (item.hasOwnProperty(key) && !isNaN(item[key])) {
                result += item[key];
            }
        }
    }
    return result;
};

Array.prototype.firstOrDefault = function (key, value) {
    return this.filter(function (item) {
            if (!key) {
                return item === value;
            } else {
                return item[key] === value;
            }
        })[0] || null;
};