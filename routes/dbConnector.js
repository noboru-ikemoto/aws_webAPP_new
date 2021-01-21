/**
 *================================================================
 *Project Name : nialm web application
 *File Name : dbConnector.js
 *Version : $Id: dbConnector.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

const mysql = require('mysql');
const util = require('util');
const version = "deploy";
// const version = "dev";

module.exports = async (query, values) => {

    var connection;
    switch (version) {
        case "dev":
            connection = mysql.createConnection({
                host: "192.168.22.131",
                user: "ubiquitous",
                password: "ubi1234",
                database: "Disaggregation4",
                timezone: 'UTC'
            });
            break;
        default:
            connection = mysql.createConnection({
                host: "thomasaws.crmnjtay2tde.us-east-2.rds.amazonaws.com",
                user: "thomastech",
                password: "thomastech.123",
                database: "Disaggregation4",
                timezone: 'UTC'
            });
            break;
    }



    // console.log("db query : \n", query);
    // console.log("values : \n", values);

    // set timezone to utc
    var timequery = 'SET @@session.time_zone = "+00:00"';
    try {
        await connection.query(timequery);
    } catch (err) {
        console.log(err);
        throw err;
    }
    try {
        connection.query = util.promisify(connection.query);
        var results = await connection.query(query, values);
        // console.log("db result : \n", results);
        return results;
    } catch (err) {
        console.log("error : ", err);
        throw err;
    } finally {
        connection.end((err) => {
            // The connection is terminated now
            if (err) {
                console.error('[connection.end]err: ' + err);
                connection.destroy();
                return;
            }
        });
    }
}