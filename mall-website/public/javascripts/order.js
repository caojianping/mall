function init() {
    var $item = $(".order-nav-item"),
        width = $item.width();
    $(".order-navs-list").width(width * $item.length);

    var right = $(".order-nav-item.active").position().left + width,
        w = $(window).width();
    if (right > w) {
        $(".order-navs").scrollLeft(right - w);
    }
}

$(function () {
    init();
});
