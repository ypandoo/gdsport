var MathUtil = {
    getUniqNumber: function () {
        var nowTime = (new Date()).getTime();
        nowTime = String(nowTime);
        console.log(nowTime);
        random = String(mathUtil.getRandom(1000, 1));
        console.log(random);
        var finalNumber = nowTime + random;
        return parseInt(finalNumber);
    },
    getRandom: function (max, min) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};
