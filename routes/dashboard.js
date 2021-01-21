/**
 *================================================================
 *Project Name : nialm web application
 *File Name : dashboard.js
 *Version : $Id: dashboard.js 318 2020-04-13 04:04:37Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-13 13:04:37 +0900 (2020/04/13 (月)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

module.exports = (passport) => {
    var route = require('express').Router();
    route.post('/',
        passport.authenticate('local', {
            successRedirect: '/dashboardMain',
            failureRedirect: '/dashboard',
            failureFlash: false
        })
    );
    route.get('/dashboardLogout', (req, res) => {
        req.logout();
        req.session.save(() => {
            res.redirect('/dashboard');
        });
    });
    route.get('/', (req, res) => {
        res.render('dashboard');
    });
    return route;
};