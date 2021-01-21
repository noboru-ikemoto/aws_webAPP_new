/**
 *================================================================
 *Project Name : nialm web application
 *File Name : tagplus.js
 *Version : $Id: tagplus.js 322 2020-04-14 01:40:07Z tms002 $
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

    async function getTagplusData(id_user, offset) {
        var query = 'select id_internal, start_time, device_type, ' +
            'device_type_name, cluster_power, cluster_wh_app ' +
            'from tag_app where id_user = "' + id_user + '" and device_type <> 0 and start_time = ' +
            '(select distinct start_time from tag_app where id_user = "' + id_user + '" ' +
            'order by start_time desc limit 1 offset ' + offset + ') ' +
            'order by device_type';
        try {
            var rs = await dbConnector(query);
            if (rs.length > 0) {
                rs = await getIconNumber(rs, id_user);
            } else {
                // データがない場合は最新データの時間だけ取得
                query = 'select distinct start_time from tag_app where id_user = "' + id_user + '" ' +
                    'order by start_time desc limit 1 offset ' + offset;
                rs = await dbConnector(query);
            }
            if (rs.length == 0) {
                return null;
            }
            // 最後にtotal_wh_app, power_whを取得
            query = 'select distinct total_wh_app, power_wh ' +
                'from tag_app where id_user = "' + id_user + '" and start_time = ' +
                '(select distinct start_time from tag_app where id_user = "' + id_user + '" ' +
                'order by start_time desc limit 1 offset ' + offset + ')';
            var rs2 = await dbConnector(query);
            if (rs2.length > 0) {
                rs[0].total_wh_app = rs2[0].total_wh_app;
                rs[0].power_wh = rs2[0].power_wh;
            }

            // act_decision_power1取得
            query = 'SELECT act_decision_power1 as adp1 from user_disa where id_user = "' + id_user + '"';
            let rsadp1 = await dbConnector(query);
            if (rsadp1.length > 0) {
                rs[0].adp1 = rsadp1[0].adp1;
            }
            return rs;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async function getIconNumber(rs, id_user) {
        var query = 'SELECT id_table from user_disa where id_user = "' + id_user + '";'
        try {
            var rs2 = await dbConnector(query);
            if (rs2.length > 0) {
                var id_table = rs2[0].id_table;
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
        for (let i = 0; i < rs.length; i++) {
            var season = moment.utc(rs[i].start_time).month() + 1;
            var time_band = moment.utc(rs[i].start_time).hour();
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
            }
            var device_type = rs[i].device_type;
            query = 'select id_internal, icon_default, icon_user from device_type_table where id_table like "' + id_table + '"' +
                'and season = ' + season + ' and time_band = ' + time_band +
                ' and device_type = ' + device_type;
            try {
                rs2 = await dbConnector(query);
                if (rs2.length > 0) {
                    rs[i].device_table_id_internal = rs2[0].id_internal;
                    rs[i].icon_user = rs2[0].icon_user;
                    rs[i].icon_default = rs2[0].icon_default;
                } else {
                    return 0;
                }
            } catch (err) {
                console.log(err);
                throw err;
            }
        }
        return rs;
    }

    async function getTagChartData(id_user, input_date) {
        input_date = moment(new Date(input_date)).toISOString();
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

    async function changeIconNum(tagImgId, iconNum) {
        var query = "update device_type_table set icon_user = '" + iconNum + "' where id_internal in (" + tagImgId + ")";
        try {
            return await dbConnector(query);
        } catch (error) {
            console.log(err);
            throw err;
        }
    }

    // tag data取得
    route.get('/tagplusData', async (req, res) => { // url : /tagplus/tagplusData get
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            try {
                var offset = req.query.offset;
                var rs = await getTagplusData(req.query.id_user, offset);
                if (rs == null) {
                    res.send({ data: null });
                } else {
                    var chartRs = await getTagChartData(req.query.id_user, rs[0].start_time);
                    res.send({ data: rs, chartData: chartRs });
                }
            } catch (err) {
                console.log(err);
                res.send({ data: null });
            }
        }
    });

    // icon変更
    route.post('/tagplusData', async (req, res) => { // url : /tagplus/tagplusData post
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            try {
                var rs = await changeIconNum(req.body.tagImgId, req.body.iconNum);
                res.send({ data: rs });
            } catch (err) {
                console.log("################", err);
                res.send({ data: null });
            }
        }
    });

    route.get('/', async (req, res) => { // url : /tagplus
        if (!req.user || !req.user.id_user) {
            // not login
            req.logOut();
            res.redirect('/');
        } else {
            // console.log(req.user);
            // console.log(req.query.id_user);
            // solar_panelユーザはredirectさせる
            if (req.query.solar_panel == 1 || !req.query.solar_panel) {
                res.redirect('/main');
            }
            res.render('tagplus', {
                user: req.query.id_user,
                solar_panel: req.query.solar_panel
            });
        }
    });

    return route;
};