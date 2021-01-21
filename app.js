/**
 *================================================================
 *Project Name : nialm web application
 *File Name : app.js
 *Version : $Id: app.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

var createError = require('http-errors');
var express = require('express');
var http = require('http');
var bodyParser = require("body-parser");
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var dbConnector = require('./routes/dbConnector');
var session = require("express-session");
var cookieParser = require('cookie-parser');

app.use(express.static(__dirname + '/public'));
// session
app.use(session({
    secret: 'input_ramdom_value',
    resave: false,
    saveUninitialized: true
}));
//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
},
    async function (req, username, password, done) {
        if (req.body.loginmode == "dashboard") {
            var query = 'select id_user from mgmt_disa where id_user="' +
                username + '" and id_pw="' + password + '"';
        } else {
            query = 'select id_user from user_cloud where id_user="' +
                username + '" and id_pw="' + password + '"';
        }
        try {
            var rs = await dbConnector(query);
            // console.log("LocalStrategy"); //array
            if (rs.length > 0) {
                done(null, {
                    id_user: rs[0].id_user,
                    loginmode: req.body.loginmode
                });
            } else {
                done(null, false);
            }
        } catch (err) {
            console.log(err);
            done(null, false);
        }
    }
));
passport.serializeUser(function (user, done) {
    // console.log('########### serializeUser : ', user);
    done(null, user);
});

passport.deserializeUser(async function (user, done) {
    // console.log('########### deserializeUser : ', user);
    if (user.loginmode == "dashboard") {
        var query = 'select id_user from mgmt_disa where function<>999 and id_user="' + user.id_user + '"';
    } else {
        query = 'select id_user from user_cloud where id_user="' + user.id_user + '"';
    }
    try {
        var rs = await dbConnector(query);
        if (rs.length > 0) {
            done(null, { id_user: rs[0].id_user, loginmode: user.loginmode });
        } else {
            done(null, false);
        }
    } catch (err) {
        console.log(err);
        done("login failed");
    }
});

var auth = require('./routes/auth')(passport);
var main = require('./routes/main')();
var mainrecently = require('./routes/mainrecently')();
var mainadvise = require('./routes/mainadvise')();
var life = require('./routes/life')();
var lifeReaction = require('./routes/lifeReaction')();
var lifeAdvise = require('./routes/lifeAdvise')();
var tagplus = require('./routes/tagplus')();
var dashboard = require('./routes/dashboard')(passport);
var dashboardMain = require('./routes/dashboardMain')();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

app.use('/life', life);
app.use('/lifeReaction', lifeReaction);
app.use('/lifeAdvise', lifeAdvise);
app.use(['/', '/logout'], auth);
app.use('/main', main);
app.use('/mainrecently', mainrecently);
app.use('/mainadvise', mainadvise);

app.use('/tagplus', tagplus);
// dashboard page login
app.use(['/dashboard', '/dashboardLogout'], dashboard);
app.use('/dashboardMain', dashboardMain);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
var server = http.createServer(app).listen(process.env.PORT || 3000);

server.timeout = 120000;