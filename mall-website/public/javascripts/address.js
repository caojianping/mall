function init() {
    var msg = $('[name="msg"]').val();
    if (msg) {
        alert(msg);
    }
    $(".address-default").click(function (event) {
        event.stopPropagation();
    });
}

/**
 * 面板对象
 * @constructor
 */
function Panel() {
    this.$panel = $(".panel");
    this.$close = $(".panel .panel-header .panel-close");
    this.$title = $(".panel .panel-header .panel-title");
    this.$remove = $("#remove");
    this.$form = $("#addressForm");
}

Panel.prototype = {
    init: function (type, data) {
        var that = this,
            args = "from=" + ($('[name="from"]').val() || "") + "&type=" + ($('[name="type"]').val() || "");
        that.$panel.slideDown(100);
        switch (type) {
            case 0:
                that.$title.text("添加地址");
                that.$remove.hide();
                that.$form.attr("action", "/address/add?" + args);
                break;
            case 1:
                that.$title.text("修改地址");
                that.$remove.show();
                that.$form.attr("action", "/address/update?" + args);
                break;
            default:
                that.$title.text("修改地址");
                that.$remove.hide();
                break;
        }
        if (data) {
            that.$panel.find('[name="id"]').val(data._id);
            that.$panel.find('[name="_id"]').val(data._id);
            that.$panel.find('[name="linkman"]').val(data.linkman);
            that.$panel.find('[name="contact"]').val(data.contact);
            that.$panel.find('[name="location"]').val(data.location);
            that.$panel.find('[name="mark"]').val(data.mark);
        } else {
            that.$panel.find(":text,textarea,select").val("");
        }
    },
    close: function () {
        var that = this;
        that.$close.click(function () {
            that.$panel.slideUp(100);
        });
    }
};

/**
 * 地址对象
 * @constructor
 */
function Address() {
    this.panel = new Panel();
    this.panel.close();
}

Address.prototype = {
    add: function () {
        var that = this;
        $("#add").click(function () {
            that.panel.init(0, null);
        });
    },
    remove: function () {
        $("#remove").click(function () {
            var result = confirm("确定要删除此地址信息吗？");
            if (!result) {
                return false;
            }
        });
    },
    toggle: function () {
        var that = this;
        $(".address-list .address-item").click(function () {
            var address = $(this).data("address");
            that.panel.init(1, address);
        });
    }
};

$(function () {
    init();
    var address = new Address();
    address.add();
    address.remove();
    address.toggle();
});
