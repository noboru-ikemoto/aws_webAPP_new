/**
 *================================================================
 *Project Name : nialm web application
 *File Name : dashboardMain.js
 *Version : $Id: dashboardMain.js 344 2020-06-19 02:52:20Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-06-19 11:52:20 +0900 (2020/06/19 (金)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

module.exports = () => {
    var route = require('express').Router();
    var dbConnector = require('./dbConnector');
    var moment = require('moment');
    const listLength = 20;
    var userList = [];

    // user_cloudにあるユーザを検索
    async function getUserList(page, loginUser) {
        // dashboardのログインユーザのid_cugチェック
        var query = "SELECT id_cug from mgmt_disa where id_user=?";
        var id_cug = '';
        try {
            var rs = await dbConnector(query, loginUser);
            if (rs[0]) {
                id_cug = rs[0].id_cug;
            }
        } catch (err) {
            console.log(err);
            return { err: err };
        }
        var dataList = [];
        // console.log(userList)
        if (userList.length == 0) {
            query = "SELECT id_user from user_disa ";
            if (id_cug) {
                // mgmt_disaのid_cugのデータが存在すればuser_disaのid_cugのデータと一致するユーザのみ取得
                query += "where id_cug=? ";
            }
            query += "order by id_user";
            try {
                rs = await dbConnector(query, id_cug);
                if (rs.length > 0) {
                    rs.forEach(element => {
                        userList.push(element.id_user);
                    });
                } else {
                    return [];
                }
            } catch (err) {
                console.log(err);
                return { err: err };
            }
        }
        var startIndex = ((page - 1) * listLength);
        // console.log("########### idx", startIndex);
        // 全てのユーザを20に割り算して page番目からlistの格納
        // 例)全てずーざ数60, page=2の場合listには21~40番目のユーザがlistに格納される
        for (let i = startIndex; i < startIndex + listLength; i++) {
            if (userList.length - 1 < i) {
                break;
            }
            dataList.push({ id_user: userList[i] });
        };
        return getUserdisaData(dataList);
    }
    async function getUserdisaData(dataList) {
        var query = "SELECT id_user, remarks, id_furiwake, " +
            "input_status_act, input_status_tag, input_status_forecast,solar_panel," +
            "internal_make_flag_act,internal_make_flag_tag,internal_make_flag_forecast," +
            "internal_act,internal_tag,internal_forecast," +
            "internal_time_act,internal_time_tag,internal_time_forecast, " +
            "recovery_status_act,recovery_status_tag,recovery_status_forecast " +
            "from user_disa where id_user in (?)";
        try {
            var users = [];
            dataList.forEach(element => {
                users.push(element.id_user);
            });
            var rs = await dbConnector(query, [users]);
            for (let i = 0; i < dataList.length; i++) {
                for (let j = 0; j < rs.length; j++) {
                    if (dataList[i].id_user == rs[j].id_user) {
                        dataList[i].remarks = rs[j].remarks;
                        dataList[i].input_status_act = rs[j].input_status_act;
                        dataList[i].input_status_tag = rs[j].input_status_tag;
                        dataList[i].input_status_forecast = rs[j].input_status_forecast;
                        dataList[i].recovery_status_act = rs[j].recovery_status_act;
                        dataList[i].recovery_status_tag = rs[j].recovery_status_tag;
                        dataList[i].recovery_status_forecast = rs[j].recovery_status_forecast;
                        dataList[i].id_furiwake = rs[j].id_furiwake;

                        dataList[i].user_status_act = await getUserStatus(
                            rs[j].solar_panel,
                            rs[j].input_status_act,
                            rs[j].internal_make_flag_act,
                            rs[j].internal_act,
                            rs[j].internal_time_act,
                            rs[j].recovery_status_act,
                        );
                        
                        dataList[i].user_status_tag = await getUserStatus(
                            rs[j].solar_panel,
                            rs[j].input_status_tag,
                            rs[j].internal_make_flag_tag,
                            rs[j].internal_tag,
                            rs[j].internal_time_tag,
                            rs[j].recovery_status_tag,
                        );
                        dataList[i].user_status_forecast = await getUserStatus(
                            rs[j].solar_panel,
                            rs[j].input_status_forecast,
                            rs[j].internal_make_flag_forecast,
                            rs[j].internal_forecast,
                            rs[j].internal_time_forecast,
                            rs[j].recovery_status_forecast,
                        );
                        rs.splice(j, 1);
                        break;
                    }
                }
            }
            return dataList;
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    async function getUserStatus
        (solar_panel, input_status, internal_make_flag, internal, internal_time, recovery_status) {
        // s00 : 1,0,0,0,null,無視
        // s01 : 0,0,0,0,null,無視
        // s02 : 0,2,0,0,null,無視
        // s03 : 0,[-1,-2],1,0,null,無視
        // s04 : 0,2,0,[1,2],date,無視
        // s05 : 0,2,1,0,null,無視
        // s09 : 0,0,無視,無視,無視,9
        let code;
        if (solar_panel === 1) {
            code = "s00";
        } else if (input_status === 0 && recovery_status === 9) {
            code = "s09";
        } else if (input_status === 0 && internal_make_flag === 0 &&
             internal === 0) {
            code = "s01";
        } else if (input_status === 2 && internal_make_flag === 0 &&
             internal === 0) {
            code = "s02";
        } else if (input_status < 0 && internal_make_flag === 1 &&
            internal === 0) {
            code = "s03";
        } else if (input_status === 2 && internal_make_flag === 0 
            && internal > 0) {
            code = "s04";
        } else if (input_status === 2 && internal_make_flag === 1 &&
            internal === 0) {
            code = "s05";
        } else {
            code = "";
        }
        let query = "SELECT msg1 FROM msg_app WHERE id_msg=?";
        try {
            let rs = await dbConnector(query, code);
            // console.log(rs[0].msg1)
            if (!rs[0] || !rs[0].msg1){
                return "";
            }
            return rs[0].msg1;
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    // event_appのリカバリレコードcheck_flgを取得
    // async function getEventAppStatusFlag(dataList) {
    //     var query = "SELECT id_user,recovery_status_act,recovery_status_tag," +
    //         "recovery_status_forecast from user_disa";
    //     try {
    //         var rs = await dbConnector(query);
    //         for (let i = 0; i < dataList.length; i++) {
    //             for (let j = 0; j < rs.length; j++) {
    //                 if (dataList[i].id_user == rs[j].id_user) {
    //                     dataList[i].recovery_status_act = rs[j].recovery_status_act;
    //                     dataList[i].recovery_status_tag = rs[j].recovery_status_tag;
    //                     dataList[i].recovery_status_forecast = rs[j].recovery_status_forecast;
    //                     rs.splice(j, 1);
    //                     break;
    //                 }
    //             }
    //         }
    //         return dataList;
    //     } catch (err) {
    //         console.log(err);
    //         return { err: err };
    //     }
    // }

    async function getAccPowerTableData(dataList) {
        // console.log(dataList)
        // for (let i = 0; i < dataList.length; i++) {
        //     var query = '(SELECT id_user, input_date, input_power, ' +
        //         'sig_level from tms_input_acc where id_user = "' +
        //         dataList[i].id_user + '" order by input_date desc limit 1) union ' +
        //         'SELECT id_user, input_date, input_power as input_power_acc, ' +
        //         'sig_level from tms_input_acc where (input_date = ' +
        //         'DATE_SUB((SELECT input_date from tms_input_acc where id_user = "' + dataList[i].id_user +
        //         '" order by input_date desc limit 1), interval 60 minute) or input_date = ' +
        //         'DATE_SUB((SELECT input_date from tms_input_acc where id_user = "' + dataList[i].id_user +
        //         '" order by input_date desc limit 1), interval 70 minute))' +
        //         'and id_user = "' + dataList[i].id_user + '" order by input_date desc';
        //     try {
        //         var rs = await dbConnector(query);
        //         if (rs.length > 0) {
        //             dataList[i].sig_level = rs[0].sig_level;
        //         }
        //         if (rs.length > 1) {
        //             var date1 = moment(rs[0].input_date);
        //             var date2 = moment(rs[1].input_date);
        //             if (date1.subtract(60, "minute").toISOString() != date2.toISOString()) {
        //                 if (date1.subtract(10, "minute").toISOString() != date2.toISOString()) {
        //                     continue;
        //                 } else { // 70分のデーターがある場合の処理
        //                     dataList[i].input_date_acc = rs[0].input_date;
        //                     var tempresult = rs[0].input_power - rs[1].input_power;
        //                     dataList[i].input_power_acc = tempresult.toFixed(1);
        //                     // 70分のデーターがある場合印としてアンダースコアをつける
        //                     dataList[i].input_power_acc += "_";
        //                 }
        //             } else { // 60分のデーターがある場合の処理
        //                 dataList[i].input_date_acc = rs[0].input_date;
        //                 var tempresult = rs[0].input_power - rs[1].input_power;
        //                 dataList[i].input_power_acc = tempresult.toFixed(1);
        //             }
        //         }
        //     } catch (err) {
        //         console.log(err);
        //         return { err: err };
        //     }
        // }
        var query = "SELECT a.id_user, a.sig_level from tms_input_acc as a " +
            "JOIN (select id_user, max(input_date) as input_date from tms_input_acc group by id_user) as b " +
            "on a.input_date = b.input_date and a.id_user=b.id_user";
        try {
            var rs = await dbConnector(query);
            if (rs.length > 0) {
                for (let i = 0; i < dataList.length; i++) {
                    for (let j = 0; j < rs.length; j++) {
                        if (dataList[i].id_user == rs[j].id_user) {
                            dataList[i].sig_level = rs[j].sig_level;
                            rs.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        } catch (err) {
            console.log(err);
            return { err: err };
        }
        return getInsPowerTableData(dataList);
    }

    async function getInsPowerTableData(dataList) {
        var query = "SELECT a.id_user,a.input_date,a.input_power from tms_input as a " +
            "JOIN (select id_user, max(input_date) as input_date from tms_input group by id_user) as b" +
            " on a.input_date = b.input_date and a.id_user=b.id_user";

        try {
            var rs = await dbConnector(query);
            if (rs.length > 0) {
                for (let i = 0; i < dataList.length; i++) {
                    for (let j = 0; j < rs.length; j++) {
                        if (dataList[i].id_user == rs[j].id_user) {
                            dataList[i].input_date = rs[j].input_date;
                            dataList[i].input_power = rs[j].input_power;
                            rs.splice(j, 1);
                            break;
                        }
                    }
                }
            }
            return getInsCount1(dataList);
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    async function getInsCount1(dataList) {
        var query = "SELECT id_user, count(*) as count from tms_input " +
            "where input_date >= " +
            "DATE_FORMAT(" +
            "DATE_SUB(DATE_ADD(now(), interval 9 hour),interval 2 day) " +
            ",'%Y-%m-%d %H') group by id_user";
        try {
            var rs = await dbConnector(query);
            if (rs.length > 0) {
                for (let i = 0; i < dataList.length; i++) {
                    // dataList[i]["2days_data"] = 0;
                    for (let j = 0; j < rs.length; j++) {
                        if (dataList[i].id_user == rs[j].id_user) {
                            dataList[i]["2days_data"] = rs[j].count;
                        }
                    }
                }
            }
            return getInsCount2(dataList);
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    async function getInsCount2(dataList) {
        var query = "SELECT id_user, count(*) as count from tms_input " +
            "where input_date >= " +
            "DATE_FORMAT(" +
            "DATE_SUB(DATE_ADD(now(), interval 9 hour),interval 3 day) " +
            ",'%Y-%m-%d') group by id_user";
        try {
            var rs = await dbConnector(query);
            if (rs.length > 0) {
                for (let i = 0; i < dataList.length; i++) {
                    // dataList[i]["3days_data"] = 0;
                    for (let j = 0; j < rs.length; j++) {
                        if (dataList[i].id_user == rs[j].id_user) {
                            dataList[i]["3days_data"] = rs[j].count;
                        }
                    }
                }
            }
            return dataList;
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    async function getSentFlagCount(dataList) {
        var query = "SELECT count(case when sent_flag_act=1 then 1 end)" +
            "+ count(case when sent_flag_act=2 then 1 end) act1," +
            "count(case when sent_flag_act=0 then 1 end)" +
            "+ count(case when sent_flag_act=4 then 1 end) act2," +
            "count(case when sent_flag_tag=1 then 1 end)" +
            "+ count(case when sent_flag_tag=2 then 1 end) tag1," +
            "count(case when sent_flag_tag=0 then 1 end)" +
            "+ count(case when sent_flag_tag=4 then 1 end) tag2," +
            "count(case when sent_flag_forecast=1 then 1 end)" +
            "+ count(case when sent_flag_forecast=2 then 1 end) fore1," +
            "count(case when sent_flag_forecast=0 then 1 end)" +
            "+ count(case when sent_flag_forecast=4 then 1 end) fore2," +
            "id_user from tms_input group by id_user";
        try {
            var rs = await dbConnector(query);
            if (rs.length > 0) {
                for (let i = 0; i < dataList.length; i++) {
                    for (let j = 0; j < rs.length; j++) {
                        if (dataList[i].id_user == rs[j].id_user) {
                            dataList[i].sent_flag_act_1 = rs[j].act1;
                            dataList[i].sent_flag_tag_1 = rs[j].tag1;
                            dataList[i].sent_flag_fore_1 = rs[j].fore1;
                            dataList[i].sent_flag_act_2 = rs[j].act2;
                            dataList[i].sent_flag_tag_2 = rs[j].tag2;
                            dataList[i].sent_flag_fore_2 = rs[j].fore2;
                            rs.splice(j, 1);
                            break;
                        }
                    }
                }
            }
            return getEventCheckFlag(dataList);
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    async function getEventCheckFlag(dataList) {
        var query = "SELECT id_user, " +
            "count(case when check_flg=1 then 1 end) as chk1, " +
            "count(case when check_flg=2 then 1 end) as chk2 " +
            "from event_app group by id_user";
        try {
            var rs = await dbConnector(query);
            if (rs.length > 0) {
                for (let i = 0; i < dataList.length; i++) {
                    for (let j = 0; j < rs.length; j++) {
                        if (dataList[i].id_user == rs[j].id_user) {
                            dataList[i].check_flag_1 = rs[j].chk1;
                            dataList[i].check_flag_2 = rs[j].chk2;
                            rs.splice(j, 1);
                            break;
                        }
                    }
                }
            }
            return dataList;
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    // user別検索
    async function searchUserList(keyword) {
        var query = "SELECT id_user "+
            "from user_disa where id_user like '%" + keyword + "%' or remarks like '%" + keyword + "%'";
        try {
            let user_list = await dbConnector(query);
            let result = await getUserdisaData(user_list);
            return result;
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    // service別検索
    async function searchService(isActChecked, isTagChecked, isForeChecked) {
        var query = "SELECT id_user, remarks, input_status_act, input_status_tag, input_status_forecast, " +
            "recovery_status_act,recovery_status_tag,recovery_status_forecast " +
            "from user_disa where ";
        if (isActChecked == "true") {
            query += "input_status_act=0 ";
        } else {
            query += "input_status_act<>-1 ";
        }
        if (isTagChecked == "true") {
            query += "and input_status_tag=0 ";
        } else {
            query += "and input_status_tag<>-1 ";
        }
        if (isForeChecked == "true") {
            query += "and input_status_forecast=0";
        } else {
            query += "and input_status_forecast<>-1";
        }
        try {
            return await dbConnector(query);
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    // insert restart record to event_app 
    async function insertRestartRecord(id_user, remarks, service, date) {
        var offset = moment(new Date()).utcOffset();
        console.log("$$$$$$$$$ offset", offset);
        if (offset == 0) {
            // jtcからutcに変更
            date = moment(new Date(date)).subtract(9, 'hour').format("YYYY-MM-DD HH:mm");
        }
        let values = [id_user, "restart001", "Recovery for " + service + " " + remarks, date, service];
        let query = "INSERT INTO " +
            "event_app (id_user,event_type,event_message,updated_time,id_service) " +
            "VALUES (?,?,?,?,?)";
        try {
            await dbConnector(query, values);
            return updateUserDisaRecoveryStatus(id_user, service, 1);
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    // change user_disa recovery_status
    async function updateUserDisaRecoveryStatus(id_user, service, statusNum) {
        let query = "UPDATE user_disa SET " +
            "recovery_status_" + service + "=? where id_user=?";
        try {
            return await dbConnector(query, [statusNum, id_user]);
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    // delete restart record
    async function deleteRestartRecord(id_user, service) {
        let query = "DELETE from event_app " +
            "where id_user=? and id_service=? " +
            "and event_type='restart001' and check_flg is null " +
            "order by updated_time desc limit 1";
        try {
            return await dbConnector(query, [id_user, service]);
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    // batch_event実行時間スタンプ
    async function getEventAppTime() {
        let query = "SELECT processed_time from mgmt_disa where function=999";
        try {
            let rs = await dbConnector(query);
            if (rs.length > 0) {
                return rs[0];
            } else {
                return 0;
            }
        } catch (err) {
            console.log(err);
            return { err: err };
        }
    }

    // 認証
    route.get('/', async (req, res) => {
        if (!req.user || !req.user.id_user || req.user.loginmode != "dashboard") {
            // not login or acccess by nomal user
            req.logout();
            res.redirect('/dashboard');
        } else {
            res.render('dashboardMain', { user: req.user.id_user });
        }

        // res.render('dashboardMain', { user: "send user id" });
    });


    // 最初の画面
    route.get('/data', async (req, res) => {
        if (!req.user || !req.user.id_user || req.user.loginmode != "dashboard") {
            // not login
            req.logout();
            res.redirect('/dashboard');
        } else {
            if (!req.query.id_user_list) {
                // 初期ロードの時、userListを作成してgetUserdisaDataを実行
                userList = [];
                var list = await getUserList(req.query.page, req.user.id_user);
            } else {
                userList = req.query.id_user_list;
                list = await getUserdisaData(userList);
            }
            list = await getAccPowerTableData(list);
            let eventTime = await getEventAppTime();
            res.send({
                user: req.user.id_user,
                dataList: list,
                count: userList.length,
                processed_time: eventTime.processed_time
            });
        }

        // var list = await getUserList(req.query.page);
        // list = await getAccPowerTableData(list);
        // res.send({ user: "send user id", dataList: list, count: userList.length });
    });

    // 2ページデータ要請
    route.get('/additionalData', async (req, res) => {
        if (!req.user || !req.user.id_user || req.user.loginmode != "dashboard") {
            // not login
            req.logout();
            res.redirect('/dashboard');
        } else {
            userList = req.query.id_user_list;
            // var list = await getUserList(req.query.page);
            var list = await getUserdisaData(userList);
            list = await getSentFlagCount(list);
            let rs = await getEventAppTime();
            res.send({
                user: req.user.id_user,
                dataList: list,
                processed_time: rs.processed_time
            });
        }

        // var list = await getUserList(req.query.page);
        // list = await getSentFlagCount(list);
        // res.send({ user: "send user id", dataList: list, count: userList.length });
    });

    // allデータ要請
    route.get('/allData', async (req, res) => {
        if (!req.user || !req.user.id_user || req.user.loginmode != "dashboard") {
            // not login
            req.logout();
            res.redirect('/dashboard');
        } else {
            userList = req.query.id_user_list;
            // var list = await getUserList(req.query.page);
            var list = await getUserdisaData(userList);
            list = await getAccPowerTableData(list);
            list = await getSentFlagCount(list);
            let rs = await getEventAppTime();
            res.send({
                user: req.user.id_user,
                dataList: list,
                processed_time: rs.processed_time
            });
        }

        // var list = await getUserList(req.query.page);
        // list = await getAccPowerTableData(list);
        // list = await getSentFlagCount(list);
        // res.send({ user: "send user id", dataList: list, count: userList.length });
    });

    // ユーザ検索
    route.get('/search', async (req, res) => {
        if (!req.user || !req.user.id_user || req.user.loginmode != "dashboard") {
            // not login
            req.logout();
            res.redirect('/dashboard');
        } else {
            var list = await searchUserList(req.query.keyword);
            list = await getAccPowerTableData(list);
            // console.log(list)
            res.send({ user: req.user.id_user, dataList: list })
        }
    });

    // サービス検索
    route.get('/searchService', async (req, res) => {
        if (!req.user || !req.user.id_user || req.user.loginmode != "dashboard") {
            // not login
            req.logout();
            res.redirect('/dashboard');
        } else {
            var list = await searchService(
                req.query.isActChecked, req.query.isTagChecked, req.query.isForeChecked);
            list = await getAccPowerTableData(list);
            res.send({ user: req.user.id_user, dataList: list })
        }
    });

    // restart登録
    route.get('/restart', async (req, res) => {
        if (!req.user || !req.user.id_user || req.user.loginmode != "dashboard") {
            // not login
            req.logout();
            res.redirect('/dashboard');
        } else {
            var rs = await insertRestartRecord(req.query.id_user, req.query.remarks, req.query.service, req.query.date);
            res.send({ user: req.user.id_user, data: rs });
        }
    });

    // restartキャンセル
    route.get('/restartCancel', async (req, res) => {
        if (!req.user || !req.user.id_user || req.user.loginmode != "dashboard") {
            // not login
            req.logout();
            res.redirect('/dashboard');
        } else {
            var rs = await deleteRestartRecord(req.query.id_user, req.query.service);
            if (rs.affectedRows > 0) {
                // 削除成功の場合user_disaのstatusを0に変更
                await updateUserDisaRecoveryStatus(req.query.id_user, req.query.service, 0);
                rs = await searchUserList(req.query.id_user);
                if (rs.length > 1) {
                    for (let i = 0; i < rs.length; i++) {
                        if (rs[i].id_user == req.query.id_user) {
                            rs.splice(i + 1, rs.length - 1);
                            break;
                        }
                    }
                }
            }
            res.send({ user: req.user.id_user, data: rs });
        }
    });

    return route;
};