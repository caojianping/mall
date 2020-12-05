var request = require("request");

var config = {
	wx: {
		appid: "wx2048ea21cde46005",
		redirect_uri: encodeURIComponent("http://jk.epg.org.cn/users/callback/wx"),
		key: "c3aff4735aa28c070e65f5c1af3e6131",
		state: "jsjhycl",
		geturl: function () {
			return 'https://open.weixin.qq.com/connect/qrconnect?appid=' + this.appid + '&redirect_uri=' + this.redirect_uri + '&response_type=code&scope=snsapi_login&state=' + this.state + '#wechat_redirect';
		},
		getAccess_token_url: function (code) {
			return `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appid}&secret=${this.key}&code=${code}&grant_type=authorization_code`;
		},
		done: doweixin
	},
	qq: {
		appid: "101354775",
		redirect_uri: encodeURIComponent("http://jk.epg.org.cn/users/callback/qq"),
		key: "ea2a2517519b879320fdda61bc7ab3a4",
		state: "woaiderenheaiwoderen",
		geturl: function () {
			return 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=' + this.appid + '&redirect_uri=' + this.redirect_uri + '&state=' + this.state;
		},
		getAccess_token_url: function (code) {
			return `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${this.appid}&client_secret=${this.key}&code=${code}&state=${this.state}&redirect_uri=${this.redirect_uri}`;
		},
		done: doqq
	},
	wb: {
		appid: "1917322377",
		redirect_uri: encodeURIComponent("http://jk.epg.org.cn/users/callback/wb"),
		key: "247e27505f9731e8da89234d86cfe040",
		state: "abckdhglwehjvgdlfsdf",
		geturl: function () {
			return `https://api.weibo.com/oauth2/authorize?client_id=${this.appid}&redirect_uri=${this.redirect_uri}&response_type=code&state=${this.state}`;
		},
		getAccess_token_url: function (code) {
			return `https://api.weibo.com/oauth2/access_token?client_id=${this.appid}&client_secret=${this.key}&grant_type=authorization_code&redirect_uri=${this.redirect_uri}&code=${this.code}`
		},
		done: dowb
	},
	db: {
		appid: "",
		redirect_uri: encodeURIComponent("http://jk.epg.org.cn/users/callback/db"),
		key: "",
		state: "abckdhglwehjvgdlfsdf",
		geturl: function () {
			return `https://www.douban.com/service/auth2/auth?client_id=${this.appid}&redirect_uri=${this.redirect_uri}&response_type=code&scope=scope&state=${this.state}`;
		},
		getAccess_token_url: function (code) {
			return `https://www.douban.com/service/auth2/token?client_id=${this.appid}&client_secret=${this.key}&redirect_uri=${this.redirect_uri}&grant_type=authorization_code&code=${this.code}`;
		},
		done: dodb
	}
};
/*返回重定向地址*/
function login(platform) {
	if (platform in config) {
		return config[platform].geturl();
	} else throw "no support login,source:" + platform;
}

/*处理回掉
 * callback回调
 * */
function callback(cb) {
	return function (req, res) {
		var platform = req.params.platform;
		if (platform in config) {
			config[platform].done(req, res, cb);
		} else throw "no auth callback,source:" + platform;
	}
}

/*解析openid和用户基本信息，目前网站登录好像不支持*/
function doweixin(req, res, cb) {
	var access_token_url = this.getAccess_token_url(req.query.code);
	return new Promise(function (resolve, reject) {
		request.get(access_token_url, function (err, srm, body) {
			body = JSON.parse(body);
			if (err) reject("requert access_token err" + err);
			else {
				if ("openid" in body) resolve(body.openid);
				else  reject("none openid return");
			}
		});
	}).then(function (openid) {
		cb(req, res, {
			openid: openid,
			src: "wx"
		});
	}).catch(err=> {
		throw err
	});
}

/*解析openid和用户基本信息*/
function doqq(req, res, cb) {
	var access_token_url = this.getAccess_token_url(req.query.code);
	request.get(access_token_url, function (err, srm, body) {
		if (err) throw err;
		var url = "https://graph.qq.com/oauth2.0/me?access_token=" + require("querystring").parse(body).access_token;
		request.get(url, function (err, srm, body) {
			if (err) throw err;
			var result = JSON.parse(body.match(/{[^}]+}/)[0]);
			cb(req, res, {
				openid: result.openid,
				src: "qq"
			});
		})
	})
}

function dowb(req, res, cb) {
	var access_token_url = this.getAccess_token_url(req.query.code);
	return new Promise(function (resolve, reject) {
		request.get(access_token_url, function (err, srm, body) {
			body = JSON.parse(body);
			if (err) reject("requert access_token err" + err);
			else {
				if ("uid" in body) resolve(body.uid);
				else  reject("none openid return");
			}
		});
	}).then(function (openid) {
		cb(req, res, {
			openid: openid,
			src: "wb"
		});
	}).catch(err=> {
		throw err;
	});
}

function dodb(req, res, cb) {
	var access_token_url = this.getAccess_token_url(req.query.code);
	return new Promise(function (resolve, reject) {
		request.get(access_token_url, function (err, srm, body) {
			body = JSON.parse(body);
			if (err) reject("requert access_token err" + err);
			else {
				if ("douban_user_id" in body) resolve(body["douban_user_id"]);
				else  reject("none openid return");
			}
		});
	}).then(function (openid) {
		cb(req, res, {
			openid: openid,
			src: "db"
		});
	}).catch(err=> {
		throw err;
	});
}

module.exports = {
	getLoginUrl: login,
	callback: callback
}