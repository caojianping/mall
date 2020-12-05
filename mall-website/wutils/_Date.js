Date.PERSECOND__=1000;
Date.PERMINUTE__=60*Date.PERSECOND__;
Date.PERHOUR__=60*Date.PERMINUTE__;
Date.PERDAY__=24*Date.PERHOUR__;
Date.MINDATE__=new Date("1900-1-1");

/*必须传入8，或者14位无符号日期*/
Date.fromCustomerDate__=function (strdate) {
    if(strdate.length===8)
        strdate=strdate.substr(0, 4) + "." + strdate.substr(4, 2) + "." + strdate.substr(6, 2);
    else if(strdate.length===14)
        strdate=strdate.substr(0, 4) + "." + strdate.substr(4, 2) + "." + strdate.substr(6, 2)+" "+
            strdate.substr(8,2)+":"+strdate.substr(10,2)+":"+strdate.substr(12,2);
    else throw "无效日期字符串";
    return new Date(strdate);
}

function toDateN(strdate){
    return  Date.parse(strdate.substr(0, 4) + "." + strdate.substr(4, 2) + "." + strdate.substr(6, 2))
}


Date.prototype.toString__=function (fmt) { //author: meizz
    fmt = fmt || "yyyy-MM-dd HH:mm:ss";
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() >= 12 ? this.getHours() - 12 : this.getHours(), //小时
        "H+": this.getHours(),//小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

Date.prototype.date__=function () {
    return new Date(this.getFullYear(),this.getMonth(),this.getDate());
}

Date.prototype.dayOfWeek__=function () {
    return this.getDay();
}

Date.prototype.addMilliseconds__=function (d) {
    return new Date(this.getTime()+d);
}
Date.prototype.addSeconds__=function (second) {
    return this.addMilliseconds__(second*Date.PERSECOND__);
}
Date.prototype.addMinutes__=function (minutes) {
    return this.addMilliseconds__(minutes*Date.PERMINUTE__);
}
Date.prototype.addHours__=function (h) {
    return this.addMilliseconds__(h*Date.PERHOUR__);
}
Date.prototype.addDays__=function (day) {
    return this.addMilliseconds__(day*Date.PERDAY__);
}
Date.prototype.timeOfDay__=function (start) {
    start=start||this.date__();
    return this - start;
}
Date.prototype.eq__=function (date) {
    return this - date === 0;
}

Date.prototype.GetStartDate = function () {
    return new Date(this.getFullYear(),this.getMonth(), this.getDate()).getTime();
}

// Date.prototype.AddDay =Date.prototype.addDays__;

// Date.prototype.AddHour =Date.prototype.addHours__;

//Date.prototype.AddSecond =Date.prototype.addSeconds__;

