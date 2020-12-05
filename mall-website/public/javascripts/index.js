function carousel() {
    $("#grouponList").jcarousel({
        width: "100%",
        height: 186,
        showCount: 1,
        autoplay: true,
        speed: 3680,
        mobile: true,
        indicator: true
    });

    $("#discountList").jcarousel({
        width: "100%",
        height: 166,
        showCount: 3,
        autoplay: true,
        speed: 3286,
        mobile: true,
        indicator: true
    });

    $("#hotList").jcarousel({
        width: "100%",
        height: 136,
        offset: 86,
        showCount: 1,
        autoplay: true,
        speed: 3468,
        mobile: true
    });
}

$(function () {
    carousel();
});