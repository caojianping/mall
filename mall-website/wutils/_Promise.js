/*将含callback的异步函数转换为Promise,即可callback，又可promise*/
Promise.promiseify=Promise.promiseify|| require("./_thenify").withCallback;
//Promise.thenify=Promise.thenify||require("./_thenify");

/*在new Promise中，将callback(err,result),转为done(resolve,reject)*/
Promise.done=function (resolve, reject) {
    return function (err, value) {
        if (err) return reject(err)
        var length = arguments.length
        if (length <= 2) return resolve(value)
        var values = new Array(length - 1)
        for (var i = 1; i < length; ++i) values[i - 1] = arguments[i]
        resolve(values)
    }
}