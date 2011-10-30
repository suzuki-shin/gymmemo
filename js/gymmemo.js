var create_table_items = 'CREATE TABLE IF NOT EXISTS Items(status INT, user TEXT, name TEXT, unit TEXT)';

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
        tx.executeSql(create_table_items,[]);
        tx.executeSql('SELECT * FROM Items', [], function(tx, res) {
            var str = '<table border="1"><tr><th>トレーニング種目</th></tr>';
            var len = res.rows.length;
            printdbg('row length: '+len);
 console.log(res.rows);
            for(var i=0; i<len; i++) {
                str += '<tr><td>' + res.rows.item(i).name + '</td><td>' + res.rows.item(i).unit + '</td> </tr>';
            }
            str += '</table>';
            renderItems(str);
        });
    });
}

function renderItems(str) {
    document.getElementById('render').innerHTML = str;
}

function insertItem(name, unit) {
    var user = 'shinichiro.su@gmail.com';
    db.transaction(function(tx) {
        tx.executeSql('INSERT INTO Items VALUES(?, ?, ?,?)', [1, user, name, unit],
                      function(tx, res) {
                          update();
                      },
                      function(tx, error) {
                          reportError('sql', error.message);
                      });
    });
}

function reportError(source, message) {
    alert(message);
}

function update() {
    var region = document.getElementById('render');
    printdbg('udpate start');
    render(region);

    var ti = document.getElementById('name');
    ti.value = '';
    ti.focus();
}

function printdbg(text){
    var dbgswitch = 1;
    if (dbgswitch) {
        var dbg = document.getElementById('debug');
        if (dbg)
            dbg.innerText += text + "\n";
    }
}
