(function() {
  var createTableItems, createTableRecords, createTables, create_table_items, create_table_records, db, dropTableItems, dropTableRecords, getYYYYMMDD, insertItem, insertRecord, insert_item, insert_record, renderItems, renderPastRecordsDate, renderRecordByDate, renderRecords, reportError, saveOnServer, select_count_items, select_count_records, select_items, select_items_unsaved, select_records, select_records_by_date, select_records_date, select_records_unsaved, setUser, wrapHtmlList, _insertItem, _insertRecord, _renderItems, _renderPastRecordsDate, _renderRecords, _res2Date, _res2NameValues;

  create_table_items = 'CREATE TABLE IF NOT EXISTS items (id INT, status INT, user TEXT, name TEXT, attr TEXT, is_saved INT DEFAULT 0)';

  create_table_records = 'CREATE TABLE IF NOT EXISTS records (id INT, status INT, user TEXT, item_id INT, value INT, created_at TEXT, is_saved INT DEFAULT 0)';

  select_items = 'SELECT * FROM items WHERE user = ? AND status = ? ORDER BY id DESC';

  select_count_items = 'SELECT COUNT(*) as cnt FROM items';

  insert_item = 'INSERT INTO items (id, status, user, name, attr) VALUES (?, ?, ?, ?, ?)';

  select_records = 'SELECT * FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ? ORDER BY r.id DESC LIMIT 10';

  select_records_date = 'SELECT created_at FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ? GROUP BY r.created_at ORDER BY r.id LIMIT 10';

  select_records_by_date = 'SELECT * FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ? AND r.created_at = ? ORDER BY r.id DESC';

  insert_record = 'INSERT INTO records (id, status, user, item_id, value, created_at) VALUES (?, ?, ?, ?, ?, ?)';

  select_count_records = 'SELECT COUNT(*) as cnt FROM records';

  select_items_unsaved = 'SELECT id, status, user, name, attr, is_saved FROM items WHERE user = ? AND is_saved = 0 ORDER BY id DESC';

  select_records_unsaved = 'SELECT * FROM records WHERE user = ? AND is_saved = 0 ORDER BY id DESC';

  db = window.openDatabase("gymmemo", "", "GYMMEMO", 1048576);

  dropTableItems = function() {
    return db.transaction(function(tx) {
      return tx.executeSql('DROP TABLE items', []);
    });
  };

  createTableItems = function() {
    return db.transaction(function(tx) {
      return tx.executeSql(create_table_items, []);
    });
  };

  dropTableRecords = function() {
    return db.transaction(function(tx) {
      return tx.executeSql('DROP TABLE records', []);
    });
  };

  createTableRecords = function() {
    return db.transaction(function(tx) {
      return tx.executeSql(create_table_records, []);
    });
  };

  wrapHtmlList = function(list, tag) {
    var l, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      l = list[_i];
      _results.push('<' + tag + '>' + l + '</' + tag + '>');
    }
    return _results;
  };

  renderItems = function() {
    return db.transaction(_renderItems, reportError);
  };

  _renderItems = function(tx) {
    var _res2inputElems;
    _res2inputElems = function(res) {
      var i, len, _results;
      len = res.rows.length;
      _results = [];
      for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
        _results.push(res.rows.item(i).name + '<input type="number" id="item' + res.rows.item(i).id + '" size="3" />' + res.rows.item(i).attr);
      }
      return _results;
    };
    return tx.executeSql(select_items, [localStorage['user'], 1], function(tx, res) {
      return $('#itemlist').empty().append(wrapHtmlList(_res2inputElems(res), 'li').join(''));
    }, reportError);
  };

  renderRecords = function() {
    return db.transaction(_renderRecords, reportError);
  };

  _renderRecords = function(tx) {
    return tx.executeSql(select_records_by_date, [localStorage['user'], 1, getYYYYMMDD()], function(tx, res) {
      return $('#recordlist').empty().append(wrapHtmlList(_res2NameValues(res), 'li').join(''));
    }, reportError);
  };

  _res2NameValues = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push(res.rows.item(i).name + ' ' + res.rows.item(i).value + res.rows.item(i).attr);
    }
    return _results;
  };

  _res2Date = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push(res.rows.item(i).created_at);
    }
    return _results;
  };

  renderPastRecordsDate = function() {
    return db.transaction(_renderPastRecordsDate, reportError);
  };

  _renderPastRecordsDate = function(tx) {
    console.log('_renderPastRecordsDate');
    console.log(localStorage['user']);
    return tx.executeSql(select_records_date, [localStorage['user'], 1], function(tx, res) {
      $('#recordsubtitle').text('');
      return $('#pastrecordlist').empty().append(wrapHtmlList(_res2Date(res), 'li').join(''));
    }, reportError);
  };

  renderRecordByDate = function(event) {
    var date, _renderRecordByDate;
    date = event.target.textContent;
    console.log(date);
    _renderRecordByDate = function(tx) {
      console.log('_renderRecordByDate');
      console.log(localStorage['user']);
      console.log(date);
      return tx.executeSql(select_records_by_date, [localStorage['user'], 1, date], function(tx, res) {
        $('#recordsubtitle').text(date);
        return $('#pastrecordlist').empty().append(wrapHtmlList(_res2NameValues(res), 'li').join(''));
      }, reportError);
    };
    return db.transaction(_renderRecordByDate, reportError);
  };

  insertItem = function(ev) {
    if (!$('#itemname').attr('value')) return;
    _insertItem(localStorage['user'], $('#itemname').attr('value'), $('#itemattr').attr('value'));
    $('#itemname').attr('value', '');
    $('#itemattr').attr('value', '');
    renderItems();
    return false;
  };

  _insertItem = function(user, name, attr) {
    return db.transaction(function(tx) {
      return tx.executeSql(select_count_items, [], function(tx, res) {
        return tx.executeSql(insert_item, [res.rows.item(0).cnt + 1, 1, user, name, attr], function(tx, res) {
          return console.log(res);
        }, function(tx, error) {
          return reportError('sql', error.message);
        });
      });
    });
  };

  insertRecord = function(ev) {
    var item_id;
    if (!ev.target.value) return;
    item_id = ev.target.id.slice(4, 8);
    _insertRecord(localStorage['user'], item_id, ev.target.value, getYYYYMMDD());
    $(ev.target).attr('value', '');
    renderRecords();
    return false;
  };

  _insertRecord = function(user, item_id, value, created_at) {
    return db.transaction(function(tx) {
      return tx.executeSql(select_count_records, [], function(tx, res) {
        return tx.executeSql(insert_record, [res.rows.item(0).cnt + 1, 1, user, item_id, value, created_at], function(tx, res) {
          return console.log(res);
        }, reportError);
      });
    });
  };

  getYYYYMMDD = function() {
    var dd, dt, mm, yyyy;
    dt = new Date();
    yyyy = dt.getFullYear();
    mm = dt.getMonth() + 1;
    dd = dt.getDate();
    return yyyy + '/' + mm + '/' + dd;
  };

  setUser = function() {
    return $.ajax('/user_info', {
      type: 'GET',
      success: function(data, status, xhr) {
        return localStorage['user'] = data;
      },
      error: function(data, status, xhr) {
        return location.href = URL + 'hoge';
      }
    });
  };

  reportError = function(source, message) {
    console.trace();
    return console.log(message);
  };

  createTables = function() {
    createTableItems();
    return createTableRecords();
  };

  saveOnServer = function() {
    db.transaction(function(tx) {
      return tx.executeSql(select_items_unsaved, [localStorage['user']], function(tx, res) {
        var data, i, len;
        len = res.rows.length;
        data = (function() {
          var _results;
          _results = [];
          for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
            _results.push(res.rows.item(i));
          }
          return _results;
        })();
        return $.ajax({
          type: 'POST',
          url: '/save_item',
          data: JSON.stringify(data),
          success: function() {
            return console.log('save items success');
          }
        });
      }, reportError);
    });
    return false;
  };

  $(function() {
    createTables();
    setUser();
    renderItems();
    renderRecords();
    renderPastRecordsDate();
    $('#itemstitle').click(function() {
      return $('#itemadd').toggle();
    });
    $('#itemadd button').click(insertItem);
    $(document).delegate('#itemlist li input', 'change', insertRecord);
    $('#pastrecordstitle').click(renderPastRecordsDate);
    $(document).delegate('#pastrecordlist li', 'click', renderRecordByDate);
    $('#clear').click(function() {
      dropTableItems();
      return dropTableRecords();
    });
    $('#create').click(function() {
      createTableItems();
      return createTableRecords();
    });
    return $('#debug').click(function() {
      return $('#clear').toggle();
    });
  });

}).call(this);
