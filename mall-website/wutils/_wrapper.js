/*返回信息包裹器*/
function wrapper(status,data) {
    return {
        status:status,
        result:data
    }
}

module.exports.success=function (data) {
    return wrapper(0,data);
}

module.exports.error=function (message,errcode) {
    errcode = errcode || -1;
    message = message || "error";
    return wrapper(errcode, message);
}