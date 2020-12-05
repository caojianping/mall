module.exports.t_promise=function(err,time) {
    time = time || 100;
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            if (err) {
                console.log("-----in %s,%d", err, time);
                reject(err);
            }
            else {
                console.log("-----in %s,%d", "done", time);
                resolve("done");
            }
        }, time)
    })
}

module.exports.dumpObj=function(obj) {
    for (var key in obj) {
        console.log("%s->%s", key, typeof obj[key]);
    }
}