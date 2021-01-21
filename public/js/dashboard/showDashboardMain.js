/**
 *================================================================
 *Project Name : nialm web application
 *File Name : showDashboardMain.js
 *Version : $Id: showDashboardMain.js 341 2020-06-16 02:09:03Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-06-16 11:09:03 +0900 (2020/06/16 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

const columnNameList1 = [
    'id_user',
    'remarks',
    'id_furiwake',
    'sig_level',
    'input_status_act',
    'input_status_tag',
    'input_status_forecast',
    'input_date',
    'input_power',
    '2days_data',
    '3days_data',
];
const columnNameList2 = [
    'id_user',
    'remarks',
    'sent_flag_act_1',
    'sent_flag_act_2',
    'sent_flag_tag_1',
    'sent_flag_tag_2',
    'sent_flag_fore_1',
    'sent_flag_fore_2',
    'check_flag_1',
    'check_flag_2'
];

const tooltipString = [
    'ユーザID',
    'ユーザ補足説明',
    '分散処理のための<br/>振り分け先ID',
    '受信電界強度',
    '生活反応サービス状況<br/>(A:追加データ処理中, P:新規データ処理, -:停止中<br/>L1:中間データ(新規)利用の再開処理<br/>L2:中間データ(追加)利用の再開処理)',
    'タギングサービス状況<br/>(A:追加データ処理中, P:新規データ処理, -:停止中<br/>L1:中間データ(新規)利用の再開処理<br/>L2:中間データ(追加)利用の再開処理)',
    '予測サービス状況<br/>(A:追加データ処理中, P:新規データ処理, -:停止中<br/>L1:中間データ(新規)利用の再開処理<br/>L2:中間データ(追加)利用の再開処理)',
    '瞬時値データの最新受信日時<br/>(現在時間より5分遅れている場合はオレンジ色)',
    '瞬時値の最新受信日時の<br/>瞬時電力',
    '2日間の受信データ件数<br/>(2日前のHH:00から現時点まで)',
    '3日間の受信データ件数<br/>(3日前の00:00から現時点まで)',
    '生活反応で処理した<br/>データ件数(分数): flag 1とflag 2の合計',
    '生活反応で未処理の<br/>データ件数(分数): flag 0の合計',
    'タギングで処理した<br/>データ件数(分数): flag 1とflag 2の合計',
    'タギングで未処理の<br/>データ件数(分数): flag 0の合計',
    '予測で処理したデータ件数<br/>(分数): flag 1とflag 2の合計',
    '予測で未処理のデータ件数<br/>(分数): flag 0の合計',
    'eventレコードの件数<br/>(メール送付等を行ったもの)',
    'eventレコードの件数<br/>(メール送付後処理をしたもの)'
];

var id_user_list = [];
var footerNode = document.getElementById("footer");
var restartElement;
var restart_id_user;

// create half page
function createTable(dataList, mode) {
    var columns = [];
    var tempColumnNameList = [];

    var sub2day = moment().subtract(2, 'day').utcOffset("+09:00").format('YYYY-MM-DD HH:00');
    var now = moment(new Date()).utcOffset("+09:00");
    var day2data = now.diff(moment(sub2day), 'minute');
    var sub3day = moment().subtract(3, 'day').utcOffset("+09:00").format('YYYY-MM-DD 00:00');
    var day3data = now.diff(moment(sub3day), 'minute');
    var sub5min = moment(new Date()).subtract(5, 'minute');

    if (mode == 1) {
        tempColumnNameList = columnNameList1;
        columns[0] = { title: tempColumnNameList[0] };
        columns[1] = { title: tempColumnNameList[1] };
        columns[2] = { title: tempColumnNameList[2].split("_").join("<br/>") };
        columns[3] = { title: tempColumnNameList[3].split("_").join("<br/>") + "<br/>(dBm)" };
        columns[4] = { title: tempColumnNameList[4].split("_").join("<br/>") };
        columns[5] = { title: tempColumnNameList[5].split("_").join("<br/>") };
        columns[6] = { title: tempColumnNameList[6].split("_").join("<br/>") };
        columns[7] = { title: tempColumnNameList[7] };
        columns[8] = { title: tempColumnNameList[8].split("_").join("<br/>") + "<br/>(W)" };
        columns[9] = { title: tempColumnNameList[9].split("_").join("<br/>") };
        columns[9].title = [columns[9].title.slice(0, 1), " ", columns[9].title.slice(1)].join('') +
            "<br/>(" + day2data + ")";
        columns[10] = { title: tempColumnNameList[10].split("_").join("<br/>") };
        columns[10].title = [columns[10].title.slice(0, 1), " ", columns[10].title.slice(1)].join('') +
            "<br/>(" + day3data + ")";
    } else if (mode == 2) {
        tempColumnNameList = columnNameList2;
        columns[0] = { title: tempColumnNameList[0] };
        columns[1] = { title: tempColumnNameList[1] };
        columns[2] = { title: tempColumnNameList[2].split("_").join("<br/>") };
        columns[2].title = columns[2].title.substring(0, columns[2].title.length - 1) + "(処理済)";
        columns[3] = { title: tempColumnNameList[3].split("_").join("<br/>") };
        columns[3].title = columns[3].title.substring(0, columns[3].title.length - 1) + "(未処理)";
        columns[4] = { title: tempColumnNameList[4].split("_").join("<br/>") };
        columns[4].title = columns[4].title.substring(0, columns[4].title.length - 1) + "(処理済)";
        columns[5] = { title: tempColumnNameList[5].split("_").join("<br/>") };
        columns[5].title = columns[5].title.substring(0, columns[5].title.length - 1) + "(未処理)";
        columns[6] = { title: tempColumnNameList[6].split("_").join("<br/>") };
        columns[6].title = columns[6].title.substring(0, columns[6].title.length - 1) + "(処理済)";
        columns[7] = { title: tempColumnNameList[7].split("_").join("<br/>") };
        columns[7].title = columns[7].title.substring(0, columns[7].title.length - 1) + "(未処理)";
        columns[8] = { title: tempColumnNameList[8].split("_").join("<br/>") };
        columns[9] = { title: tempColumnNameList[9].split("_").join("<br/>") };
    }
    $(document).ready(() => {
        table = $('#dashboardTable').DataTable({
            columns: columns,
            data: createTableData(dataList, tempColumnNameList),
            colReorder: true,
            pageLength: 20,
            // lengthMenu: [20, 40, 80, 100],
            searching: false,
            paging: false,
            scrollY: "400px",
            scrollX: true,
            scrollCollapse: true,
            bInfo: false,
            columnDefs: [{
                targets: 0,
                render: function (data, type, full, meta) {
                    return '<a href="#">' + data + '</a>';
                }
            }],
            // add column tooltip 
            headerCallback: function (thead, data, start, end, display) {
                for (let i = 0; i < thead.childNodes.length; i++) {
                    thead.childNodes[i].setAttribute('data-toggle', "tooltip");
                    thead.childNodes[i].setAttribute('data-placement', "bottom");
                    thead.childNodes[i].setAttribute('title', tooltipString[i]);
                    if (mode == 2 && i > 1) {
                        thead.childNodes[i].setAttribute('title', tooltipString[i + 9]);
                    }
                }
                // console.log("child => ", thead.childNodes[0]);
            },
            createdRow: function (row, data, dataIndex) {
                $(row).find('td:eq(0)').text(data[0].id_user);
                $(row).find('td:eq(0)').addClass('dash-board-link');
                if (data[0].status == false) {
                    $(row).find('td:eq(0)').css("background-color", "rgba(0, 0, 0, 0.2)");
                }
                $(row).find('td:eq(0)').on("click", (e) => {
                    showUserDetail(e.currentTarget.innerText);
                });
                // console.log(dataList);
                if (mode == 1) {
                    // 1 page画面
                    if (data[3] <= -85) {
                        $(row).find('td:eq(3)').addClass('bg-warning');
                    }
                    if (data[4].startsWith("-")) {
                        $(row).find('td:eq(4)').css("background-color", "rgba(0, 0, 0, 0.2)");
                    } else {
                        $(row).find('td:eq(4)').addClass('dash-board-link');
                        if (data[4].startsWith("P")) {
                            $(row).find('td:eq(4)').addClass('bg-warning');
                        } else if (data[4].startsWith("A")) {
                            $(row).find('td:eq(4)').css("background-color", "rgba(92, 250, 92, 1)");
                        } else if (data[4].startsWith("F")) {
                            $(row).find('td:eq(4)').addClass('bg-danger');
                        } else if (data[4].startsWith("R")) {
                            $(row).find('td:eq(4)').css("background-color", "rgba(153, 102, 51, 1)");
                        } else if (data[4].startsWith("L1")) {
                            $(row).find('td:eq(4)').addClass('bg-primary');
                        } else if (data[4].startsWith("L2")) {
                            $(row).find('td:eq(4)').addClass('bg-info');
                        }
                        $(row).find('td:eq(4)').bind('click', () => {
                            if (data[4].startsWith("A")) {
                                restartElement = $(row).find('td:eq(4)');
                                restart_id_user = data[0];
                                showResetForm(data[0], data[1], data[4], "act");
                            }
                        });
                    }
                    if (data[5].startsWith("-")) {
                        $(row).find('td:eq(5)').css("background-color", "rgba(0, 0, 0, 0.2)");
                    } else {
                        $(row).find('td:eq(5)').addClass('dash-board-link');
                        if (data[5].startsWith("P")) {
                            $(row).find('td:eq(5)').addClass('bg-warning');
                        } else if (data[5].startsWith("A")) {
                            $(row).find('td:eq(5)').css("background-color", "rgba(92, 250, 92, 1)");
                        } else if (data[5].startsWith("F")) {
                            $(row).find('td:eq(5)').addClass('bg-danger');
                        } else if (data[5].startsWith("R")) {
                            $(row).find('td:eq(5)').css("background-color", "rgba(153, 102, 51, 1)");
                        } else if (data[5].startsWith("L1")) {
                            $(row).find('td:eq(5)').addClass('bg-primary');
                        } else if (data[5].startsWith("L2")) {
                            $(row).find('td:eq(5)').addClass('bg-info');
                        }
                        $(row).find('td:eq(5)').bind('click', () => {
                            if (data[5].startsWith("A")) {
                                restartElement = $(row).find('td:eq(5)');
                                restart_id_user = data[0];
                                showResetForm(data[0], data[1], data[5], "tag");
                            }
                        });
                    }

                    if (data[6].startsWith("-")) {
                        $(row).find('td:eq(6)').css("background-color", "rgba(0, 0, 0, 0.2)");
                    } else {
                        $(row).find('td:eq(6)').addClass('dash-board-link');
                        if (data[6].startsWith("P")) {
                            $(row).find('td:eq(6)').addClass('bg-warning');
                        } else if (data[6].startsWith("A")) {
                            $(row).find('td:eq(6)').css("background-color", "rgba(92, 250, 92, 1)");
                        } else if (data[6].startsWith("F")) {
                            $(row).find('td:eq(6)').addClass('bg-danger');
                        } else if (data[6].startsWith("R")) {
                            $(row).find('td:eq(6)').css("background-color", "rgba(153, 102, 51, 1)");
                        } else if (data[6].startsWith("L1")) {
                            $(row).find('td:eq(6)').addClass('bg-primary');
                        } else if (data[6].startsWith("L2")) {
                            $(row).find('td:eq(6)').addClass('bg-info');
                        }
                        $(row).find('td:eq(6)').bind('click', () => {
                            if (data[6].startsWith("A")) {
                                restartElement = $(row).find('td:eq(6)');
                                restart_id_user = data[0];
                                showResetForm(data[0], data[1], data[6], "forecast");
                            }
                        });
                    }
                    var a = data[7].split(/[^0-9]/);
                    var insDate = new Date(a[0], a[1] - 1, a[2], a[3], a[4]);
                    if (data[7] != "-") {
                        if (sub5min > insDate) {
                            $(row).find('td:eq(7)').addClass('bg-warning');
                            $(row).find('td:eq(8)').addClass('bg-warning');
                        }
                    }
                    $(row).find('td:eq(8)').addClass('text-center');
                    if ((data[9] / day2data) <= 0.98) {
                        $(row).find('td:eq(9)').addClass('bg-warning');
                    }
                    if ((data[10] / day3data) <= 0.98) {
                        $(row).find('td:eq(10)').addClass('bg-warning');
                    }
                } else if (mode == 2) {
                    // 2 page画面
                    // $(row).find('td:eq(0)').text(data[0].id_user);
                    // if (data[0].status == false) {
                    //     $(row).find('td:eq(0)').css("background-color", "rgba(0, 0, 0, 0.2)");
                    // }
                    if (data[2] > 99999) {
                        $(row).find('td:eq(2)').html('99999');
                    }
                    if (data[3] > 99999) {
                        $(row).find('td:eq(3)').html('99999');
                    }
                    if (data[4] > 99999) {
                        $(row).find('td:eq(4)').html('99999');
                    }
                    if (data[5] > 99999) {
                        $(row).find('td:eq(5)').html('99999');
                    }
                    if (data[6] > 99999) {
                        $(row).find('td:eq(6)').html('99999');
                    }
                    if (data[7] > 99999) {
                        $(row).find('td:eq(7)').html('99999');
                    }
                }
            },
            drawCallback: (settings) => {
                $('[data-toggle="tooltip"]').tooltip({
                    html: true
                });
            },
        }).columns.adjust();
    });
}

// create full page
function createFullTable(dataList) {
    var tempColumnNameList = [];
    var columns = [];

    var sub2day = moment().subtract(2, 'day').utcOffset("+09:00").format('YYYY-MM-DD HH:00');
    var now = moment(new Date());
    var day2data = now.diff(moment(sub2day), 'minute');
    var sub3day = moment().subtract(3, 'day').utcOffset("+09:00").format('YYYY-MM-DD 00:00');
    var day3data = now.diff(moment(sub3day), 'minute');

    var sub5min = moment(new Date()).subtract(5, 'minute');
    columnNameList1.forEach(element => {
        tempColumnNameList.push(element);
    });
    for (let i = 2; i < columnNameList2.length; i++) {
        tempColumnNameList.push(columnNameList2[i]);
    }
    columns[0] = { title: tempColumnNameList[0] };
    columns[1] = { title: tempColumnNameList[1] };
    columns[2] = { title: tempColumnNameList[2].split("_").join("<br/>") };
    columns[3] = { title: tempColumnNameList[3].split("_").join("<br/>") + "<br/>(dBm)" };
    columns[4] = { title: tempColumnNameList[4].split("_").join("<br/>") };
    columns[5] = { title: tempColumnNameList[5].split("_").join("<br/>") };
    columns[6] = { title: tempColumnNameList[6].split("_").join("<br/>") };
    columns[7] = { title: tempColumnNameList[7] };
    columns[8] = { title: tempColumnNameList[8].split("_").join("<br/>") + "<br/>(W)" };
    columns[9] = { title: tempColumnNameList[9].split("_").join("<br/>") };
    columns[9].title = [columns[9].title.slice(0, 1), " ", columns[9].title.slice(1)].join('') +
        "<br/>(" + day2data + ")";
    columns[10] = { title: tempColumnNameList[10].split("_").join("<br/>") };
    columns[10].title = [columns[10].title.slice(0, 1), " ", columns[10].title.slice(1)].join('') +
        "<br/>(" + day3data + ")";

    columns[11] = { title: tempColumnNameList[11].split("_").join("<br/>") };
    columns[11].title = columns[11].title.substring(0, columns[11].title.length - 1) + "(処理済)";
    columns[12] = { title: tempColumnNameList[12].split("_").join("<br/>") };
    columns[12].title = columns[12].title.substring(0, columns[12].title.length - 1) + "(未処理)";
    columns[13] = { title: tempColumnNameList[13].split("_").join("<br/>") };
    columns[13].title = columns[13].title.substring(0, columns[13].title.length - 1) + "(処理済)";
    columns[14] = { title: tempColumnNameList[14].split("_").join("<br/>") };
    columns[14].title = columns[14].title.substring(0, columns[14].title.length - 1) + "(未処理)";
    columns[15] = { title: tempColumnNameList[15].split("_").join("<br/>") };
    columns[15].title = columns[15].title.substring(0, columns[15].title.length - 1) + "(処理済)";
    columns[16] = { title: tempColumnNameList[16].split("_").join("<br/>") };
    columns[16].title = columns[16].title.substring(0, columns[16].title.length - 1) + "(未処理)";
    columns[17] = { title: tempColumnNameList[17].split("_").join("<br/>") };
    columns[18] = { title: tempColumnNameList[18].split("_").join("<br/>") };

    $(document).ready(() => {
        table = $('#dashboardTable').DataTable({
            columns: columns,
            data: createTableData(dataList, tempColumnNameList),
            colReorder: true,
            pageLength: 20,
            // lengthMenu: [20, 40, 80, 100],
            searching: false,
            paging: false,
            scrollY: "400px",
            scrollX: true,
            scrollCollapse: true,
            bInfo: false,
            columnDefs: [{
                targets: 0,
                render: function (data, type, full, meta) {
                    return '<a href="#">' + data + '</a>';
                }
            }],
            headerCallback: function (thead, data, start, end, display) {
                for (let i = 0; i < thead.childNodes.length; i++) {
                    thead.childNodes[i].setAttribute('data-toggle', "tooltip");
                    thead.childNodes[i].setAttribute('data-placement', "bottom");
                    thead.childNodes[i].setAttribute('title', tooltipString[i]);
                }
            },
            createdRow: function (row, data, dataIndex) {
                $(row).find('td:eq(0)').text(data[0].id_user);
                $(row).find('td:eq(0)').addClass('dash-board-link');
                if (data[0].status == false) {
                    $(row).find('td:eq(0)').css("background-color", "rgba(0, 0, 0, 0.2)");
                }
                $(row).find('td:eq(0)').on("click", (e) => {
                    showUserDetail(e.currentTarget.innerText);
                });
                if (data[3] <= -85) {
                    $(row).find('td:eq(3)').addClass('bg-warning');
                }

                if (data[4].startsWith("-")) {
                    $(row).find('td:eq(4)').css("background-color", "rgba(0, 0, 0, 0.2)");
                } else {
                    $(row).find('td:eq(4)').addClass('dash-board-link');
                    if (data[4].startsWith("P")) {
                        $(row).find('td:eq(4)').addClass('bg-warning');
                    } else if (data[4].startsWith("A")) {
                        $(row).find('td:eq(4)').css("background-color", "rgba(92, 250, 92, 1)");
                    } else if (data[4].startsWith("F")) {
                        $(row).find('td:eq(4)').addClass('bg-danger');
                    } else if (data[4].startsWith("R")) {
                        $(row).find('td:eq(4)').css("background-color", "rgba(153, 102, 51, 1)");
                    } else if (data[4].startsWith("L1")) {
                        $(row).find('td:eq(4)').addClass('bg-primary');
                    } else if (data[4].startsWith("L2")) {
                        $(row).find('td:eq(4)').addClass('bg-info');
                    }
                    $(row).find('td:eq(4)').bind('click', () => {
                        if (data[4].startsWith("A")) {
                            restartElement = $(row).find('td:eq(4)');
                            restart_id_user = data[0];
                            showResetForm(data[0], data[1], data[4], "act");
                        }
                    });
                }
                if (data[5].startsWith("-")) {
                    $(row).find('td:eq(5)').css("background-color", "rgba(0, 0, 0, 0.2)");
                } else {
                    $(row).find('td:eq(5)').addClass('dash-board-link');
                    if (data[5].startsWith("P")) {
                        $(row).find('td:eq(5)').addClass('bg-warning');
                    } else if (data[5].startsWith("A")) {
                        $(row).find('td:eq(5)').css("background-color", "rgba(92, 250, 92, 1)");
                    } else if (data[5].startsWith("F")) {
                        $(row).find('td:eq(5)').addClass('bg-danger');
                    } else if (data[5].startsWith("R")) {
                        $(row).find('td:eq(5)').css("background-color", "rgba(153, 102, 51, 1)");
                    } else if (data[5].startsWith("L1")) {
                        $(row).find('td:eq(5)').addClass('bg-primary');
                    } else if (data[5].startsWith("L2")) {
                        $(row).find('td:eq(5)').addClass('bg-info');
                    }
                    $(row).find('td:eq(5)').bind('click', () => {
                        if (data[5].startsWith("A")) {
                            restartElement = $(row).find('td:eq(5)');
                            restart_id_user = data[0];
                            showResetForm(data[0], data[1], data[5], "tag");
                        }
                    });
                }
                if (data[6].startsWith("-")) {
                    $(row).find('td:eq(6)').css("background-color", "rgba(0, 0, 0, 0.2)");
                } else {
                    $(row).find('td:eq(6)').addClass('dash-board-link');
                    if (data[6].startsWith("P")) {
                        $(row).find('td:eq(6)').addClass('bg-warning');
                    } else if (data[6].startsWith("A")) {
                        $(row).find('td:eq(6)').css("background-color", "rgba(92, 250, 92, 1)");
                    } else if (data[6].startsWith("F")) {
                        $(row).find('td:eq(6)').addClass('bg-danger');
                    } else if (data[6].startsWith("R")) {
                        $(row).find('td:eq(6)').css("background-color", "rgba(153, 102, 51, 1)");
                    } else if (data[6].startsWith("L1")) {
                        $(row).find('td:eq(6)').addClass('bg-primary');
                    } else if (data[6].startsWith("L2")) {
                        $(row).find('td:eq(6)').addClass('bg-info');
                    }
                    $(row).find('td:eq(6)').bind('click', () => {
                        if (data[6].startsWith("A")) {
                            restartElement = $(row).find('td:eq(6)');
                            restart_id_user = data[0];
                            showResetForm(data[0], data[1], data[6], "forecast");
                        }
                    });
                }
                var a = data[7].split(/[^0-9]/);
                var insDate = new Date(a[0], a[1] - 1, a[2], a[3], a[4]);
                if (data[7] != "-") {
                    if (sub5min > insDate) {
                        $(row).find('td:eq(7)').addClass('bg-warning');
                        $(row).find('td:eq(8)').addClass('bg-warning');
                    }
                }
                $(row).find('td:eq(8)').addClass('text-center');
                if ((data[9] / day2data) <= 0.98) {
                    $(row).find('td:eq(9)').addClass('bg-warning');
                }
                if ((data[10] / day3data) <= 0.98) {
                    $(row).find('td:eq(10)').addClass('bg-warning');
                }
                if (data[11] > 99999) {
                    $(row).find('td:eq(11)').html('99999');
                }
                if (data[12] > 99999) {
                    $(row).find('td:eq(12)').html('99999');
                }
                if (data[13] > 99999) {
                    $(row).find('td:eq(13)').html('99999');
                }
                if (data[14] > 99999) {
                    $(row).find('td:eq(14)').html('99999');
                }
                if (data[15] > 99999) {
                    $(row).find('td:eq(15)').html('99999');
                }
                if (data[16] > 99999) {
                    $(row).find('td:eq(16)').html('99999');
                }
            }, // createRow: end
            drawCallback: function (settings) {
                $('[data-toggle="tooltip"]').tooltip({
                    html: true
                });
            },
        }).columns.adjust(); // $('#dashboardTable').DataTable() end
    }); // document.ready() end
}

// ページボタン生成
function createPageButton() {
    setListLengthLabel(pageNum, userListLength);
    var buttonNodes = footerNode.getElementsByTagName("div")[0];
    // 初期化
    while (buttonNodes.firstChild) {
        buttonNodes.removeChild(buttonNodes.firstChild);
    }
    // let addpage = Math.ceil((userListLength / 20));
    for (let i = 0; i < Math.ceil(userListLength / 20); i++) {
        var button = document.createElement("button");
        button.classList.add("m-1")
        button.textContent = i + 1;
        if (i == 0) {
            button.disabled = true;
        }
        buttonNodes.appendChild(button);
    }
    buttonNodes.childNodes.forEach(element => {
        element.addEventListener("click", () => {
            pageNum = element.textContent;
            changePage();
        });
    });
}


function createTableData(dataList, columns) {
    console.log(dataList)
    var talbeDataSets = [];
    id_user_list = [];
    dataList.forEach(element => {
        // console.log("createTableData:", element)
        id_user_list.push({ id_user: element.id_user });
        for (let j = 0; j < columns.length; j++) {
            if (!element.hasOwnProperty(columns[j]) || element[columns[j]] == null) {
                element[columns[j]] = "-";
            }
        }
        if (element.input_date != "-") {
            var tempdate = new Date(element.input_date);
            element.input_date = moment.utc(tempdate).format("YYYY-MM-DD HH:mm");
        }

        // act recovery正常
        if (element.input_status_act == "0") {
            element.input_status_act = "-";
        } else if (element.input_status_act == "1") {
            element.input_status_act = "P";
        } else if (element.input_status_act == "2") {
            element.input_status_act = "A";
        } else if (element.input_status_act == "-1") {
            element.input_status_act = "L1";
        } else if (element.input_status_act == "-2") {
            element.input_status_act = "L2";
        }

        if (element.recovery_status_act) {
            if (element.recovery_status_act == "1") {
                // recovery中
                element.input_status_act = "R";
            } else {
                // recovery失敗
                element.input_status_act = "F";
            }
        }

        // tag recovery正常
        if (element.input_status_tag == "0") {
            element.input_status_tag = "-";
        } else if (element.input_status_tag == "1") {
            element.input_status_tag = "P";
        } else if (element.input_status_tag == "2") {
            element.input_status_tag = "A";
        } else if (element.input_status_tag == "-1") {
            element.input_status_tag = "L1";
        } else if (element.input_status_tag == "-2") {
            element.input_status_tag = "L2";
        }

        if (element.recovery_status_tag) {
            if (element.recovery_status_tag == "1") {
                // recovery中
                element.input_status_tag = "R";
            } else {
                // recovery失敗
                element.input_status_tag = "F";
            }
        }

        // forecast recovery正常
        if (element.input_status_forecast == "0") {
            element.input_status_forecast = "-";
        } else if (element.input_status_forecast == "1") {
            element.input_status_forecast = "P";
        } else if (element.input_status_forecast == "2") {
            element.input_status_forecast = "A";
        } else if (element.input_status_forecast == "-1") {
            element.input_status_forecast = "L1";
        } else if (element.input_status_forecast == "-2") {
            element.input_status_forecast = "L2";
        }

        if (element.recovery_status_forecast) {
            if (element.recovery_status_forecast == "1") {
                // recovery中
                element.input_status_forecast = "R";
            } else {
                // recovery失敗
                element.input_status_forecast = "F";
            }
        }
        element.id_user = {
            id_user: element.id_user,
            status: true
        };
        if (element.input_status_act.startsWith("-") || element.input_status_act.startsWith("F")) {
            if (element.input_status_tag.startsWith("-") || element.input_status_tag.startsWith("F")) {
                if (element.input_status_forecast.startsWith("-") || element.input_status_forecast.startsWith("F")) {
                    element.id_user.status = false;
                }
            }
        }

        if (element.user_status_act === undefined || !element.user_status_act){
            element.user_status_act = "";
        }
        if (element.user_status_tag === undefined || !element.user_status_tag){
            element.user_status_tag = "";
        }
        if (element.user_status_forecast === undefined || !element.user_status_forecast){
            element.user_status_forecast = "";
        }
        element.input_status_act += "<br/>" + element.user_status_act;
        element.input_status_tag += "<br/>" + element.user_status_tag;
        element.input_status_forecast += "<br/>" + element.user_status_forecast;

        var tempTableData = [];
        for (let j = 0; j < columns.length; j++) {
            tempTableData[j] = element[columns[j]];
        }
        talbeDataSets.push(tempTableData);
    });
    // console.log(talbeDataSets);
    return talbeDataSets;
}

// (1 to 20 of 100 entries)を表示
function setListLengthLabel(page, entries) {
    var end = page * 20;
    var start = end - 19;
    if (end > entries) {
        end = entries;
    }
    footerNode.childNodes[1].innerText = start + " to " + end + " of " + entries + " entries";
}


// popup window
function showUserDetail(id_user) {
    var pop = window.open("about:blank", "content", "width=1000,height=550");
    // 開発環境用
    pop.location.href = "http://localhost:3000/main?id_user=" + id_user;
    /* pop.location.href = "http://nialmweb2test-env.eba-z32wrmys.us-east-2.elasticbeanstalk.com/main?id_user=" + id_user; */
    return false;
}
/* pop.location.href = "http://nialmweb.us-east-2.elasticbeanstalk.com/main?id_user=" + id_user; */


// reset form
function showResetForm(id_user_obj, remarks, status, service) {
    var id_user = id_user_obj.id_user;
    $('.restart-modal-head').html("user : " + id_user + "</br>remarks : " + remarks + "</br>service : " + service);
    if (status.startsWith("R")) {
        $('#restart_cancel_modal').modal("show");
    } else {
        $('#date_input').val(moment(new Date()).utcOffset("+09:00").format('YYYY-MM-DD HH:mm'));
        $('#restart_modal').modal("show");
    }
}

function changePage() {
    document.getElementById("table_spin").style.display = "block";
    document.getElementById("table_content").style.display = "none";
    document.getElementById("load_all_data").disabled = false;
    document.getElementById("load_first_data").disabled = true;
    document.getElementById("load_additional_data").disabled = false;
    start = new Date().getTime();
    // console.log(pageNum)

    $.ajax({
        url: '/dashboardMain/data',
        data: {
            page: pageNum,
        },
        success: function (json) {
            document.getElementById("refresh_data").value = "1";
            // console.log(json);
            table.destroy();
            $('#dashboardTable').empty();
            createTable(json.dataList, document.getElementById("refresh_data").value);
            setListLengthLabel(pageNum, userListLength);
            footerNode.getElementsByTagName("div")[0].childNodes.forEach(element => {
                if (element.textContent == pageNum) {
                    element.disabled = true;
                } else {
                    element.disabled = false;
                }
            });
            document.getElementById("table_spin").style.display = "none";
            document.getElementById("table_content").style.display = "block";

            var end = new Date().getTime();
            console.log(end - start);
        },
    });
}

var pageNum = 1;
var table;
var userListLength;

var start = new Date().getTime();

// 最初のロード
function firstLoad() {
    document.getElementById("table_spin").style.display = "block";
    document.getElementById("table_content").style.display = "none";
    $.ajax({
        url: '/dashboardMain/data',
        data: {
            page: pageNum,
        },
        success: function (json) {
            // console.log(json);
            userListLength = json.count;
            createPageButton();
            if (table) {
                table.destroy();
                $('#dashboardTable').empty();
            }
            createTable(json.dataList, 1);
            document.getElementById("table_spin").style.display = "none";
            document.getElementById("table_content").style.display = "block";
            // データはJSTだがWEBAPPではUTCで認識してしまうため強制的に-9時間する

            let processed_time = moment(new Date(json.processed_time)).utcOffset("+00:00").format('MM-DD HH:mm');
            let now = moment.tz(new Date(), "Asia/Tokyo").subtract(10, 'minutes').format('MM-DD HH:mm');

            if (json.processed_time != 0) {
                document.getElementById("processed_time").innerHTML = "batch event time : " + processed_time;
            }
            if (processed_time < now) {
                document.getElementById("processed_time").style.backgroundColor = "red";
            } else {
                document.getElementById("processed_time").style.backgroundColor = "green";
            }
            var end = new Date().getTime();
            console.log(end - start);
        }
    });
}

function refreshData() {
    if (id_user_list.length == 0) {
        return false;
    }
    start = new Date().getTime();

    document.getElementById("table_spin").style.display = "block";
    document.getElementById("table_content").style.display = "none";
    var mode = document.getElementById("refresh_data").value;
    var url;
    if (mode == 1) {
        url = "/dashboardMain/data";
    } else if (mode == 2) {
        url = "/dashboardMain/additionalData"
    } else {
        url = "/dashboardMain/allData"
    }
    $.ajax({
        url: url,
        data: {
            page: pageNum,
            id_user_list: id_user_list
        },
        success: function (json) {
            // console.log(json);
            table.destroy();
            if (mode != 3) {
                createTable(json.dataList, mode);
            } else {
                createFullTable(json.dataList);
            }
            document.getElementById("table_spin").style.display = "none";
            document.getElementById("table_content").style.display = "block";

            let processed_time = moment(new Date(json.processed_time)).utcOffset("+00:00").format('MM-DD HH:mm');
            let now = moment.tz(new Date(), "Asia/Tokyo").subtract(10, 'minutes').format('MM-DD HH:mm');

            if (json.processed_time != 0) {
                document.getElementById("processed_time").innerHTML = "batch event time : " + processed_time;
            }
            if (processed_time < now) {
                document.getElementById("processed_time").style.backgroundColor = "red";
            } else {
                document.getElementById("processed_time").style.backgroundColor = "green";
            }

            var end = new Date().getTime();
            console.log(end - start);
        }
    });
}


// restart cancel
document.getElementById("restart_cancel_button").addEventListener("click", () => {
    let restartInfo = $('.restart-modal-head').html().split("<br>");
    let id_user = restartInfo[0].split(":")[1].trim();
    let service = restartInfo[2].split(":")[1].trim();
    $.ajax({
        url: '/dashboardMain/restartCancel',
        data: {
            id_user: id_user,
            service: service,
        },
        success: function (json) {
            if (json.data.err) {
                alert("DB error");
            }
            // console.log(json);
            if (json.data.affectedRows == 0) {
                // 削除失敗
                $('.restart-modal-head').html("recoveryが既に実行されているため</br>キャンセルできませんでした")
                $('#restart_cancel_result_modal').modal("show");
            } else {
                // 削除成功
                let row = restartElement[0]._DT_CellIndex.row;
                let column = restartElement[0]._DT_CellIndex.column;
                let status;
                if (column == 3) {
                    status = json.data[0].input_status_act;
                } else if (column == 4) {
                    status = json.data[0].input_status_tag;
                } else {
                    status = json.data[0].input_status_forecast;
                }
                if (status == 1) {
                    status = "P";
                    restartElement[0].className = "bg-warning";
                } else if (status == 2) {
                    status = "A";
                    restartElement[0].style.backgroundColor = "rgba(92, 250, 92, 1)";
                }
                table.cell(row, column).data(status).draw();
                $('.restart-modal-head').html("キャンセルしました");
                $('#restart_cancel_result_modal').modal("show");
            }
        }
    });
});

// restart確認
document.getElementById("restart_button").addEventListener("click", () => {
    $('#restart_confirm_modal_head').html($('.restart-modal-head').html() +
        "</br>" + $('#date_input').val() + "</br>restartを実行します");
    $('#restart_confirm_modal').modal("show");
});

// restart実行
document.getElementById("restart_confirm_button").addEventListener("click", () => {
    let restartInfo = $('#restart_confirm_modal_head').html().split("<br>");
    let id_user = restartInfo[0].split(":")[1].trim();
    let remarks = restartInfo[1].split(":")[1].trim();
    let service = restartInfo[2].split(":")[1].trim();
    let date = restartInfo[3].trim();
    $.ajax({
        url: '/dashboardMain/restart',
        data: {
            id_user: id_user,
            remarks: remarks,
            service: service,
            date: date
        },
        success: function (json) {
            if (json.data.err) {
                alert("DB error");
            }
            let row = restartElement[0]._DT_CellIndex.row;
            let column = restartElement[0]._DT_CellIndex.column;

            table.cell(row, column).data("R").draw();
            restartElement[0].className = "";
            restartElement[0].style.backgroundColor = "rgb(153, 102, 51)";
        },
    });
});


// ユーザ検索
document.getElementById("search_user_button").addEventListener("click", () => {
    if (document.getElementById("search_user").value == "") {
        return false;
    }
    document.getElementById("table_spin").style.display = "block";
    document.getElementById("table_content").style.display = "none";
    document.getElementById("search_user_all_button").style.display = "none";
    document.getElementById("search_service").children[0].checked = false;
    document.getElementById("search_service").children[1].checked = false;
    document.getElementById("search_service").children[2].checked = false;
    $.ajax({
        url: '/dashboardMain/search',
        data: {
            keyword: document.getElementById("search_user").value,
        },
        success: function (json) {
            // console.log(json.dataList);
            userListLength = json.dataList.length;
            createPageButton();
            table.destroy();
            $('#dashboardTable').empty();
            document.getElementById("refresh_data").value = 1;
            createTable(json.dataList, 1);
            document.getElementById("search_user").value = ""
            document.getElementById("table_spin").style.display = "none";
            document.getElementById("table_content").style.display = "block";
            document.getElementById("search_user_all_button").style.display = "block";
            document.getElementById("load_first_data").disabled = true;
            document.getElementById("load_additional_data").disabled = false;
            document.getElementById("load_all_data").disabled = false;
        }
    });
});

// 全てユーザ表示
document.getElementById("search_user_all_button").addEventListener("click", () => {
    firstLoad();
    document.getElementById("search_user").value = "";
    document.getElementById("search_user_all_button").style.display = "none";
    document.getElementById("search_service").children[0].checked = false;
    document.getElementById("search_service").children[1].checked = false;
    document.getElementById("search_service").children[2].checked = false;
    document.getElementById("load_first_data").disabled = true;
    document.getElementById("load_additional_data").disabled = false;
    document.getElementById("load_all_data").disabled = false;
});

// service別検索
document.getElementById("search_service_button").addEventListener("click", () => {
    var isActChecked = document.getElementById("search_service").children[0].checked;
    var isTagChecked = document.getElementById("search_service").children[1].checked;
    var isForeChecked = document.getElementById("search_service").children[2].checked;
    if (!isActChecked && !isTagChecked && !isForeChecked) {
        return false;
    }
    document.getElementById("table_spin").style.display = "block";
    document.getElementById("table_content").style.display = "none";
    document.getElementById("search_user_all_button").style.display = "none";
    $.ajax({
        url: '/dashboardMain/searchService',
        data: {
            isActChecked: isActChecked,
            isTagChecked: isTagChecked,
            isForeChecked: isForeChecked
        },
        success: function (json) {
            // console.log(json.dataList);
            userListLength = json.dataList.length;
            createPageButton();
            table.destroy();
            $('#dashboardTable').empty();
            document.getElementById("refresh_data").value = 1;
            createTable(json.dataList, 1);
            document.getElementById("table_spin").style.display = "none";
            document.getElementById("table_content").style.display = "block";
            document.getElementById("search_user_all_button").style.display = "block";
            document.getElementById("load_first_data").disabled = true;
            document.getElementById("load_additional_data").disabled = false;
            document.getElementById("load_all_data").disabled = false;
        }
    });
});

// ユーザデータ1ページ表示
document.getElementById("load_first_data").addEventListener("click", () => {

    if (id_user_list.length == 0) {
        return false;
    }
    start = new Date().getTime();

    document.getElementById("refresh_data").value = "1";
    document.getElementById("table_spin").style.display = "block";
    document.getElementById("table_content").style.display = "none";
    document.getElementById("load_first_data").disabled = true;
    document.getElementById("load_additional_data").disabled = false;
    document.getElementById("load_all_data").disabled = false;

    $.ajax({
        url: '/dashboardMain/data',
        data: {
            page: pageNum,
            id_user_list: id_user_list
        },
        success: function (json) {
            // console.log(json);
            table.destroy();
            $('#dashboardTable').empty();
            document.getElementById("refresh_data").value = 1;
            createTable(json.dataList, document.getElementById("refresh_data").value);
            document.getElementById("table_spin").style.display = "none";
            document.getElementById("table_content").style.display = "block";

            var end = new Date().getTime();
            console.log(end - start);
        }
    });
});

// ユーザデータ2ページ表示
document.getElementById("load_additional_data").addEventListener("click", () => {

    if (id_user_list.length == 0) {
        return false;
    }
    start = new Date().getTime();

    document.getElementById("refresh_data").value = "2";
    document.getElementById("table_spin").style.display = "block";
    document.getElementById("table_content").style.display = "none";
    document.getElementById("load_first_data").disabled = false;
    document.getElementById("load_additional_data").disabled = true;
    document.getElementById("load_all_data").disabled = false;
    $.ajax({
        url: '/dashboardMain/additionalData',
        data: {
            page: pageNum,
            id_user_list: id_user_list
        },
        success: function (json) {
            // console.log(json);
            table.destroy();
            $('#dashboardTable').empty();
            createTable(json.dataList, document.getElementById("refresh_data").value);
            document.getElementById("table_spin").style.display = "none";
            document.getElementById("table_content").style.display = "block";

            var end = new Date().getTime();
            console.log(end - start);
        }
    });
});

// refreshボタン
document.getElementById("refresh_data").addEventListener("click", () => {
    refreshData();
});

// full pageボタン
document.getElementById("load_all_data").addEventListener("click", () => {

    if (id_user_list.length == 0) {
        return false;
    }
    start = new Date().getTime();

    document.getElementById("refresh_data").value = "3";
    document.getElementById("table_spin").style.display = "block";
    document.getElementById("table_content").style.display = "none";
    document.getElementById("load_additional_data").disabled = true;
    document.getElementById("load_first_data").disabled = false;
    document.getElementById("load_all_data").disabled = true;
    $.ajax({
        url: "/dashboardMain/allData",
        data: {
            page: pageNum,
            id_user_list: id_user_list
        },
        success: function (json) {
            // console.log(json);
            table.destroy();
            $('#dashboardTable').empty();
            createFullTable(json.dataList);
            document.getElementById("table_spin").style.display = "none";
            document.getElementById("table_content").style.display = "block";

            var end = new Date().getTime();
            console.log(end - start);
        }
    });
});

firstLoad();
// 10分refrersh
timer = setInterval(function () {
    refreshData();
}, 600000);