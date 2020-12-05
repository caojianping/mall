var wrap=require("./_wrapper");
var http=require("http");
http.ServerResponse.prototype.success__= function (obj) {
    this.json(wrap.success(obj));
}

http.ServerResponse.prototype.error__=function (obj) {
    this.json(wrap.error(obj,-1));
}

