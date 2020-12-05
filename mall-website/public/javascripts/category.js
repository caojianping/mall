function toggle() {
    $(".toggle").click(function () {
        var $menus = $(".menus"),
            $cates = $(".cates"),
            flag = $(this).attr("data-toggle");
        if (flag === "1") {
            $(this).attr("data-toggle", 0);
            $menus.animate({"width": 0}, function () {
                $(this).hide();
            });
            $cates.animate({"margin-left": 0});
            $cates.addClass("open");
        } else if (flag === "0") {
            $(this).attr("data-toggle", 1);
            $menus.show().animate({"width": 80});
            $cates.animate({"margin-left": 81});
            $cates.removeClass("open");
        }
    });
}

$(function () {
    toggle();
});
