Set.prototype.addArrary__=function (arr) {
    for (var item of arr) {
        this.add(item);
    }
    //return this;
}

Set.prototype.toArray__=function () {
    if(Array.from) return Array.from(this);
    var arr=[];
    for(var item of this){
        arr.push(item);
    }
    return arr;
}