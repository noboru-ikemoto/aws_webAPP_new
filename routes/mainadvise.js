/**
 *================================================================
 *Project Name : nialm web application
 *File Name : mainadvise.js
 *Version : $Id: mainadvise.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

module.exports = () => {
    var route = require('express').Router();
    var dbConnector = require('./dbConnector');
    var moment = require('moment');
    var id_user;
    var currentMinuteData;
    var currentHourData;
    var currentDayData;
    var currentMonthData;
    // var m;
    // var now;

    async function getChartData(from, to, info) {
        var now = moment().utcOffset("+09:00").format('YYYY-MM-DD HH:mm');
        if (info == "w") {
            // if (!from || !to) {
            //     to = moment(now).add(-1, 'minutes').format('YYYY-MM-DD HH:mm');
            //     from = moment(now).subtract(1, 'hour').format('YYYY-MM-DD HH:mm');
            // }
            query = 'select input_date as date, ' +
                'input_power as value from tms_input ' +
                'where id_device = (select id_device_ins_pwr ' +
                'from user_cloud where id_user = "' + id_user + '") ' +
                'and input_date between "' + from + '" and "' + to + ':59" order by input_date';
        } else if (info == "wh") {
            query = 'SELECT start_time as date, power_wh as value, loss_amount as loss ' +
                'from activity_app where start_time between "' + from + '%" and "' + to +
                ':59%" and id_user = "' + id_user + '" order by start_time';
        } else if (info == "kwh") {
            to = moment(to).add(1, 'hour').format('YYYY-MM-DD HH:08');
            query = 'SELECT input_date as date, input_power as value, input_power_rev from tms_input_acc where id_user = "' +
                id_user + '" and input_date between "' + from + '%" and "' + to + '%"' +
                ' group by DATE_FORMAT(input_date, "%Y-%m-%d %H") having min(input_date) order by input_date';
        } else if (info == "kwd") {
            if (moment(now).diff(from, 'day') == 0) {
                try {
                    return getCurrentData(info);
                } catch (err) {
                    console.log(err);
                    throw err;
                }
            } else {
                query = 'select input_date as date, input_power as value, input_power_rev ' +
                    'from tms_input_acc where id_user = "' + id_user +
                    '" and input_date between "' + from + '" and  DATE_ADD("' + to + '", INTERVAL 1 DAY)' +
                    ' group by DATE_FORMAT(input_date, "%Y-%M-%D") having min(input_date) order by input_date'
            }
        } else if (info == "kwm") {
            now = moment(now).format('YYYY-MM');
            if (moment(now).diff(from, 'month') == 0) {
                try {
                    return getCurrentData(info);
                } catch (err) {
                    console.log(err);
                    throw err;
                }
            }
            query = 'select input_date as date, input_power as value, input_power_rev from tms_input_acc ' +
                'where id_user = "' + id_user + '" and (input_date between "' + from +
                '" and DATE_ADD("' + to + '", INTERVAL 1 MONTH))' +
                ' and input_date like "%01 00:00:%" order by input_date';
        }
        try {
            var rs = await dbConnector(query);
            return createDataList(from, to, now, info, rs);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async function getCurrentData(info) {
        var now = moment().utcOffset("+09:00").format('YYYY-MM-DD HH:mm');
        if (info == "w") {
            var query = 'SELECT input_power as value, DATE_FORMAT(input_date, "%Y-%m-%d %H:%i") ' +
                'as date from tms_input where id_user="' + id_user +
                '" order by input_date desc limit 1';
        } else if (info == "kwh") {
            now = moment(now).subtract(10, 'minute').format('YYYY-MM-DD HH:08');
            // query = 'SELECT input_date as date, input_power as value from tms_input_acc where id_user = "' +
            //     id_user + '" and input_date between "' + from + '%" and "' + to + '%"' +
            //     ' group by DATE_FORMAT(input_date, "%Y-%m-%d %H") order by input_date';

            query = 'SELECT input_date as date, input_power as value, input_power_rev ' +
                'from tms_input_acc where id_user = "' + id_user + '" ' +
                'and input_date between DATE_SUB("' + now + '%", INTERVAL 70 MINUTE) ' +
                'and "' + now + '" group by DATE_FORMAT(input_date, "%Y-%m-%d %H") ' +
                'order by input_date';
        } else {
            if (info == "kwd") {
                now = moment(now).format('YYYY-MM-DD');
            } else if (info == "kwm") {
                now = moment(now).format('YYYY-MM');
            }
            query = 'select input_date as date, input_power as value, ' +
                'input_power_rev from tms_input_acc where ' +
                '(input_date = (select min(input_date) from tms_input_acc ' +
                'where input_date >= "' + now + '" and id_user = "' + id_user +
                '") or input_date = (select max(input_date) from tms_input_acc where id_user = "' + id_user +
                '")) and id_user = "' + id_user + '"'
        }
        try {
            var rs = await dbConnector(query);
            return createCurrentList(rs, info);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    function getUniqueObjectArray(rs) {
        var tempArray = [];
        var resultArray = [];
        for (var i = 0; i < rs.length; i++) {
            var item = rs[i];
            if (tempArray.indexOf(String(item.date)) > -1) {
                continue;
            } else {
                resultArray.push(item);
                tempArray.push(String(item.date));
            }
        }
        return resultArray;
    }

    async function createDataList(from, to, now, info, rs) {
        var dataList = [];
        var count = 0;
        rs = getUniqueObjectArray(rs);
        if (info == "w") {
            var diff = moment(to).diff(from, 'minute');
            for (let i = 0; i <= diff; i++) {
                dataList.push({ date: moment(from).add(i, 'minute').format('YYYY-MM-DD HH:mm'), value: 0 });
                if (rs.length <= count) {
                    continue;
                }
                var date = moment(rs[count].date).utcOffset("+00:00").format('YYYY-MM-DD HH:mm');
                if (dataList[i].date == date) {
                    dataList[i].value = rs[count++].value;
                }
            }
        } else if (info == "wh") {
            diff = moment(to).diff(from, 'hour');
            for (let i = 0; i <= diff; i++) {
                dataList.push({ date: moment(from).add(i, 'hour').format('YYYY-MM-DD HH:00'), value: 0, loss: 0 });
                if (rs.length <= count) {
                    continue;
                }
                var date = moment(rs[count].date).utcOffset("+00:00").format('YYYY-MM-DD HH:00');
                if (dataList[i].date == date) {
                    dataList[i].value = rs[count].value;
                    dataList[i].loss = rs[count++].loss;
                }
            }
        } else if (info == "kwh") {
            var tempList = [];
            diff = moment(to).diff(from, 'hour');
            for (let i = 0; i <= diff; i++) {
                tempList.push({ date: moment(from).add(i, 'hour').format('YYYY-MM-DD HH:00'), value: 0 });
                if (rs.length <= count) {
                    continue;
                }
                var date = moment(rs[count].date).utcOffset("+00:00").format('YYYY-MM-DD HH:00');
                if (tempList[i].date == date) {
                    tempList[i].value = rs[count].value;
                    tempList[i].rev = rs[count++].input_power_rev;
                }
            }
            for (let i = 0; i < tempList.length - 1; i++) {
                var value = 0;
                var rev = 0;
                if (tempList[i + 1].value != 0 && tempList[i].value != 0) {
                    value = (tempList[i + 1].value - tempList[i].value).toFixed(1);
                    rev = (tempList[i + 1].rev - tempList[i].rev).toFixed(1);
                }
                dataList.push({
                    date: tempList[i].date,
                    value: value,
                    rev: rev
                });
            }
        } else if (info == "kwd") {
            var tempList = [];
            diff = moment(to).diff(from, 'day');
            for (let i = 0; i <= diff; i++) {
                tempList.push({ date: moment(from).add(i, 'day').format('YYYY-MM-DD'), value: 0 });
                if (rs.length <= count) {
                    continue;
                }
                var date = moment(rs[count].date).utcOffset("+00:00").format('YYYY-MM-DD');
                if (tempList[i].date == date) {
                    tempList[i].value = rs[count].value;
                    tempList[i].rev = rs[count++].input_power_rev;
                }
            }
            for (let i = 0; i < tempList.length - 1; i++) {
                var value = 0;
                var rev = 0;
                if (tempList[i + 1].value != 0 && tempList[i].value != 0) {
                    value = (tempList[i + 1].value - tempList[i].value).toFixed(1);
                    rev = (tempList[i + 1].rev - tempList[i].rev).toFixed(1);
                }
                dataList.push({
                    date: tempList[i].date,
                    value: value,
                    rev: rev
                });
            }
            if (moment(to).diff(now, 'day') == 0) {
                if (currentDayData) {
                    dataList.push(currentDayData[0]);
                } else {
                    dataList.push({
                        date: to,
                        value: 0,
                        rev: 0
                    })
                }
            }
        } else if (info == "kwm") {
            var tempList = [];
            diff = moment(to).diff(from, 'month');
            for (let i = 0; i <= diff; i++) {
                tempList.push({ date: moment(from).add(i, 'month').format('YYYY-MM'), value: 0 });
                if (rs.length <= count) {
                    continue;
                }
                var date = moment(rs[count].date).utcOffset("+00:00").format('YYYY-MM');
                if (tempList[i].date == date) {
                    tempList[i].value = rs[count].value;
                    tempList[i].rev = rs[count++].input_power_rev;
                }
            }
            for (let i = 0; i < tempList.length - 1; i++) {
                var value = 0;
                var rev = 0;
                if (tempList[i + 1].value != 0 && tempList[i].value != 0) {
                    value = (tempList[i + 1].value - tempList[i].value).toFixed(1);
                    rev = (tempList[i + 1].rev - tempList[i].rev).toFixed(1);
                }
                dataList.push({
                    date: tempList[i].date,
                    value: value,
                    rev: rev
                });
            }
            if (moment(to).diff(now, 'month') == 0) {
                if (currentMonthData) {
                    dataList.push(currentMonthData[0]);
                } else {
                    dataList.push({
                        date: to,
                        value: 0,
                        rev: rev
                    })
                }
            }
        }
        // console.log("datalist : ", dataList)
        return dataList;
    }

    function createCurrentList(rs, info) {
        var list;
        if (info == "w") {
            if (rs.length == 0) {
                list = [{ date: "", value: 0 }];
            } else {
                list = [{
                    date: rs[0].date,
                    value: rs[0].value
                }];
            }
        } else if (info == "kwh") {
            if (rs.length < 2) {
                list = [{ date: "", value: 0, rev: 0 }, { date: "", value: 0, rev: 0 }];
            } else {
                list = [{
                    date: moment(rs[0].date).utcOffset("+00:00").format("YYYY-MM-DD HH:00"),
                    value: (rs[1].value - rs[0].value).toFixed(1),
                    rev: (rs[1].input_power_rev - rs[0].input_power_rev).toFixed(1),
                }];
            }
        } else if (info == "kwd") {
            if (rs.length < 2) {
                list = [{ date: "", value: 0, rev: 0 }, { date: "", value: 0, rev: 0 }];
            } else {
                list = [{
                    date: moment(rs[0].date).format("YYYY-MM-DD"),
                    value: (rs[1].value - rs[0].value).toFixed(1),
                    rev: (rs[1].input_power_rev - rs[0].input_power_rev).toFixed(1),
                }];
            }
        } else if (info == "kwm") {
            if (rs.length < 2) {
                list = [{ date: "", value: 0, rev: 0 }, { date: "", value: 0, rev: 0 }];
            } else {
                list = [{
                    date: moment(rs[0].date).format("YYYY-MM"),
                    value: (rs[1].value - rs[0].value).toFixed(1),
                    rev: (rs[1].input_power_rev - rs[0].input_power_rev).toFixed(1),
                }];
            }
        }
        return list;
    }

    async function getSigLevel(id_user, from, to) {
        var query = "select date_format(input_date,'%H:%i') date, sig_level from tms_input_acc where id_user = ?";
        if (!from || !to) {
            // cardData.jsからのrequest
            query += " order by input_date desc limit 1";
        } else {
            // showPowerData.jsからのrequest
            // 10分前のデータから取得
            from = moment(from).format("YYYY-MM-DD HH:mm").substr(0, 15) + 0;
            // from = moment(from).subtract(10, 'minute').format('YYYY-MM-DD HH:mm');
            query += "and input_date between '" + from + "' and '" + to + "'";
        }
        try {
            var rs = await dbConnector(query, id_user);
        } catch (err) {
            console.log(err);
            throw err;
        }
        if (rs.length > 0) {
            if (from && to) {
                // showPowerData.jsからのrequest結果データチェック
                // fromは元の時刻に戻す
                return sigDateCorrection(rs, from, to);
            }
            return rs;
        } else {
            return null;
        }
    }

    function sigDateCorrection(sigData, from, to) {
        // fromからtoまで10分づつ増加しながらsigデータが存在するかチェック
        // データが無い場合はかわりに-999を補充する
        var start = moment(from).format("YYYY-MM-DD HH:mm").substr(0, 15) + 0;
        var end = moment(to).format("YYYY-MM-DD HH:mm").substr(0, 15) + 0;
        var idx = 0;
        for (let i = moment(start); i <= moment(end); i.add(10, 'minute')) {
            let date = i.format("HH:mm");
            if (sigData[idx] && date != sigData[idx].date) {
                sigData.splice(idx, 0, { date: date, sig_level: -999 });
            }
            idx++;
        }
        // console.log(sigData)
        return sigData;
    }

    async function getForecast(id_user) {
        var query = "SELECT DATE_FORMAT(action_time, '%Y-%m-%d %H:%i') as action_time, " +
            "ROUND(estimated_power_at_end,1) as power, prediction_cycle, max_multiplier " +
            "from forecast_disa where id_user ='" +
            id_user + "' order by action_time desc limit 1";
        try {
            return await dbConnector(query);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async function getUserDisaData(id_user) {
        var query = "SELECT act_decision_power1 as adp1,power_max_ever, " +
            "DATE_FORMAT(max_ever_date, '%Y-%m-%d %H') as max_ever_date " +
            "from user_disa where id_user = '" + id_user + "'";
        try {
            return await dbConnector(query);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async function checkSolarPanelUser(id_user) {
        var query = "SELECT solar_panel " +
            "from user_disa where id_user = '" + id_user + "'";
        try {
            return await dbConnector(query);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    route.get('/chart', async (req, res) => {
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            console.log("req : ", req.query);
            var from = req.query.from;
            var to = req.query.to;
            var info = req.query.info;
            id_user = req.query.id_user;
            if (!from || !to) {
                var now = moment().utcOffset("+09:00").format('YYYY-MM-DD HH:mm');
                to = moment(now).add(-1, 'minutes').format('YYYY-MM-DD HH:mm');
                from = moment(now).subtract(1, 'hour').format('YYYY-MM-DD HH:mm');
            }
            try {
                var rs = await getChartData(from, to, info);
                if (rs.length == 0) {
                    res.send({ data: null });
                } else {
                    if (info == "w") {
                        var sigLevel = await getSigLevel(id_user, from, to);
                        res.send({ data: rs, label: "w", sigLevel: sigLevel });
                    } else if (info == "wh") {
                        res.send({ data: rs, label: "wh" });
                    } else if (info == "kwh") {
                        res.send({ data: rs, label: "kwh" });
                    } else if (info == "kwd") {
                        res.send({ data: rs, label: "kwd" });
                    } else if (info == "kwm") {
                        res.send({ data: rs, label: "kwm" });
                    }
                }
            } catch (err) {
                // db error
                console.log(err);
                res.send({ data: null });
            }
        }
    });

    route.get('/card', async (req, res) => {
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            id_user = req.query.id_user;
            var solar_panel_user = req.query.solar_panel_user;
            try {
                currentMinuteData = await getCurrentData("w", id_user);
                currentHourData = await getCurrentData("kwh", id_user);
                currentDayData = await getCurrentData("kwd", id_user);
                currentMonthData = await getCurrentData("kwm", id_user);
                var sigLevel = await getSigLevel(id_user);
                if (solar_panel_user == 0) {
                    var userDisaData = await getUserDisaData(id_user);
                    var foreRs = await getForecast(id_user);
                    var forecastData = null;
                    if (foreRs.length > 0) {
                        forecastData = {
                            action_time: foreRs[0].action_time,
                            power: foreRs[0].power,
                            time: foreRs[0].prediction_cycle * foreRs[0].max_multiplier
                        };
                    } else {
                        forecastData = { action_time: null, power: 0 };
                    }
                    res.send({
                        w: currentMinuteData[0],
                        kwh: currentHourData[0],
                        kwd: currentDayData[0],
                        kwm: currentMonthData[0],
                        sigLevel: sigLevel[0].sig_level,
                        forecastData: forecastData,
                        adp1: userDisaData[0].adp1,
                        powerMax: userDisaData[0].power_max_ever,
                        maxDate: userDisaData[0].max_ever_date
                    });
                } else {
                    res.send({
                        w: currentMinuteData[0],
                        kwh: currentHourData[0],
                        kwd: currentDayData[0],
                        kwm: currentMonthData[0],
                        sigLevel: sigLevel,
                    });
                }

            } catch (err) {
                // db error
                console.log(err);
                res.send({ data: null });
            }
        }
    });

    route.get('/', async (req, res) => { // url : /mainadvise/
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            // console.log("#############login mode", req.user);
            var id_user = req.user.id_user;
            if (req.user.loginmode == "dashboard" && req.query.id_user != undefined) {
                id_user = req.query.id_user;
            }
            var rs = await checkSolarPanelUser(id_user);
            res.render('mainadvise', {
                data: null,
                label: null,
                user: id_user,
                solar_panel: rs[0].solar_panel
            });
        }
    });

    // function sortList(list) {
    //     list.sort(function(a, b) {
    //         return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    //     });
    //     console.log("sort : ", list);
    // }
    return route;
};