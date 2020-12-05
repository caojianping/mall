RegExp.prototype.matchs__=function (text) {
    if(this.matchs) return this.matchs(text);
    var r = this.exec(text);
    if (r === null) return null;
    var results = [r];
    if (this.global) {
        while ((r = this.exec(text)) !== null) {
            results.push(r);
        }
    }
    return results;
}