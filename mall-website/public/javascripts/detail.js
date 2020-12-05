function init() {
    var msg = $('[name="msg"]').val();
    if (msg) {
        alert(msg);
    }
    $(".jcarousel").jcarousel({
        width: "100%",
        height: 216,
        showCount: 1,
        autoplay: true,
        speed: 3000,
        mobile: true,
        indicator: true
    });
}

function commodity() {
    (function comodityCalculate() {
        function done() {
            var quantity = $("#commodityCalc").calculate("getQuantity"),
                unit = $(".commodity .commodity-prices .price-item.on").data("unit");
            if (!unit) return;

            let money = unit.price * unit.discount * quantity;
            $("#total").text(money.toFixed(2));
        }

        $("#commodityCalc").calculate({
            onChange: function (quantity) {
                done(quantity);
            }
        });

        done();

        units(function () {
            done();
        });
    })();

    $(document).on("click", "[data-action]", function () {
        var commodityId = $("#commodityId").val();
        if (!commodityId) return alert("无效的商品编号！");

        var unit = $(".commodity-prices .price-item.on").data("unit");
        if (!unit) return alert("无效的价格单位！");

        var unitId = unit._id;
        if (!unitId) return alert("无效的单位编号！");

        var quantity = $(".calculate").calculate("getQuantity");
        if (quantity <= 0) return alert("无效的商品数量！");

        var immediate = $(this).data("action") || 0;
        $.ajax({
            url: "/cart/add?immediate=" + immediate,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                commodityId: commodityId,
                unitId: unitId,
                quantity: quantity
            }),
            dataType: "json",
            success: function (result) {
                let state = result.state;
                if (state === 1) {
                    $("#cartQuantity").text(result.count);
                    if (immediate === 1) {
                        window.location.href = "/order/confirm?type=1";
                    } else {
                        alert("添加成功！");
                    }
                } else if (state === 0) {
                    alert(JSON.stringify(result.msg, null, 2));
                } else {
                    let STATE_CONFIG = {
                        "-1": "用户不存在！",
                        "-2": "更新购物车失败！",
                        "-3": "添加购物车失败！"
                    };
                    alert(STATE_CONFIG[state.toString()]);
                }
            }
        });
    });
}

$(function () {
    init();
    commodity();
    groupon();
});
