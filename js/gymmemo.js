(function() {
  var URL, clearItems, create_table_items, create_table_traininngs, db, display_record, editItem, insertItem, insertRecord, insert_item, insert_traininng, printdbg, render, reportError, select_count_items, select_count_traininngs, select_items, select_trainnings, setUser, update, _insertItem;

  URL = 'http://szkshnchr.appspot.com/';

  create_table_items = 'CREATE TABLE IF NOT EXISTS items(id INT, status INT, user TEXT, name TEXT, unit TEXT)';

  create_table_traininngs = 'CREATE TABLE IF NOT EXISTS trainnings(id INT, status INT, user TEXT, item_id INT, value INT, created_at TEXT)';

  db = window.openDatabase("gymmemo", "", "GYMMEMO", 1048576);

  clearItems = function() {
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE items', [], (function(tx, res) {}), function(tx, error) {
        return reportError('sql', error.message);
      });
      return tx.executeSql('DROP TABLE trainnings', [], (function(tx, res) {}), function(tx, error) {
        return reportError('sql', error.message);
      });
    });
    return update();
  };

  insertItem = function() {
    _insertItem($('#itemname').attr('value'), $('#itemunit').attr('value'));
    return $('#itemname').attr('value', '');
  };

  editItem = function() {
    return alert('edit');
  };

  select_count_items = 'SELECT COUNT(*) as cnt FROM items';

  insert_item = 'INSERT INTO items (id, status, user, name, unit) VALUES(?, ?, ?, ?, ?)';

  _insertItem = function(name, unit) {
    return db.transaction(function(tx) {
      return tx.executeSql(select_count_items, [], function(tx, res) {
        return tx.executeSql(insert_item, [res.rows.item(0).cnt + 1, 1, localStorage['user'], name, unit], function(tx, res) {
          return update();
        }, function(tx, error) {
          return reportError('sql', error.message);
        });
      });
    });
  };

  select_count_traininngs = 'SELECT COUNT(*) as cnt FROM trainnings';

  insert_traininng = 'INSERT INTO trainnings (id, status, user, item_id, value, created_at) VALUES(?, ?, ?, ?, ?, ?)';

  insertRecord = function(item_id, value) {
    console.log(value);
    if (!item_id || value === '' || value === '0') return;
    return db.transaction(function(tx) {
      return tx.executeSql(select_count_traininngs, [], function(tx, res) {
        var dt, now;
        dt = new Date();
        now = dt.toISOString();
        return tx.executeSql(insert_traininng, [res.rows.item(0).cnt + 1, 1, localStorage['user'], item_id, value, now], function(tx, res) {
          console.log(res);
          return update();
        }, function(tx, error) {
          return reportError('sql', error.message);
        });
      });
    });
  };

  reportError = function(source, message) {
    return alert(message);
  };

  printdbg = function(text) {
    var dbgswitch;
    dbgswitch = 1;
    if (dbgswitch) return $('#debug').append(text + "<br />");
  };

  select_items = 'SELECT * FROM items WHERE user = ? ORDER BY id DESC';

  render = function() {
    return db.transaction(function(tx) {
      tx.executeSql(create_table_traininngs, []);
      tx.executeSql(create_table_items, []);
      return tx.executeSql(select_items, [localStorage['user']], function(tx, res) {
        var i, id, len, name, str, unit;
        $('#render').empty();
        str = $('<table><tr><th colspan="3" id="itemtitle">トレーニング種目</th></tr></table>');
        len = res.rows.length;
        for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
          id = res.rows.item(i).id;
          name = res.rows.item(i).name;
          unit = res.rows.item(i).unit;
          str.append('<tr><td></td></tr>').find('td:last').attr({
            id: 'item' + id
          }).addClass('itemnamecls').text(name).click(function(id) {
            return alert(id);
          }).end();
          str.find('tr:last').append('<td><input type="number" size="10" /></td>').find('input').attr('id', 'addrecord' + id).attr('class', 'addrecord').end();
          str.find('tr:last').append('<td></td>').find('td:last').text(unit).end();
        }
        return str.appendTo('#render');
      });
    });
  };

  select_trainnings = 'SELECT * FROM trainnings t LEFT JOIN items i ON t.item_id = i.id WHERE t.user = ? ORDER BY id DESC';

  display_record = function() {
    return db.transaction(function(tx) {
      tx.executeSql(create_table_traininngs, []);
      tx.executeSql(create_table_items, []);
      return tx.executeSql(select_trainnings, [localStorage['user']], function(tx, res) {
        var i, len, reg, str, time;
        $('#record').empty();
        str = $('<table><tr><th colspan="3">トレーニング履歴</th></tr></table>');
        len = res.rows.length;
        for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
          reg = /^\d{4}-\d{1,2}-\d{1,2}[\sT](\d{1,2}:\d{1,2}:\d{1,2})/;
          time = reg.exec(res.rows.item(i).created_at);
          str.append('<tr><td></td></tr>').find('td:last').text(res.rows.item(i).name).end();
          str.find('tr:last').append('<td></td>').find('td:last').text(res.rows.item(i).value + res.rows.item(i).unit).end();
          str.find('tr:last').append('<td></td>').find('td:last').text(time[1]).end();
        }
        str.appendTo('#record');
        return $('.addrecord').blur(function(event) {
          var id;
          console.debug($(this).attr('value'));
          id = $(this).attr('id').slice(9, 15);
          return insertRecord(id, $(this).attr('value'));
        });
      });
    });
  };

  update = function() {
    render();
    return display_record();
  };

  setUser = function() {
    console.log('setUser');
    $.ajax('/user_info', {
      type: 'GET',
      success: function(data, status, xhr) {
        console.log('success');
        return localStorage['user'] = data;
      },
      error: function(data, status, xhr) {
        console.log('error');
        return location.href = URL + 'hoge';
      }
    });
    return console.log('setUser end');
  };

  $(function() {
    setUser();
    update();
    $('#itemadd').click(insertItem);
    return $('.itemmenu').click(function() {
      $('.itemmenu').toggle();
      return $('#item').toggle();
    });
  });

}).call(this);
