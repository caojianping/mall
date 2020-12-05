var History = {
    getHistory: function () {
        try {
            return JSON.parse(new Cookie().get("HISTORY"));
        } catch (e) {
            return null;
        }
    },
    setHistory: function (item) {
        var history = this.getHistory();
        if (!Array.isArray(history)) {
            history = [];
        }
        if (!history.isExist(item)) {
            history.push(item);
            new Cookie().set("HISTORY", JSON.stringify(history), 7 * 24);
        }
    }
};

function Search() {
    this._initHistory = function () {
        var $historyList = $(".history-list"),
            $historySpanel = $(".spanel.spanel-history"),
            $suggests = $(".suggests"),
            data = History.getHistory();
        if (!Array.isArray(data) || data.length <= 0) {
            $historyList.empty();
            $historySpanel.hide();
        } else {
            var html = "";
            data.forEach(function (item) {
                html += '<li data-value="' + item + '">' + item + '</li>';
            });
            $historyList.empty().append(html);
            $historySpanel.show();
            $suggests.hide();
        }
    };
}

Search.prototype = {
    init: function () {
        var that = this,
            $historySpanel = $(".spanel.spanel-history"),
            $hotSpanel = $(".spanel.spanel-hot"),
            $searches = $(".searches");
        if ($searches.length <= 0) {
            that._initHistory();
            $hotSpanel.show();
        } else {
            $historySpanel.hide();
            $hotSpanel.hide();
            $searches.show();
        }
    },
    bindEvents: function () {
        var that = this;
        $(document).on("input", ".search-keyword", function () {
            var keyword = $(this).val(),
                $hotSpanel = $(".spanel.spanel-hot"),
                $historySpanel = $(".spanel.spanel-history"),
                $searches = $(".searches"),
                $suggests = $(".suggests"),
                $suggestList = $(".suggest-list");
            if (!keyword || keyword.length <= 0) {
                $searches.hide();
                $suggests.hide();
                that._initHistory();
                $hotSpanel.show();
                return;
            }
            $.getJSON("/commodity/suggest", {keyword: keyword}, function (result) {
                if (result.state !== 1) return alert(JSON.stringify(result.msg, null, 2));

                $hotSpanel.hide();
                $historySpanel.hide();
                $searches.hide();
                var data = result.data,
                    html = "";
                if (Array.isArray(data)) {
                    data.forEach(function (item) {
                        html += '<li data-value="' + item.name + '">' + item.name + '</li>';
                    });
                }
                $suggestList.empty().append(html);
                $suggests.show();
            });
        });
        $(document).on("click", ".search-once", function () {
            var keyword = $(".search-keyword").val();
            if (!keyword) return;

            console.log("set111");
            History.setHistory(keyword);
            $(".search-form").submit();
        });
        $(document).on("click", "[data-value]", function () {
            var text = $(this).data("value");
            $(".search-keyword").val(text);
            History.setHistory(text);
            $(".search-form").submit();
        });
        $(document).on("click", ".spanel-clear", function () {
            new Cookie().clear("HISTORY");
            that._initHistory();
        });
        $(document).on("click", ".search-table .search-item", function () {
            window.location.href = "/commodity/detail?id=" + $(this).data("id");
        });
    }
};

$(function () {
    var $keyword = $(".search-keyword"),
        keyword = $keyword.val();
    $keyword.val("").focus().val(keyword);

    var search = new Search();
    search.init();
    search.bindEvents();
});
