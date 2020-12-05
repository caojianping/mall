function init() {
    $("#username").focus();
    $(".alert").delay(2000).slideUp();
    $(document).keydown(function (event) {
        if (event.keyCode === 13) {
            $("#loginForm").submit();
        }
    });
}

$(function () {
    init();
});