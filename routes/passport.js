/**
 *================================================================
 *Project Name : nialm web application
 *File Name : passport.js
 *Version : $Id: passport.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

module.exports = function (app) {
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var dbConnector = require('./dbConnector');
    var session = require("express-session");
    // session
    app.use(session({
        secret: 'input_ramdom_value',
        resave: false,
        saveUninitialized: true
    }));
    //passport
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(
        async function (username, password, done) {
            var query = 'select id_user from user_cloud where id_user="' +
                username + '" and id_pw="' + password + '"';
            try {
                var rs = await dbConnector(query);
                console.log("LocalStrategy : ", rs); //array
                done(null, rs[0]);
            } catch (err) {
                console.log(err);
                done(null, false);
            }
        }
    ));
    passport.serializeUser(function (user, done) {
        console.log('serializeUser : ', user);
        done(null, user);
    });

    passport.deserializeUser(async function (user, done) {
        var query = 'select id_user from user_cloud where id_user="' + user.id_user + '"';
        try {
            var rs = await dbConnector(query);
            if (rs.length > 0) {
                console.log('deserializeUser : ', user);
                done(null, rs[0]);
            }
        } catch (err) {
            console.log(err);
            done("login failed");
        }
    });
    return passport;
};