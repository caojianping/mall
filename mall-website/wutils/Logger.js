var fs=require('fs'),
    path=require('path');

function getLogger(configFileName) {
    try {
        var log4js =require('log4js');
        if (log4js) {
            if (fs.existsSync(configFileName))
                log4js.configure(configFileName);
            return log4js.getLogger();
        }
        throw "none loghandler";
    }
    catch (e) {
        return {
            trace: msg=>console.log("%s trace %s", new Date().toString__("yy-MM-dd HH:mm:ss"), msg),
            debug: msg=>console.log("%s debug %s", new Date().toString__("yy-MM-dd HH:mm:ss"), msg),
            info: msg=>console.log("%s info %s", new Date().toString__("yy-MM-dd HH:mm:ss"), msg),
            warn: msg=>console.log("%s warn %s", new Date().toString__("yy-MM-dd HH:mm:ss"), msg),
            error: msg=>console.log("%s error %s", new Date().toString__("yy-MM-dd HH:mm:ss"), msg),
            fatal: msg=>console.log("%s fatal %s", new Date().toString__("yy-MM-dd HH:mm:ss"), msg)
        }
    }
}

module.exports=getLogger;

