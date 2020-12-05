Array.prototype.max = function () {
    return Math.max.apply({}, this);
};

Array.prototype.min = function () {
    return Math.min.apply({}, this);
};

Array.prototype.isExist = function (item) {
    for (var i = 0; i < this.length; i++) {
        if (item === this[i]) {
            return true;
        }
    }
    return false;
};
