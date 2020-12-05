;(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".calculate_event",
        CACHE_KEY = "calculate_cache";

    var CLASS_CALCULATE = "calculate",
        CLASS_SUB = "calculate-sub",
        CLASS_QUANTITY = "calculate-quantity",
        CLASS_ADD = "calculate-add";

    var Calculator = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };

    Calculator.prototype.constructor = Calculator;

    Calculator.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM(this);
                    that.clearData(this);
                    that.setData(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.calculate.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        renderDOM: function (element) {
            var html = '<span class="' + CLASS_SUB + '"></span>' +
                '<input class="' + CLASS_QUANTITY + '" type="number" />' +
                '<span class="' + CLASS_ADD + '"></span>';
            $(element).empty().append(html);
        },
        clearData: function (element) {
            $(element).find("." + CLASS_QUANTITY).val(0);
        },
        setData: function (element) {
            if (!$(element).hasClass(CLASS_CALCULATE)) {
                $(element).addClass(CLASS_CALCULATE);
            }
            var quantity = parseInt($(element).attr("data-quantity"));
            if (!isNaN(quantity) && quantity > 0) {
                $(element).find("." + CLASS_QUANTITY).val(quantity);
            }
        },
        bindEvents: function (element) {
            var that = this;
            //减法
            $(element).on("click" + EVENT_NAMESPACE, "." + CLASS_SUB, {element: element}, function (event) {
                var current = event.data.element,
                    $quantity = $(current).find("." + CLASS_QUANTITY),
                    quantity = parseInt($quantity.val());
                if (!isNaN(quantity) && quantity > 0) {
                    quantity--;
                } else {
                    quantity = 0;
                }
                that.setQuantity($(current), $quantity, quantity);
                var cache = $.data(current, CACHE_KEY);
                if (cache && cache.onChange) {
                    cache.onChange.call(this, quantity);
                }
            });
            //加法
            $(element).on("click" + EVENT_NAMESPACE, "." + CLASS_ADD, {element: element}, function (event) {
                var current = event.data.element,
                    $quantity = $(current).find("." + CLASS_QUANTITY),
                    quantity = parseInt($quantity.val());
                if (!isNaN(quantity) || quantity >= 0) {
                    quantity++;
                } else {
                    quantity = 0;
                }
                that.setQuantity($(current), $quantity, quantity);
                var cache = $.data(current, CACHE_KEY);
                if (cache && cache.onChange) {
                    cache.onChange.call(this, quantity);
                }
            });
            //input改变
            $(element).on("input" + EVENT_NAMESPACE, "." + CLASS_QUANTITY, {element: element}, function (event) {
                var current = event.data.element,
                    quantity = parseInt($(this).val());
                if (isNaN(quantity) || quantity < 0) {
                    quantity = 0;
                }
                that.setQuantity($(current), $quantity, quantity);
                var cache = $.data(current, CACHE_KEY);
                if (cache && cache.onChange) {
                    cache.onChange.call(this, quantity);
                }
            });
        },
        setQuantity: function ($calculate, $quantity, quantity) {
            $calculate.attr("data-quantity", quantity);
            $quantity.val(quantity);
        }
    };

    $.fn.extend({
        calculate: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.calculate.methods[options](this, args);
            }
            return new Calculator(this, options).init();
        }
    });

    $.fn.calculate.defaults = {
        disabled: false,
        quantity: 0,
        onChange: function (quantity) {
        }
    };

    $.fn.calculate.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).calculate({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).calculate({disabled: true});
            });
        },
        getQuantity: function (elements) {
            var quantity = parseInt($(elements[0]).attr("data-quantity"));
            return isNaN(quantity) ? 0 : quantity;
        }
    };
})(jQuery, window, document);