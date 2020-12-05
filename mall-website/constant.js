"use strict";

global.TWO_HOURS = 3600 * 1000 * 2;
global.TWO_DAYS = 3600 * 1000 * 24 * 2;
global.ONE_WEEK = 3600 * 1000 * 24 * 7;

global.FILE_MAX_SIZE = 500 * 1024;

global.DEFAULT_PAGE_SIZE = 10;

global.GrouponStateEnum = {//团购状态枚举
    Expired: -10,//已过期
    Initial: 0,//初始化
    Started: 10//已开始
};

global.OpenGrouponStateEnum = {//开团状态枚举
    Failed: -10,//开团失败
    Initial: 0,//初始化
    Processing: 1,//处理中
    Successed: 10,//开团成功
};

global.OrderStateEnum = {
    Cancelled: -10,//已取消
    NonPay: 0,//待付款
    NonSend: 2,//待发货
    NonReceive: 3,//待收货
    Completed: 10//已完成
};

global.GrouponOrderStateEnum = {
    Cancelled: -10,//已取消
    Failed: -1,//拼团失败
    NonPay: 0,//待付款
    NonGroupon: 1,//待拼团（拼团中）
    NonSend: 2,//待发货（拼团成功）
    NonReceive: 3,//待收货
    Completed: 10//已完成
};

global.RefundStateEnum = {
    Failed: -10,//退款失败
    Accepted: 0,//已受理
    Successed: 10//退款成功
};

global.RefundReasonTypeEnum = {
    System: 1,//系统退款受理
    Customer: 2//消费者退款受理
};