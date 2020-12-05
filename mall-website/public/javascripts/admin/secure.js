function init() {
    var $msg = $("#msg");
    if ($msg.length > 0) {
        var $alert = $(".alert"),
            msg = $msg.data("msg");
        switch (msg) {
            case 1:
                $msg.text("新密码修改成功！稍后将跳转至登录页面重新登录！");
                setTimeout(function () {
                    window.location.href = "/admin/account/login?from=pwd";
                }, 2000);
                break;
            case -2:
                $msg.text("原密码输入不正确！");
                $alert.delay(2800).slideUp();
                break;
            case -3:
                $msg.text("两次密码输入不一致！");
                $alert.delay(2800).slideUp();
                break;
            case -4:
                $msg.text("新密码修改失败！");
                $alert.delay(2800).slideUp();
                break;
        }
    }
}

$(function () {
    init();
});