// var URL = 'http://szkshnchr.appspot.com/';
var URL = 'http://localhost:8080/';
var create_table_items = 'CREATE TABLE IF NOT EXISTS items(id INT, status INT, user TEXT, name TEXT, unit TEXT)';
var create_table_traininngs = 'CREATE TABLE IF NOT EXISTS trainnings(id INT, status INT, user TEXT, item_id INT, value INT, created_at TEXT)';

var db = window.openDatabase("gymmemo","","GYMMEMO", 1048576);

function clearItems() {
//     console.log('clearItems');
    db.transaction(function(tx) {
        tx.executeSql('DROP TABLE items',[],
                      function(tx,res){}, function(tx,error) {
                          reportError('sql',error.message);
                      });
        tx.executeSql('DROP TABLE trainnings',[],
                      function(tx,res){}, function(tx,error) {
                          reportError('sql',error.message);
                      });
    });
    update();
}

var insertItem = function () {
//     console.log('insertItem');
    _insertItem( $('#itemname').attr('value'), $('#itemunit').attr('value') );
    $('#itemname').attr('value', '');
};

function _insertItem(name, unit) {
//     console.log('_insertItem');
    db.transaction(function(tx) {
        tx.executeSql('SELECT COUNT(*) as cnt FROM items', [], function(tx, res) {
            var lastId = res.rows.item(0).cnt;
            tx.executeSql('INSERT INTO items (id, status, user, name, unit) VALUES(?, ?, ?, ?, ?)',
                          [lastId + 1, 1, localStorage['user'], name, unit],
                          function(tx, res) {
                              console.log(res);
                              update();
                          },
                          function(tx, error) {
                              reportError('sql', error.message);
                          });
        });
    });
}

function insertRecord(item_id, value) {
//     console.log('insertRecord');
    if (!item_id || !value) { return; }

    db.transaction(function(tx) {
        tx.executeSql('SELECT COUNT(*) as cnt FROM trainnings', [], function(tx, res) {
            var lastId = res.rows.item(0).cnt;
            var dt = new Date();
            var now = dt.toISOString();

            tx.executeSql('INSERT INTO trainnings (id, status, user, item_id, value, created_at) VALUES(?, ?, ?, ?, ?, ?)',
                          [lastId + 1, 1, localStorage['user'], item_id, value, now],
                          function(tx, res) {
                              console.log(res);
                              update();
                          },
                          function(tx, error) {
                              reportError('sql', error.message);
                          });
        });
    });
}

function reportError(source, message) {
    alert(message);
}

function printdbg(text){
    var dbgswitch = 1;
    if (dbgswitch) {
        $('#debug').append(text + "<br />");
    }
}

var render = function() {
//     console.log('render');
    db.transaction(function(tx) {
        tx.executeSql(create_table_traininngs,[]);
        tx.executeSql(create_table_items,[]);
        tx.executeSql('SELECT * FROM items WHERE user = ? ORDER BY id DESC',
                      [localStorage['user']], function(tx, res) {
            $('#render').empty();
            var str =  $('<table><tr><th>トレーニング種目</th></tr></table>');
            var len = res.rows.length;
            for(var i=0; i<len; i++) {
                var id = res.rows.item(i).id;
                var name = res.rows.item(i).name;
                var unit = res.rows.item(i).unit;
                str.append('<tr><td></td></tr>').find('td:last').attr('id', 'item'+id).text(name).end();
                str.find('tr:last').append('<td><input type="text" size="10" /></td>').find('input').attr('id', 'addrecord'+id).attr('class', 'addrecord').end();
                str.find('tr:last').append('<td></td>').find('td:last').text(unit).end();
            }
            str.appendTo('#render');
        });
    });
};

var display_record = function() {
//     console.log('display_record');
//     console.log('user:'+ localStorage['user']);
    db.transaction(function(tx) {
        tx.executeSql(create_table_traininngs,[]);
        tx.executeSql(create_table_items,[]);
        tx.executeSql('SELECT * FROM trainnings t LEFT JOIN items i ON t.item_id = i.id WHERE t.user = ? ORDER BY id DESC',
                      [localStorage['user']], function(tx, res) {
                          $('#record').empty();
                          var str =  $('<table><tr><th>トレーニング履歴</th></tr></table>');
                          var len = res.rows.length;
                          for(var i=0; i<len; i++) {
                              var reg = /^\d{4}-\d{1,2}-\d{1,2}[\sT](\d{1,2}:\d{1,2}:\d{1,2})/;
                              var time = reg.exec(res.rows.item(i).created_at);
                              //                 console.debug(time);
                              str.append('<tr><td></td></tr>').find('td:last').text(res.rows.item(i).name).end();
                              str.find('tr:last').append('<td></td>').find('td:last').text(res.rows.item(i).value + res.rows.item(i).unit).end();
                              str.find('tr:last').append('<td></td>').find('td:last').text(time[1]).end();
                          }
                          str.appendTo('#record');
                          $('.addrecord').blur(function (event) {
                              console.debug($(this).attr('value'));
                              var id = $(this).attr('id').slice(9,15);
                              insertRecord(id, $(this).attr('value'));
                          });
                      });
    });
};

var update  = function () {
//     console.log('update');
    render();
    display_record();
};

var setUser = function () {
    console.log('setUser');
    $.ajax('/user_info', {
        type: 'GET',
        success: function(data, status, xhr) {
            console.log('success');
            localStorage['user'] = data;
        },
        error: function(data, status, xhr) {
            console.log('error');
            location.href = URL + 'hoge';
        }
    });
    console.log('setUser end');
};

$(function () {
    setUser();
    update();

    $('.itemmenu').click(function(){
        $('.itemmenu').toggle();
        $('#item').toggle();
    });

    $('#itemadd').click(insertItem);

});
