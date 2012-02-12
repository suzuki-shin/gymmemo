(function() {
  var ASC, DB_VERSION, DESC, URL, checkDBversion, createTableConfigs, createTableItems, createTableRecords, createTables, create_table_configs, create_table_items, create_table_records, db, debugSelectItems, debugSelectRecords, dropTableItems, dropTableRecords, getYYYYMMDD, insertItem, insertRecord, insert_config, insert_item, insert_record, renderItems, renderPastRecordsDate, renderRecordByDate, renderRecords, reportError, saveOnServer, select_count_items, select_count_records, select_items, select_items_unsaved, select_records, select_records_by_date, select_records_date, select_records_unsaved, setUser, update_items_unsaved, update_records_unsaved, wrapHtmlList, _insertConfig, _insertItem, _insertRecord, _renderItems, _renderPastRecordsDate, _renderRecords, _res2Date, _res2ItemAll, _res2NameValues, _res2RecordAll;

  URL = 'http://gymm3mo.appspot.com/';

  DB_VERSION = 1;

  DESC = 1;

  ASC = 0;

  create_table_configs = 'CREATE TABLE IF NOT EXISTS configs (user TEXT, db_version INT DEFAULT 0, todays_record_order INT DEFAULT 1, past_record_order INT DEFAULT 1)';

  create_table_items = 'CREATE TABLE IF NOT EXISTS items (id INT, status INT, user TEXT, name TEXT, attr TEXT, is_saved INT DEFAULT 0)';

  create_table_records = 'CREATE TABLE IF NOT EXISTS records (id INT, status INT, user TEXT, item_id INT, value INT, created_at TEXT, is_saved INT DEFAULT 0)';

  insert_config = 'INSERT INTO configs (user) VALUES (?)';

  select_items = 'SELECT * FROM items WHERE user = ? AND status = ? ORDER BY id DESC';

  select_count_items = 'SELECT COUNT(*) as cnt FROM items';

  insert_item = 'INSERT INTO items (id, status, user, name, attr) VALUES (?, ?, ?, ?, ?)';

  select_records = 'SELECT * FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ? ORDER BY r.id DESC LIMIT 10';

  select_records_date = 'SELECT created_at FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ? GROUP BY r.created_at ORDER BY r.created_at DESC LIMIT 10';

  select_records_by_date = 'SELECT * FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ? AND r.created_at = ? ORDER BY r.id DESC';

  insert_record = 'INSERT INTO records (id, status, user, item_id, value, created_at) VALUES (?, ?, ?, ?, ?, ?)';

  select_count_records = 'SELECT COUNT(*) as cnt FROM records';

  select_items_unsaved = 'SELECT id, status, user, name, attr, is_saved FROM items WHERE user = ? AND is_saved = 0 ORDER BY id DESC';

  update_items_unsaved = 'UPDATE items SET is_saved = 1 WHERE user = ? AND is_saved = 0';

  select_records_unsaved = 'SELECT * FROM records WHERE user = ? AND is_saved = 0 ORDER BY id DESC';

  update_records_unsaved = 'UPDATE records SET is_saved = 1 WHERE user = ? AND is_saved = 0';

  db = window.openDatabase("gymmemo", "", "GYMMEMO", 1048576);

  createTableConfigs = function(tx) {
    console.log('createTableConfigs');
    return tx.executeSql(create_table_configs, [], _insertConfig);
  };

  _insertConfig = function(tx, res) {
    console.log('_insertConfig');
    return tx.executeSql(insert_config, [localStorage['user']], function(tx, res) {
      return '';
    }, reportError);
  };

  dropTableItems = function() {
    if (!confirm('itemsテーブルをdropして良いですか？')) return;
    return db.transaction(function(tx) {
      return tx.executeSql('DROP TABLE items', [], function() {
        return alert('error: dropTableItems');
      }, function() {
        return alert('success: dropTableItems');
      });
    });
  };

  createTableItems = function(tx) {
    return tx.executeSql(create_table_items, []);
  };

  dropTableRecords = function() {
    if (!confirm('recordsテーブルをdropして良いですか？')) return;
    alert('iii');
    return db.transaction(function(tx) {
      return tx.executeSql('DROP TABLE records', [], function() {
        return alert('error: dropTableRecords');
      }, function() {
        return alert('success: dropTableRecords');
      });
    });
  };

  createTableRecords = function(tx) {
    return tx.executeSql(create_table_records, []);
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
      _results.push('<span>' + res.rows.item(i).created_at + '</span>');
    }
    return _results;
  };

  _res2ItemAll = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push(res.rows.item(i).id + ' ' + res.rows.item(i).name + ' ' + res.rows.item(i).user + ' ' + res.rows.item(i).attr + ' ' + res.rows.item(i).is_saved);
    }
    return _results;
  };

  _res2RecordAll = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push(res.rows.item(i).id + ' ' + res.rows.item(i).user + ' ' + res.rows.item(i).item_id + ' ' + res.rows.item(i).value + ' ' + res.rows.item(i).created_at + ' ' + res.rows.item(i).is_saved);
    }
    return _results;
  };

  renderPastRecordsDate = function() {
    return db.transaction(_renderPastRecordsDate, reportError);
  };

  _renderPastRecordsDate = function(tx) {
    return tx.executeSql(select_records_date, [localStorage['user'], 1], function(tx, res) {
      $('#recordsubtitle').text('');
      return $('#pastrecordlist').empty().append(wrapHtmlList(_res2Date(res), 'li').join(''));
    }, reportError);
  };

  renderRecordByDate = function(event) {
    var date, _renderRecordByDate;
    date = event.target.textContent;
    _renderRecordByDate = function(tx) {
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
          return '';
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
          return '';
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
      error: function(data, status, xhr) {}
    });
  };

  reportError = function(source, message) {
    console.trace();
    return console.log(message);
  };

  createTables = function() {
    console.log('createTables');
    return db.transaction(function(tx) {
      createTableConfigs(tx);
      createTableItems(tx);
      return createTableRecords(tx);
    });
  };

  debugSelectItems = function() {
    return db.transaction(function(tx) {
      return tx.executeSql('select * from items', [], function(tx, res) {
        return $('#showdb').append(wrapHtmlList(_res2ItemAll(res), 'li').join(''));
      });
    });
  };

  debugSelectRecords = function() {
    return db.transaction(function(tx) {
      return tx.executeSql('select * from records', [], function(tx, res) {
        return $('#showdb').append(wrapHtmlList(_res2RecordAll(res), 'li').join(''));
      });
    });
  };

  saveOnServer = function() {
    var _saveItems, _saveRecords, _updateSavedItem, _updateSavedRecord;
    console.log('saveOnServer');
    _updateSavedItem = function() {
      console.log('_updateSavedItem');
      return db.transaction(function(tx) {
        return tx.executeSql(update_items_unsaved, [localStorage['user']], function() {
          return console.log('success _updateSavedItem');
        });
      });
    };
    _updateSavedRecord = function() {
      console.log('_updateSavedRecord');
      return db.transaction(function(tx) {
        return tx.executeSql(update_records_unsaved, [localStorage['user']], function() {
          return console.log('success _updateSavedRecord');
        });
      });
    };
    _saveRecords = function(tx) {
      console.log("_saveRecords");
      return tx.executeSql(select_records_unsaved, [localStorage['user']], function(tx, res) {
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
          url: '/save_record',
          data: JSON.stringify(data),
          success: _updateSavedRecord
        });
      });
    };
    _saveItems = function(tx, res) {
      var data, i, len;
      console.log('_saveItems');
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
        success: _updateSavedItem
      });
    };
    db.transaction(function(tx) {
      return tx.executeSql(select_items_unsaved, [localStorage['user']], function(tx, res) {
        _saveItems(tx, res);
        return _saveRecords(tx);
      }, reportError);
    });
    return false;
  };

  checkDBversion = function(last_db_version) {
    var _updateSchema;
    console.log('checkDBversion');
    db.transaction(function(tx) {
      return tx.executeSql('SELECT db_version FROM configs', [], function(tx, res) {
        var current_db_version;
        current_db_version = res.rows.len > 1 ? res.rows.item(0).db_version : 0;
        while (current_db_version < last_db_version) {
          console.log('current_db_version: ' + current_db_version);
          _updateSchema(tx, current_db_version);
          current_db_version++;
          console.log('current_db_version: ' + current_db_version);
        }
        return console.log(current_db_version + ':' + last_db_version);
      });
    });
    return _updateSchema = function(tx, current_db_version) {
      var _updateSchema1, _updateSchema2;
      console.log('_updateSchema');
      _updateSchema1 = function(tx) {
        var update_db_version;
        console.log('_updateSchema1');
        update_db_version = 'UPDATE configs SET db_version = ?';
        return tx.executeSql(update_db_version, [current_db_version + 1]);
      };
      _updateSchema2 = function(tx) {
        return console.log('_updateSchema2 まだ中身なし');
      };
      switch (current_db_version) {
        case 0:
          console.log('current_db_version: ' + current_db_version);
          _updateSchema1(tx);
          break;
        default:
          console.log('else');
      }
    };
  };

  $(function() {
    setUser();
    createTables();
    checkDBversion(DB_VERSION);
    renderItems();
    renderRecords();
    renderPastRecordsDate();
    $('#itemstitle').click(function() {
      return $('#itemadd').toggle();
    });
    $('#itemadd button').click(insertItem);
    $(document).on('change', '#itemlist li input', insertRecord);
    $('#pastrecordstitle').click(renderPastRecordsDate);
    $(document).on('touchstart', '#pastrecordlist li span', renderRecordByDate);
    $('#clear').click(function() {
      dropTableItems();
      return dropTableRecords();
    });
    $('#create').click(function() {
      createTableItems();
      return createTableRecords();
    });
    $('#showdb').click(function() {
      debugSelectItems();
      return debugSelectRecords();
    });
    $('#debug').click(function() {
      console.log('debug!');
      $('#clear').toggle();
      $('#showdb').toggle();
      return $('#save').toggle();
    });
    $('#save').click(function() {
      return saveOnServer();
    });
    return $('#save2').click(function() {
      return saveOnServer();
    });
  });

}).call(this);
