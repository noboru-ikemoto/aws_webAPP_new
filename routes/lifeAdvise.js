/**
 *================================================================
 *Project Name : nialm web application
 *File Name : lifeAdvise.js
 *Version : $Id: lifeAdvise.js 322 2020-04-14 01:40:07Z tms002 $
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

    // 生活反応データ取得
    async function getLifeData(from, id_user) {
        if (!from) {
            var from = moment().utcOffset("+09:00").format("YYYY-MM-DD");
            // var query = 'SELECT start_time as date, active_flag, ' +
            //     'off_count, on_count, power_wh FROM activity_app where id_user = "' +
            //     id_user + '"and start_time >= DATE(CONVERT_TZ(NOW(),"+00:00","+09:00")) order by date';
        }
        query = 'SELECT start_time as date, active_flag, ' +
            'off_count, on_count, power_wh FROM activity_app where id_user = "' +
            id_user + '" and start_time like "' + from + '%" order by date';
        try {
            var rs = await dbConnector(query);
        } catch (err) {
            console.log(err);
            return err;
        }
        var dataList = [];
        var count = 0;
        for (let i = 0; i < 24; i++) {
            dataList.push({
                date: moment(from).add(i, 'hour').format('YYYY-MM-DD HH:00'),
                active_flag: -1,
                off_count: 0,
                on_count: 0,
                power_wh: 0
            });
            if (rs.length <= count) {
                continue;
            }
            var date = moment(rs[count].date).utcOffset("+00:00").format('YYYY-MM-DD HH:00');
            if (dataList[i].date == date) {
                dataList[i].active_flag = rs[count].active_flag;
                dataList[i].off_count = rs[count].off_count;
                dataList[i].on_count = rs[count].on_count;
                dataList[i].power_wh = rs[count].power_wh;
                count++;
            }
        }
        // console.log("datalist : ", dataList)
        return dataList;
    }

    async function getAbsence(id_user) {
        var query = "SELECT odekake_flag from user_disa where id_user = ?";
        try {
            var rs = await dbConnector(query, id_user);
        } catch (err) {
            console.log(err);
            return err;
        }
        return rs;
    }

    async function setAbsence(id_user) {
        var query = "UPDATE user_disa set odekake_flag=1, " +
            "odekake_date=DATE_SUB(NOW(), INTERVAL TIMESTAMPDIFF(HOUR, UTC_TIMESTAMP(), NOW())-9 HOUR) " +
            "where id_user = ?";
        try {
            var rs = await dbConnector(query, id_user);
        } catch (err) {
            console.log(err);
            return err;
        }
        // event_appに登録
        var event_message =
            'CONCAT("odekake_flag set to 1 for ' + id_user + ' on ", ' +
            'DATE_SUB(NOW(), INTERVAL TIMESTAMPDIFF(HOUR, UTC_TIMESTAMP(), NOW())-9 HOUR))';
        query = 'INSERT INTO event_app' +
            ' (id_user,event_type,event_message,updated_time,id_service)' +
            ' VALUES ("' + id_user + '","odekake_set",' + event_message + ',now(),"act")';
        try {
            await dbConnector(query, id_user);
        } catch (err) {
            console.log(err);
            return err;
        }
        return rs;
    }

    // thresholdデータ取得
    async function getThreshold(id_user) {
        var query = 'SELECT act_threshold_count, act_threshold_result, off_threshold_result ' +
            'from user_disa where id_user = "' + id_user + '"';
        try {
            return await dbConnector(query);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    // thresholdデータ変更
    async function updateThreshold(id_user, num) {
        var query = 'UPDATE user_disa set act_threshold_count = "' + num + '" where id_user = "' + id_user + '"'
        try {
            await dbConnector(query);
            return insertEventApp(id_user);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async function insertEventApp(id_user) {
        var query = 'INSERT INTO event_app' +
            ' (id_user,event_type,event_message,updated_time)' +
            ' VALUES ("' + id_user + '","actcalc001","activity recalculation starts",now())';
        try {
            var rs = await dbConnector(query);
            return getLastestActivityDate(id_user);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async function getLastestActivityDate(id_user, id_internal) {
        if (id_internal) {
            var query = 'SELECT updated_time from ' +
                'activity_app where id_internal = "' + id_internal + '"';
        } else {
            query = 'SELECT id_internal, updated_time from ' +
                'activity_app where id_user = "' + id_user +
                '" and start_time >= DATE_FORMAT(date_add(now(), interval 9 hour),"%Y%m%d") ' +
                'order by start_time desc limit 1';
        }
        try {
            return await dbConnector(query);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    // tag icon取得
    async function getTagIcon(id_user, start_time) {

        var query = 'select id_internal, device_type, device_type_name, cluster_power,' +
            ' cluster_wh_app, date_format(start_time,"%Y-%m-%d %H:%i") start_time' +
            ' from tag_app where id_user = "' + id_user + '" and device_type <> 0 and ' +
            'start_time = "' + start_time + '" order by device_type';
        try {
            var rs = await dbConnector(query);
        } catch (err) {
            console.log(err);
            return err;
        }
        if (rs.length == 0) {
            rs.push({ "start_time": start_time });
            return rs;
        }
        query = 'SELECT id_table from user_disa where id_user = "' + id_user + '";'
        try {
            var rs2 = await dbConnector(query);
            if (rs2.length > 0) {
                var id_table = rs2[0].id_table;
            }
        } catch (err) {
            console.log(err);
            return err;
        }
        for (let i = 0; i < rs.length; i++) {
            var season = moment(new Date(start_time)).month() + 1;
            var time_band = moment(new Date(start_time)).hour();
            switch (season) {
                case 3:
                case 4:
                case 5:
                    season = 1;
                    break;
                case 6:
                case 7:
                case 8:
                    season = 2;
                    break;
                case 9:
                case 10:
                case 11:
                    season = 3;
                    break;
                case 12:
                case 1:
                case 2:
                    season = 4;
                    break;
            }
            switch (time_band) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    time_band = 1;
                    break;
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                    time_band = 2;
                    break;
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 21:
                    time_band = 3;
                    break;
                case 22:
                case 23:
                case 0:
                case 1:
                case 2:
                case 3:
                    time_band = 4;
                    break;
            } // switch end
            var device_type = rs[i].device_type;
            query = 'select icon_user from device_type_table where id_table like "' + id_table + '"' +
                'and season = ' + season + ' and time_band = ' + time_band +
                ' and device_type = ' + device_type;
            try {
                rs2 = await dbConnector(query);
                if (rs2.length > 0) {
                    rs[i].icon_user = rs2[0].icon_user;
                } else {
                    return 0;
                }
            } catch (err) {
                console.log(err);
                return err;
            }
        } // for end

        return rs;
    }

    async function getPowerWhData(id_user, start_time) {
        query = 'select distinct total_wh_app, power_wh ' +
            'from tag_app where id_user = "' + id_user + '" and ' +
            'start_time = "' + start_time + '"';
        try {
            return await dbConnector(query);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async function getAdp1(id_user) {
        // act_decision_power1取得
        query = 'SELECT act_decision_power1 as adp1 from user_disa where id_user = "' + id_user + '"';
        try {
            return await dbConnector(query);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async function getTagChartData(id_user, input_date) {
        var query = "SELECT date_format(input_date, '%H:%i') as input_date, " +
            "input_power from tms_input where id_user = '" + id_user + "' " +
            "and input_date between '" + input_date + "'and date_add('" + input_date + "', interval 1 hour)";
        try {
            return await dbConnector(query);
        } catch (error) {
            console.log(err);
            throw err;
        }
    }


    route.get('/data', async (req, res) => { // url : /lifeAdvise/data
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            var from = req.query.from;
            var id_user = req.query.id_user;
            try {
                var dataList = await getLifeData(from, id_user);
                res.send({ data: dataList });
            } catch (err) {
                console.log(err);
                res.send({ data: null });
            }
        }
    });
    route.get('/threshold', async (req, res) => { // url : /lifeAdvise/threshold
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            var id_user = req.query.id_user;
            try {
                var rs = await getThreshold(id_user);
                var compareDate = false;
                if (req.cookies.thresholdData) {
                    // クッキーが存在することはthreshold値を変更されたとのことで
                    // DBのデータをクッキーのデータを比較し、変更値が反映されたかどうかをチェック
                    var act_date = await getLastestActivityDate(id_user, req.cookies.thresholdData.id_internal);
                    var date1 = moment(new Date(act_date[0].updated_time)).toISOString();
                    var date2 = moment(new Date(req.cookies.thresholdData.updated_time)).toISOString();
                    compareDate = date1 == date2;
                }
                res.send({ data: rs, compareDate: compareDate });
            } catch (err) {
                console.log(err);
                res.send({ data: null });
            }
        }
    });
    route.post('/threshold', async (req, res) => { // url : /lifeAdvise/threshold
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            var id_user = req.body.id_user;
            try {
                var rs = await updateThreshold(id_user, req.body.count);
                // getThreshold(req.query.id_user);
                if (rs.length > 0) {
                    res.cookie("thresholdData", {
                        id_internal: rs[0].id_internal,
                        updated_time: rs[0].updated_time
                    }, {
                            maxAge: 600000
                        });
                }
                res.send({ data: rs });
            } catch (err) {
                console.log(err);
                res.send({ data: null });
            }
        }
    });
    route.get('/lifetagplus', async (req, res) => { // url : /lifeAdvise/tagplus
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            var id_user = req.query.id_user;
            var start_time = req.query.start_time;
            res.render('lifeTagplus', { user: id_user, start_time: start_time });
        }
    });
    route.get('/lifetagplus/tagicons', async (req, res) => { // url : /lifeAdvise/lifetagplus/tagicons
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            var id_user = req.query.id_user;
            var start_time = req.query.start_time;
            try {
                var rs = await getTagIcon(id_user, start_time);
                console.log("$$$$$$$$$$$$$", rs)
                var rs2 = await getPowerWhData(id_user, start_time);
                if (rs2.length > 0) {
                    rs[0].power_wh = rs2[0].power_wh;
                    rs[0].total_wh_app = rs2[0].total_wh_app;
                }
                var rsadp1 = await getAdp1(id_user);
                if (rsadp1.length > 0) {
                    rs[0].adp1 = rsadp1[0].adp1;
                }
                var chartData = await getTagChartData(id_user, start_time);

                res.send({ data: rs, chartData: chartData });
            } catch (err) {
                console.log(err);
                res.send({ data: null });
            }
        }
    });

    route.get('/absence', async (req, res) => { // url : /lifeAdvise/absence get
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            var id_user = req.query.id_user;
            try {
                var rs = await getAbsence(id_user);
                res.send({ data: rs });
            } catch (err) {
                console.log(err);
                res.send({ data: null });
            }
        }
    });

    route.post('/absence', async (req, res) => { // url : /lifeAdvise/absence post
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            var id_user = req.body.id_user;
            try {
                var rs = await setAbsence(id_user);
                res.send({ data: rs });
            } catch (err) {
                console.log(err);
                res.send({ data: null });
            }
        }
    });
    route.get('/', async (req, res) => { // url : /lifeAdvise/
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            // solar_panelユーザはredirectさせる
            if (req.query.solar_panel == 1 || !req.query.solar_panel) {
                res.redirect('/main');
            }
            res.render('lifeAdvise', {
                user: req.query.id_user,
                solar_panel: req.query.solar_panel
            });
        }
    });

    return route;
};