;(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".jcarousel_event",
        CACHE_KEY = "jcarousel_cache";

    var Carousel = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };

    Carousel.prototype.constructor = Carousel;

    Carousel.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.setStyle(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.jcarousel.defaults, that.options || {});
            } else {
                if (cache.timer) {
                    //作用：停止原来的定时器timer(缓存数据中存储的定时器timer)
                    //问题：调用方法时会创建新的轮播对象，同时会导致无法获取并停止原来的定时器timer
                    //方案：采用定时器timer存入缓存数据中的策略
                    clearInterval(cache.timer);
                }
                if (cache.mobile && touch) {
                    //看完touch源码，调试发现off功能是木有效果滴，源码中没有扩展或者封装removeEventListener
                    try {
                        touch.off(element, "touchstart touchend swipeleft swiperight");
                    } catch (e) {
                        console.log(e);
                    }
                }
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        setStyle: function (element) {
            var cache = $.data(element, CACHE_KEY),
                $jcarousel = $(element),
                $jcarouselList = $jcarousel.find(".jcarousel-list"),
                $jcarouselItems = $jcarousel.find(".jcarousel-list .jcarousel-item"),
                $jcarouselControl = $jcarousel.find(".jcarousel-control");
            if (cache.width) {
                $jcarousel.width(cache.width);
            }
            var count = $jcarouselItems.length,
                width = ($jcarousel.width() - cache.offset) / cache.showCount,
                height,
                imageScale = cache.imageScale;
            if (imageScale && imageScale > 0) {
                height = width / imageScale;
            } else {
                height = cache.height;
            }
            $jcarouselItems.width(width).height(height);
            $jcarouselList.width(width * count).height(height);
            $jcarousel.height(height);
            $jcarouselControl.css("top", (height - $jcarouselControl.height()) / 2);
            if (cache.indicator && count > 1) {
                var html = "";
                for (var i = 0; i < count; i++) {
                    html += "<li" + (i === 0 ? ' class="active" ' : "") + ' data-target="' + i + '"></li>';
                }
                $jcarousel.find(".jcarousel-indicator").append(html);
            }
            if (!$jcarousel.hasClass("jcarousel")) {
                $jcarousel.addClass("jcarousel");
            }
        },
        bindEvents: function (element) {
            var that = this,
                count = $(element).find(".jcarousel-list .jcarousel-item").length;
            if (count <= 1) {
                return;
            }
            var cache = $.data(element, CACHE_KEY);
            //自动轮播
            if (cache.autoplay) {
                cache.timer = setInterval(function () {
                    that.move(element, "next");
                }, cache.speed);
            }
            if (cache.mobile) {
                //绑定移动设备事件
                $(element).find(".jcarousel-control").hide();
                if (touch) {
                    touch.on(element, "touchstart touchend swipeleft swiperight", {element: element}, function (event) {
                        var current = event.data.element;
                        switch (event.type) {
                            case "touchstart":
                                if (cache.autoplay) {
                                    clearInterval(cache.timer);
                                }
                                break;
                            case "touchend":
                                if (cache.autoplay) {
                                    cache.timer = setInterval(function () {
                                        that.move(current, "next");
                                    }, cache.speed);
                                }
                                break;
                            case "swipeleft":
                                that.move(current, "next", true);
                                break;
                            case "swiperight":
                                that.move(current, "prev", true);
                                break;
                        }
                    });
                }
            } else {
                //绑定非移动设备事件
                var events = ["mouseover" + EVENT_NAMESPACE, "mouseout" + EVENT_NAMESPACE].join(" ");
                $(element).on(events, {element: element}, function (event) {
                    var current = event.data.element;
                    switch (event.type) {
                        case "mouseover":
                            if (cache.autoplay) {
                                clearInterval(cache.timer);
                            }
                            break;
                        case "mouseout":
                            if (cache.autoplay) {
                                cache.timer = setInterval(function () {
                                    that.move(current, "next");
                                }, cache.speed);
                            }
                            break;
                    }
                });

                $(element).on("click" + EVENT_NAMESPACE, ".jcarousel-control", {element: element}, function (event) {
                    var current = event.data.element;
                    if ($(this).hasClass("next")) {
                        that.move(current, "next", true);
                    } else if ($(this).hasClass("prev")) {
                        that.move(current, "prev", true);
                    }
                });
            }
        },
        move: function (element, direct, manul) {
            var that = this,
                data = $.data(element, CACHE_KEY),
                $jcarousel = $(element),
                $jcarouselList = $jcarousel.find(".jcarousel-list"),
                $jcarouselItem = $jcarousel.find(".jcarousel-item"),
                $jcarouselIndecator = $jcarousel.find(".jcarousel-indicator"),
                width = ($jcarousel.width() - data.offset) / data.showCount;

            if (direct === "next") {
                $jcarouselList.animate({left: "-" + width + "px"}, manul === true ? "fast" : "slow", function () {
                    $jcarouselItem.first().appendTo($jcarouselList);
                    $jcarouselList.css("left", 0);
                    that.indicator($jcarouselIndecator, $jcarousel.find(".jcarousel-item").first().data("index"));
                });
            } else if (direct === "prev") {
                $jcarouselItem.last().prependTo($jcarouselList);
                $jcarouselList.css("left", "-" + width + "px");
                $jcarouselList.animate({"left": 0}, manul === true ? "fast" : "slow", function () {
                    that.indicator($jcarouselIndecator, $jcarousel.find(".jcarousel-item").first().data("index"));
                });
            }
        },
        indicator: function ($indicator, index) {
            $indicator.find("li.active").removeClass("active");
            $indicator.find("li[data-target=" + index + "]").addClass("active");
        }
    };

    $.fn.extend({
        jcarousel: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.jcarousel.methods[options](this, args);
            }
            return new Carousel(this, options).init();
        }
    });

    $.fn.jcarousel.defaults = {
        disabled: false,//是否禁用
        width: "100%",//轮播插件宽度
        height: 100,//轮播插件高度
        offset: 0,//图片偏移量
        imageScale: 0,//图片比例
        showCount: 1,//图片显示个数
        autoplay: false,//是否自动播放
        speed: 2000,//自动播放速度
        mobile: false,//是否支持移动设备
        timer: null,
        onStart: function () {
        },
        onStop: function () {
        },
    };

    $.fn.jcarousel.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).jcarousel({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).jcarousel({disabled: true});
            });
        },
        auto: function (elements, args) {
            return elements.each(function () {
                $(this).jcarousel({autoplay: Array.prototype.shift.call(args)});
            });
        }
    };
})(jQuery, window, document);