var create_table_items = 'CREATE TABLE IF NOT EXISTS Items(id INT, status INT, user TEXT, name TEXT, unit TEXT)';
var create_table_traininngs = 'CREATE TABLE IF NOT EXISTS trainnings(id INT, status INT, user TEXT, item_id INT, value INT)';

var db = window.openDatabase("gymmemo","","GYMMEMO", 1048576);

function clearItems() {
    db.transaction(function(tx) {
        tx.executeSql('DROP TABLE Items',[],
                      function(tx,res){}, function(tx,error) {
                          reportError('sql',error.message);
                      });
    });
    update();
}

function render(region) {
    printdbg('render start');

    db.transaction(function(tx) {
        tx.executeSql(create_table_traininngs,[]);
        tx.executeSql(create_table_items,[]);
        tx.executeSql('SELECT * FROM Items', [], function(tx, res) {
            var str = '<table border="1"><tr><th>トレーニング種目</th></tr>';
            var len = res.rows.length;
            for(var i=0; i<len; i++) {
                var rec_id = 'recval' + res.rows.item(i).id;
                str += '<tr><td id="recval' + res.rows.item(i).id + '">' +
                        res.rows.item(i).name + '</td>' +
                        '<td><input id="recval' + res.rows.item(i).id + '" type="text" size="5" /></td>' +
                        '<td>' + res.rows.item(i).unit + '</td>' +
                        '<td id="record" onclick="insertRecord(' +
                        res.rows.item(i).id + ')">登録</td></tr>';
           }
            str += '</table>';
            renderItems(str);
        });
    });
}

function renderItems(str) {
    document.getElementById('render').innerHTML = str;
}

var insertItem = function () {
    _insertItem( $('#itemname').attr('value'), $('#itemunit').attr('value') );
};

function _insertItem(name, unit) {
    console.log(name);
    console.log(unit);
    var user = 'shinichiro.su@gmail.com';
    db.transaction(function(tx) {
        tx.executeSql('SELECT COUNT(*) as cnt FROM items', [], function(tx, res) {
            var lastId = res.rows.item(0).cnt;
            tx.executeSql('INSERT INTO Items (id, status, user, name, unit) VALUES(?, ?, ?, ?, ?)',
                          [lastId + 1, 1, user, name, unit],
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

function insertRecord(item_id) {
    console.log(this);

    var user = 'shinichiro.su@gmail.com';
    db.transaction(function(tx) {
        tx.executeSql('SELECT COUNT(*) as cnt FROM trainnings', [], function(tx, res) {
            var lastId = res.rows.item(0).cnt;
            tx.executeSql('INSERT INTO trainnings (id, status, user, item_id, value) VALUES(?, ?, ?, ?, ?)',
                          [lastId + 1, 1, user, item_id, this.value],
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

function update() {
    var region = $('#render');
    printdbg('udpate start');
    render(region);

    $('#itemname').focus();
}

function printdbg(text){
    var dbgswitch = 1;
    if (dbgswitch) {
        $('#debug').append(text + "<br />");
    }
}

$(function () {
    update();

    $('#itemadd').click(insertItem);
});
