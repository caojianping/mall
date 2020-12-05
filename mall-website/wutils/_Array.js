Array.prototype.FirstOrDefault=function (qryItem) {
    return this.find(function (item) {
        Object.keys().reduce(function (key) {
            return (key in item)&&item[key]===qryItem[key];
        })
    })
}

Array.prototype.removeItem__=function (item) {
    var index=this.indexOf(item);
    if(index!==-1){
        this.splice(index,1);
    }
}

Array.prototype.removeItems__=function (items) {
    items.forEach(item=>this.removeItem__(item));
}