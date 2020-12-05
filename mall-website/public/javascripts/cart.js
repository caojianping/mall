function Cart() {
    this.isDelete = false;

    this._done = function () {
        var total = 0;
        $(".checkbox.checked:not(.checkbox-all)").each(function () {
            var cart = $(this).data("cart");
            if (!cart) return true;

            var unit = cart.unit;
            if (!unit) return true;

            var $calculate = $(this).parents("tr").find(".calculate"),
                quantity = $calculate.calculate("getQuantity");
            total += unit.price * unit.discount * quantity;
        });
        console.log("total:", total);
        $("#total").text(total.toFixed(2));
    };

    this._init = function () {
        var that = this;
        $(".calculate").calculate({
            onChange: function () {
                that._done();
            }
        });
    };
    this._init();
}

Cart.prototype = {
    checkbox: function () {
        var that = this;

        $(document).off(".checkbox_event");

        $(document).on("click.checkbox_event", ".checkbox", function (event) {
            if (!$(event.target).is("input")) {
                if ($(this).hasClass("checkbox-all")) {
                    if ($(this).hasClass("checked")) {
                        $(this).removeClass("checked");
                        $(".checkbox:not(.checkbox-all)").removeClass("checked");
                        $('.checkbox:not(.checkbox-all) [type="checkbox"]').prop("checked", false);
                    } else {
                        $(this).addClass("checked");
                        $(".checkbox:not(.checkbox-all)").addClass("checked");
                        $('.checkbox:not(.checkbox-all) [type="checkbox"]').prop("checked", true);
                    }
                } else {
                    $(this).toggleClass("checked");
                    $(this).find('[type="checkbox"]').prop("checked", $(this).hasClass("checked"));

                    var $all = $(".checkbox-all");
                    $all.removeClass("checked");
                    if ($(".checkbox.checked:not(.checkbox-all)").length === $(".checkbox:not(.checkbox-all)").length) {
                        $all.addClass("checked");
                    }
                }
                if (!that.isDelete) {
                    that._done();
                }
            }
        });

        $(document).on("click.checkbox_event", '[type="checkbox"]', function (event) {
            return false;
        });
    },
    edit: function () {
        var that = this;
        $("#edit").click(function () {
            if (!that.isDelete) {
                that.isDelete = true;
                $(this).text("完成");
                $("#settle,#wtotal").hide();
                $("#remove").show();
                $(".checkbox.checked").removeClass("checked");
                $('.checkbox [type="checkbox"]').prop("checked", false);
            } else {
                that.isDelete = false;
                $(this).text("编辑");
                $("#settle,#wtotal").show();
                $("#remove").hide();
            }
        });
    },
    remove: function () {
        $("#remove").click(function () {
            if ($(".checkbox.checked:not(.checkbox-all)").length <= 0) return false;
            $("#cartForm").submit();
        });
    },
    settle: function () {
        $("#settle").click(function () {
            var arrs = [];
            $(".checkbox.checked:not(.checkbox-all)").each(function () {
                var id = $(this).find('[type="checkbox"]').val(),
                    $calculate = $(this).parents("tr").find(".calculate"),
                    quantity = $calculate.calculate("getQuantity");
                arrs.push({id: id, quantity: quantity});
            });
            if (arrs.length <= 0) return;

            $.ajax({
                url: "/cart/settle",
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(arrs),
                dataType: "json",
                success: function (result) {
                    if (result.state === 1) {
                        window.location.href = "/order/confirm?type=1";
                    } else {
                        alert(result.msg);
                    }
                }
            });
        });
    }
};

$(function () {
    var cart = new Cart();
    cart.checkbox();
    cart.edit();
    cart.remove();
    cart.settle();
});
