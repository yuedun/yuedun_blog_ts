'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorCode = {
    "1": "提交成功，该数字为本批次的任务ID，提交成功后请自行保存发送记录。",
    "-1": "余额不足",
    "-2": "帐号或密码错误",
    "-3": "连接服务商失败",
    "-4": "超时",
    "-5": "其他错误，一般为网络问题，IP受限等",
    "-6": "短信内容为空",
    "-7": "目标号码为空",
    "-8": "用户通道设置不对，需要设置三个通道",
    "-9": "捕获未知异常",
    "-10": "超过最大定时时间限制",
    "-11": "目标号码在黑名单里",
    "-13": "没有权限使用该网关",
    "-14": "找不到对应的Channel ID",
    "-17": "没有提交权限，客户端帐号无法使用接口提交。或非绑定IP提交",
    "-18": "提交参数名称不正确或确少参数",
    "-19": "必须为POST提交",
    "-20": "超速提交(一般为每秒一次提交)",
    "-21": "扩展参数不正确",
    "-22": "Ip 被封停"
};
exports.getErrorCode = function (code) {
    for (var i in exports.errorCode) {
        if (code == i) {
            return i + ":" + exports.errorCode[i];
        }
    }
};
//# sourceMappingURL=error-code.js.map