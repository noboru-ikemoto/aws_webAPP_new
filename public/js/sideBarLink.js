/**
 *================================================================
 *Project Name : nialm web application
 *File Name : sideBarLink.js
 *Version : $Id: sideBarLink.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

var user_id = document.getElementById("user_id").innerText;
var solar_panel_user = document.getElementById("solar_panel_user").innerText.trim();
// console.log(user_id);

function goMain() {
    window.location.href = "/main?id_user=" + user_id;
    if ($(window).width() > 768) {
        console.log("size");
        // $("body").toggleClass("sidebar-toggled");
        // $(".sidebar").toggleClass("toggled");
    }
}

function goLife() {
    window.location.href = "/life?id_user=" + user_id + "&solar_panel=" + solar_panel_user;
}

function goTagplus() {
    window.location.href = "/tagplus?id_user=" + user_id + "&solar_panel=" + solar_panel_user;
}

function goLifeReaction() {
    window.location.href = "/lifeReaction?id_user=" + user_id + "&solar_panel=" + solar_panel_user;
}

function goLifeAdvise() {
    window.location.href = "/lifeAdvise?id_user=" + user_id + "&solar_panel=" + solar_panel_user;
}