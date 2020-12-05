function parseData(data) {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

function units(fn) {
    $(document).on("click", ".standard-item", function (event) {
        event.stopPropagation();
        event.preventDefault();
        var $commodityInfo = $(this).parents(".commodity-info"),
            $commodityStandards = $commodityInfo.find(".commodity-standards"),
            $commodityPrices = $commodityInfo.find(".commodity-prices"),
            index = $(this).index();
        console.log(index);
        $commodityStandards.find(".standard-item.on").removeClass("on");
        $(this).addClass("on");
        $commodityPrices.find(".price-item.on").removeClass("on");
        $commodityPrices.find(".price-item").eq(index-1).addClass("on");
        if (fn) {
            fn();
        }
    });
}

function groupon() {
    (function grouponCalculate() {
        function done(quantity) {
            $('#openGrouponForm [name="quantity"],#joinGrouponForm [name="quantity"]').val(quantity);
        }

        $("#grouponCalc").calculate({
            onChange: function (quantity) {
                done(quantity);
            }
        });
    })();

    $(document).on("click", "[data-type]", function () {
        var type = $(this).data("type"),
            $popover = $(".popover"),
            $openGrouponForm = $("#openGrouponForm"),
            $joinGrouponForm = $("#joinGrouponForm");
        if (type === "open") {
            $openGrouponForm.show();
            $joinGrouponForm.hide();
        } else if (type === "join") {
            $openGrouponForm.hide();
            $joinGrouponForm.show();
            var item = $(this).data("item");
            if (item) {
                $joinGrouponForm.find('[name="openGrouponId"]').val(item._id);
            }
        } else return alert("无效的操作指令！");
        $popover.show();
    });

    $(document).on("click", ".popover .popover-close", function () {
        $(".popover").hide();
    });
}