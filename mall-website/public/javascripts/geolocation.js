function getLocation() {
    if (window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
    else {
        alert("该浏览器不支持获取地理位置。");
    }
}

function onSuccess(position) {
    var longitude = position.coords.longitude,
        latitude = position.coords.latitude,
        url = "http://api.map.baidu.com/geocoder/v2/?ak=71709218d45a706b9c7e3abc2f037b23&callback=?&location=" +
            latitude + "," + longitude + "$output=json$pois=1";
    $.getJSON(url, function (data) {
        alert("data:" + JSON.stringify(data, null, 2));
        var address = data.result.addressComponent;
        alert(JSON.stringify(address, null, 2));
    });
}

function onError(error) {
    var result = '';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            result = "用户拒绝对获取地理位置的请求。";
            break;
        case error.POSITION_UNAVAILABLE:
            result = "位置信息是不可用的。";
            break;
        case error.TIMEOUT:
            result = "请求用户地理位置超时。";
            break;
        case error.UNKNOWN_ERROR:
            result = "未知错误。";
            break;
    }
    alert(result);
}