// require("./Map");
// require("./_Date");
require("./_Promise");
// require("./_String");
// require("./_ServerResponse");
// require("./_Array");
// require("./Set");

/*引入测试模块*/
var tester= require("./tester")
for(var key in tester) {
    module.exports[key] = tester[key];
}

function sha1(str) {
    var h= require('crypto').createHash('sha1');
    return h.update(str).digest('hex');
}

//module.exports.promiseify=require("./_thenify").withCallback;
module.exports.sha1=sha1;
//module.exports.done=done;
module.exports.success=require("./_wrapper").success;
module.exports.error=require("./_wrapper").error;