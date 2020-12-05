String.prototype.PadLeft = function (len,ch) {
    var str = this.toString();
    ch = ch || '0';
    var dur = len - str.length;
    for (var i = 0; i < dur; i++) {
        str = ch + str;
    }
    return str;
}

String.prototype.Contains =String.prototype.includes|| function (str) {
        return this.indexOf(str) >= 0;
    }

String.prototype.EndsWith =String.prototype.endsWith|| function (str) {
        return this.toString().lastIndexOf(str) == this.length - str.length;
    }

String.prototype.StartsWith =String.prototype.startsWith|| function (str) {
        return this.toString().indexOf(str) == 0;
    }

