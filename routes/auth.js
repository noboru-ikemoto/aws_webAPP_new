/**
 *================================================================
 *Project Name : nialm web application
 *File Name : auth.js
 *Version : $Id: auth.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

module.exports = (passport) => {
    var route = require('express').Router();
    route.post('/',
        passport.authenticate('local', {
            successRedirect: '/main',
            failureRedirect: '/',
            failureFlash: false
        })
    );
    route.get('/logout', (req, res) => {
        req.logout();
        req.session.save(() => {
            res.redirect('/');
        });
    });
    route.get('/', (req, res) => {
        res.render('login');
    });
    return route;
};