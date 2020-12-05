function Panel() {
    this._open = function () {
        $(".panel").show(0, function () {
            $(this).animate({left: 0});
        });
    };
    this._close = function () {
        $(".panel").animate({left: "100%"}, function () {
            $(this).hide();
        });
    };
    this._initData = function () {
        var address = parseData($(".bind-address").attr("data-address"));
        if (address) {
            var id = address._id;
            if (id) {
                $(".checkbox.checked").removeClass("checked");
                $(".checkbox[data-id=" + id + "]").addClass("checked");
            }
        }
    };
}

Panel.prototype = {
    bindEvents: function () {
        var that = this;
        $(document).on("click", ".arrow", function () {
            that._open();
            that._initData();
        });
        $(document).on("click", ".panel .panel-close", function () {
            that._close();
        });
        $(document).on("click", ".address-list .address-item", function () {
            $(".checkbox.checked").removeClass("checked");
            $(".checkbox", this).addClass("checked");
            that._close();
            var address = $(this).data("address"),
                $bindAddress = $(".bind-address");
            $bindAddress.attr("data-address", JSON.stringify(address));
            $bindAddress.find(".address-linkman").text(address.linkman);
            $bindAddress.find(".address-contact").text(address.contact);
            $bindAddress.find(".address-location").text(address.location);
            $bindAddress.find(".address-default").text(!!address.isDefault ? "[默认地址]" : "");
            $bindAddress.show();
            $("a.arrow").hide();
        });
    }
};

function submit() {
    $("#submit").click(function () {
        var address = parseData($(".bind-address").attr("data-address"));
        if (!address) {
            alert("亲，您的订单还没有绑定收货地址哦！");
            return;
        }
        var type = $('[name="type"]').val();
        if (type === "1") {
            var arrs = [];
            $(".confirm-item").each(function () {
                var cart = $(this).data("cart");
                if (!cart) return true;

                arrs.push({
                    _id: cart._id,
                    commodity: cart.commodity._id,
                    unitId: cart.unitId,
                    unit: cart.unit,
                    quantity: cart.quantity
                });
            });
            if (arrs.length <= 0) return;

            $.ajax({
                url: "/order/add?type=1",
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    addressId: address._id,
                    carts: arrs
                }),
                dataType: "json",
                success: function (result) {
                    if (result.state === 1) {
                        window.location.href = "/order/pay?type=1&id=" + result.data._id;
                    } else {
                        alert(result.msg);
                    }
                }
            });
        } else if (type === "2") {
            var openGroupon = $(".confirm-item").data("opengroupon");
            $.ajax({
                url: "/order/add?type=2",
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    addressId: address._id,
                    grouponId: openGroupon.groupon._id,
                    openGrouponId: openGroupon._id,
                    quantity: parseInt($('[name="quantity"]').val())
                }),
                dataType: "json",
                success: function (result) {
                    if (result.state === 1) {
                        window.location.href = "/order/pay?type=2&id=" + result.data._id;
                    } else {
                        alert(result.msg);
                    }
                }
            });
        }
    });
}

$(function () {
    new Panel().bindEvents();
    submit();
});
