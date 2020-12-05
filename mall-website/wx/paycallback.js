var concat = require('concat-stream');
var xml2js = require('xml2js');
var common = require("./common");
var debug = require("debug")("weixin:wx");
var config=require("./config.json");
//var KEY = "dfsfsdfhjw2eqwoiujsd21eu90sakasd";
var KEY = config.key;
/*支付宝暂不使用配置，代码逐步优化317*/
var ZFBPublicKey=`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDI6d306Q8fIfCOaTXyiUeJHkr
IvYISRcc73s3vF1ZT7XN8RNPwJxo8pWaJMmvyTn9N4HQ632qJBVHf8sxHi/fEsra
prwCtzvzQETrNRwVxLO5jVmRGi60j8Ue1efIlzPXV9je9mkjzOmdssymZkh2QhUr
CmZYI/FCEa3/cNMW0QIDAQAB
-----END PUBLIC KEY-----
`;

function done(excute,platform) {
	platform = platform || "wx";
	return function (req, res) {
		req.pipe(concat(req, function (body) {
				if (platform === "wx") {
					new Promise(function (resolve, reject) {
						xml2js.parseString(body, {explicitArray: false}, function (err, json) {
							var obj = json.xml;
							if (err) return reject(err);
							if (obj.return_code === "SUCCESS" &&
								obj.result_code === "SUCCESS" &&
								common.checkSign(obj, KEY)) {
								//执行业务逻辑
								resolve(excute(obj));
							} else {
								reject("error")
							}
						})
					}).then(function () {
						//执行微信服务器回馈
						res.end(`<xml>
<return_code><![CDATA[SUCCESS]]></return_code>
<return_msg><![CDATA[OK]]></return_msg>
</xml>`);
					}).catch(function (err) {
						console.log("then err: ", err);
					});
				}
				else {
					body = req.body;
					//支付宝
					if (req.body.trade_status === "TRADE_SUCCESS" && common.checkSignZfb(req.body, ZFBPublicKey)) {
						//执行反馈
						res.end("SUCCESS");
						excute(req.body);
					} else {
						throw "alipay error:" + req.body.trade_status;
					}
				}
			})
		);
	}
}


module.exports = done;