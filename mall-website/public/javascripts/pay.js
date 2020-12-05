if (typeof WeixinJSBridge === "undefined") {
    if (document.addEventListener) {
        document.addEventListener("WeixinJSBridgeReady", onBridgeReady, false);
    } else if (document.attachEvent) {
        document.attachEvent("WeixinJSBridgeReady", onBridgeReady);
        document.attachEvent("onWeixinJSBridgeReady", onBridgeReady);
    }
} else {
    onBridgeReady();
}

function onBridgeReady() {
    $(function () {
        $("#pay").click(function () {
            var type = $('[name="type"]').val(),
                id = $('[data-id]').data("id");
            $.get("/pay/create?type=" + type + "&id=" + id, function (result) {
                let state = result.state;
                if (state === 1) {
                    WeixinJSBridge.invoke("getBrandWCPayRequest", result.data, function (res) {
                        if (res.err_msg === "get_brand_wcpay_request:ok") {
                            alert("微信支付成功！");
                            //弹出邀请好友分享面板
                        } else {
                            alert(JSON.stringify(res, null, 2));
                        }
                    });
                } else {
                    alert("创建微信支付失败！");
                }
            });
        });
    });
}