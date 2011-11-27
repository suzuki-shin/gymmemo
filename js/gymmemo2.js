(function() {
  var createTableItems, createTableRecords, create_table_items, create_table_records, db, dropTableItems, dropTableRecords, insertItem, insertRecord, insert_item, insert_record, renderItems, renderRecords, reportError, select_count_items, select_count_records, select_items, select_records, setUser, wrapHtmlList, _insertItem, _insertRecord, _renderItems, _renderRecords;

  create_table_items = 'CREATE TABLE IF NOT EXISTS items (id INT, status INT, user TEXT, name TEXT, attr1 TEXT, attr2 TEXT)';

  create_table_records = 'CREATE TABLE IF NOT EXISTS records (id INT, status INT, user TEXT, item_id INT, value1 INT, value2 INT, created_at TEXT)';

  select_items = 'SELECT * FROM items WHERE user = ? AND status = ?';

  select_count_items = 'SELECT COUNT(*) as cnt FROM items';

  insert_item = 'INSERT INTO items (id, status, user, name, attr1, attr2) VALUES (?, ?, ?, ?, ?, ?)';

  select_records = 'SELECT * FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ?';

  insert_record = 'INSERT INTO records (id, status, user, item_id, value1, value2) VALUES (?, ?, ?, ?, ?, ?)';

  select_count_records = 'SELECT COUNT(*) as cnt FROM records';

  db = window.openDatabase("gymmemo", "", "GYMMEMO", 1048576);

  dropTableItems = function() {
    console.trace();
    return db.transaction(function(tx) {
      return tx.executeSql('DROP TABLE items', [], function() {
        return alert('error: dropTableItems');
      }, function() {
        return alert('success: dropTableItems');
      });
    });
  };

  createTableItems = function() {
    console.trace();
    return db.transaction(function(tx) {
      return tx.executeSql(create_table_items, [], function() {
        return alert('error: createTableItems');
      }, function() {
        return alert('success: createTableItems');
      });
    });
  };

  dropTableRecords = function() {
    console.trace();
    return db.transaction(function(tx) {
      return tx.executeSql('DROP TABLE records', [], function() {
        return alert('error: dropTableRecords');
      }, function() {
        return alert('success: dropTableRecords');
      });
    });
  };

  createTableRecords = function() {
    console.trace();
    return db.transaction(function(tx) {
      return tx.executeSql(create_table_records, [], function() {
        return alert('error: createTableRecords');
      }, function() {
        return alert('success: createTableRecords');
      });
    });
  };

  wrapHtmlList = function(list, tag) {
    var l, _i, _len, _results;
    console.log(list);
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      l = list[_i];
      _results.push('<' + tag + '>' + l + '</' + tag + '>');
    }
    return _results;
  };

  renderItems = function() {
    console.log('renderItems');
    return db.transaction(_renderItems, reportError);
  };

  _renderItems = function(tx) {
    var _res2inputElems;
    console.log('_renderItems');
    _res2inputElems = function(res) {
      var i, len, _results;
      len = res.rows.length;
      _results = [];
      for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
        _results.push(res.rows.item(i).name + '<input type="text" id="item' + res.rows.item(i).id + '" size=5" />' + res.rows.item(i).id);
      }
      return _results;
    };
    return tx.executeSql(select_items, [localStorage['user'], 1], function(tx, res) {
      return $('#itemlist').empty().append(wrapHtmlList(_res2inputElems(res), 'li').join(''));
    }, reportError);
  };

  renderRecords = function() {
    console.log('renderRecords');
    return db.transaction(_renderRecords, reportError);
  };

  _renderRecords = function(tx) {
    var _res2NameValues;
    console.log('_renderRecords');
    console.log(localStorage['user']);
    _res2NameValues = function(res) {
      var i, len, _results;
      len = res.rows.length;
      _results = [];
      for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
        _results.push(res.rows.item(i).name + ' ' + res.rows.item(i).value1 + res.rows.item(i).attr1);
      }
      return _results;
    };
    return tx.executeSql(select_records, [localStorage['user'], 1], function(tx, res) {
      var len;
      len = res.rows.length;
      return $('#recordlist').empty().append(wrapHtmlList(_res2NameValues(res), 'li').join(''));
    }, reportError);
  };

  insertItem = function() {
    _insertItem(localStorage['user'], $('#itemname').attr('value'), $('#itemattr1').attr('value'), $('#itemattr2').attr('value'));
    renderItems();
    return false;
  };

  _insertItem = function(user, name, attr1, attr2) {
    console.log('user:' + user);
    console.log('name:' + name);
    console.log('attr1:' + attr1);
    console.log('attr2:' + attr2);
    return db.transaction(function(tx) {
      return tx.executeSql(select_count_items, [], function(tx, res) {
        console.log(res);
        return tx.executeSql(insert_item, [res.rows.item(0).cnt + 1, 1, user, name, attr1, attr2], function(tx, res) {
          return console.log(res);
        }, function(tx, error) {
          return reportError('sql', error.message);
        });
      });
    });
  };

  insertRecord = function(ev) {
    var item_id;
    item_id = ev.target.id.slice(4, 8);
    _insertRecord(localStorage['user'], item_id, ev.target.value, null);
    renderRecords();
    return false;
  };

  _insertRecord = function(user, item_id, value1, value2) {
    return db.transaction(function(tx) {
      return tx.executeSql(select_count_records, [], function(tx, res) {
        console.log(res);
        return tx.executeSql(insert_record, [res.rows.item(0).cnt + 1, 1, user, item_id, value1, value2], function(tx, res) {
          return console.log(res);
        }, reportError);
      });
    });
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

  reportError = function(source, message) {
    console.trace();
    return alert(message);
  };

  $(function() {
    setUser();
    renderItems();
    renderRecords();
    $('#itemstitle').click(function() {
      return $('#itemadd').toggle();
    });
    $('#itemadd button').click(insertItem);
    $(document).delegate('#itemlist li input', 'change', insertRecord);
    $('#clear').click(function() {
      dropTableItems();
      return dropTableRecords();
    });
    return $('#create').click(function() {
      createTableItems();
      return createTableRecords();
    });
  });

}).call(this);
