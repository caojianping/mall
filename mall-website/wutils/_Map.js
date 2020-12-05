//实例方法
/*键值对转换为数组*/
Map.prototype.toArray__=function () {
    if(Array.from) return Array.from(this);
    var arr=[];
    for(var pair of this){
        arr.push(pair);
    }
    return arr;
}

/*Map 转换为对象*/
Map.prototype.toObject__=function () {
    var obj = Object.create(null);
    for (var pair of this) {
        obj[pair[0]] = pair[1];
    }
    return obj;
}



//静态方法

/*对象转换/增加到Map{key:val}*/
Map.fromObject__=function (obj,map) {
    map=map||new Map;
    for(var key of Object.keys(obj)){
        map.set(key,obj[key]);
    }
    return map;
}

Map.fromArray__=function (arr, map,key) {
    arr=Array.isArray(arr)?arr:Array.from(arr);
    map=map||new Map;
    for(var item of arr){
        var currKey=key in item?item[key]:item.toString();
        if(!map.has(currKey)) map.set(currKey,[]);
        map.get(currKey).push(item);
    }
    return map;
}