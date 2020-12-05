function Share() {
    this.config = function (sign) {
        if (wx && sign) {
            wx.config({
                debug: false,
                appId: sign.appid || sign.appID,
                timestamp: sign.timestamp,
                nonceStr: sign.noncestr,
                signature: sign.signature,
                jsApiList: [
                    "onMenuShareAppMessage",
                    "onMenuShareTimeline",
                    "onMenuShareQQ",
                    "onMenuShareQZone",
                    "onMenuShareWeibo"
                ]
            });
        }
    };
    this.ready = function (data) {
        function shareSuccess() {
            alert("分享成功！");
        }

        function shareCancel() {
            alert("取消分享！");
        }

        if (wx && data) {
            wx.ready(function () {
                wx.error(function () {
                    alert("wx.ready error:" + JSON.stringify(arguments, null, 2));
                });
                //分享至朋友
                wx.onMenuShareAppMessage({
                    title: data.title,
                    desc: data.desc,
                    link: data.link,
                    imgUrl: data.imgUrl,
                    success: function () {
                        shareSuccess();
                    },
                    cancel: function () {
                        shareCancel();
                    }
                });
                //分享至朋友圈
                wx.onMenuShareTimeline({
                    title: data.title,
                    desc: data.desc,
                    link: data.link,
                    imgUrl: data.imgUrl,
                    success: function () {
                        shareSuccess();
                    },
                    cancel: function () {
                        shareCancel();
                    }
                });
                //分享至QQ
                wx.onMenuShareQQ({
                    title: data.title,
                    desc: data.desc,
                    link: data.link,
                    imgUrl: data.imgUrl,
                    success: function () {
                        shareSuccess();
                    },
                    cancel: function () {
                        shareCancel();
                    }
                });
                //分享至QQ空间
                wx.onMenuShareQZone({
                    title: data.title,
                    desc: data.desc,
                    link: data.link,
                    imgUrl: data.imgUrl,
                    success: function () {
                        shareSuccess();
                    },
                    cancel: function () {
                        shareCancel();
                    }
                });
                //分享至腾讯微博
                wx.onMenuShareWeibo({
                    title: data.title,
                    desc: data.desc,
                    link: data.link,
                    imgUrl: data.imgUrl,
                    success: function () {
                        shareSuccess();
                    },
                    cancel: function () {
                        shareCancel();
                    }
                });
            });
        }
    };
}

Share.prototype.init = function (url, data, callback) {
    if (!url) {
        return;
    }
    var that = this;
    $.ajax({
        url: url,
        type: "POST",
        data: {url: window.location.href},
        dataType: "json",
        success: function (result, status, xhr) {
            var state = result.state;
            if (state === 1) {
                that.config(result.data);
                if (callback) {
                    let hdata = callback(result.suser);
                    that.ready(hdata);
                } else {
                    that.ready(data);
                }
            } else if (state === 0) {
                alert(result.msg);
            } else {
                alert("不支持的处理状态！");
            }
        },
        error: function (xhr, status, error) {
            alert("微信signature获取失败！");
        }
    });
};