create_table_items = 'CREATE TABLE IF NOT EXISTS items (id INT, status INT, user TEXT, name TEXT, attr TEXT, is_saved INT DEFAULT 0)'
create_table_records = 'CREATE TABLE IF NOT EXISTS records (id INT, status INT, user TEXT, item_id INT, value INT, created_at TEXT, is_saved INT DEFAULT 0)'
select_items = 'SELECT * FROM items WHERE user = ? AND status = ? ORDER BY id DESC'
select_count_items = 'SELECT COUNT(*) as cnt FROM items'
insert_item = 'INSERT INTO items (id, status, user, name, attr) VALUES (?, ?, ?, ?, ?)'
select_records = 'SELECT * FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ? ORDER BY r.id DESC LIMIT 10'
insert_record = 'INSERT INTO records (id, status, user, item_id, value) VALUES (?, ?, ?, ?, ?)'
select_count_records = 'SELECT COUNT(*) as cnt FROM records'
select_items_unsaved = 'SELECT id, status, user, name, attr, is_saved FROM items WHERE user = ? AND is_saved = 0 ORDER BY id DESC'
select_records_unsaved = 'SELECT * FROM records WHERE user = ? AND is_saved = 0 ORDER BY id DESC'

db = window.openDatabase "gymmemo","","GYMMEMO", 1048576

dropTableItems =->
    console.trace()
    db.transaction (tx) ->
         tx.executeSql 'DROP TABLE items', [],
#          -> alert 'error: dropTableItems',
#          -> alert 'success: dropTableItems',

createTableItems =->
    console.trace()
    db.transaction (tx) ->
         tx.executeSql create_table_items, [],
#          -> alert 'error: createTableItems',
#          -> alert 'success: createTableItems'

dropTableRecords =->
    console.trace()
    db.transaction (tx) ->
         tx.executeSql 'DROP TABLE records', [],
#          -> alert 'error: dropTableRecords',
#          -> alert 'success: dropTableRecords',

createTableRecords =->
    console.trace()
    db.transaction (tx) ->
         tx.executeSql create_table_records, [],
#          -> alert 'error: createTableRecords',
#          -> alert 'success: createTableRecords',

wrapHtmlList = (list, tag) ->
    console.log list
    ('<' + tag + '>' + l + '</' + tag + '>' for l in list)

renderItems = () ->
    console.log 'renderItems'
    db.transaction _renderItems, reportError

_renderItems = (tx) ->
    console.log('_renderItems')
    _res2inputElems = (res) ->
        len = res.rows.length
        (res.rows.item(i).name + '<input type="number" id="item' + res.rows.item(i).id + '" size="3" />' + res.rows.item(i).attr for i in [0...len])

    tx.executeSql select_items, [localStorage['user'], 1],
                  (tx, res) ->
                      $('#itemlist').empty()
                                    .append wrapHtmlList(_res2inputElems(res), 'li').join('')
                  reportError

renderRecords = () ->
    console.log 'renderRecords'
    db.transaction _renderRecords, reportError

_renderRecords = (tx) ->
    console.log('_renderRecords')
    console.log(localStorage['user'])

    _res2NameValues = (res) ->
        len = res.rows.length
        (res.rows.item(i).name + ' ' + res.rows.item(i).value + res.rows.item(i).attr for i in [0...len])

    tx.executeSql select_records, [localStorage['user'], 1],
                  (tx, res) ->
                      len = res.rows.length
                      $('#recordlist').empty()
                                      .append wrapHtmlList(_res2NameValues(res), 'li').join('')
                  reportError

insertItem = (ev) ->
    if not $('#itemname').attr('value')
        return

    _insertItem localStorage['user'],
                $('#itemname').attr('value'),
                $('#itemattr').attr('value'),
    $('#itemname').attr('value', '')
    $('#itemattr').attr('value', '')
    renderItems()
    false

_insertItem = (user, name, attr) ->
    console.log 'user:' + user
    console.log 'name:' + name
    console.log 'attr:' + attr
    db.transaction (tx) ->
         tx.executeSql select_count_items, [],
                       (tx, res) ->
                           console.log res
                           tx.executeSql insert_item,
                                         [res.rows.item(0).cnt + 1, 1, user, name, attr]
                                         (tx, res) -> console.log res
                                         (tx, error) -> reportError 'sql', error.message

insertRecord = (ev) ->
    if not ev.target.value
        return

    item_id = ev.target.id.slice(4,8)
    _insertRecord localStorage['user'], item_id, ev.target.value, null
    $(ev.target).attr('value', '')
    renderRecords()
    false

_insertRecord = (user, item_id, value) ->
    db.transaction (tx) ->
         tx.executeSql select_count_records, [],
                       (tx, res) ->
                           console.log res
                           tx.executeSql insert_record,
                                         [res.rows.item(0).cnt + 1, 1, user, item_id, value]
                                         (tx, res) -> console.log res
                                         reportError

setUser =->
    console.log('setUser')
    $.ajax '/user_info',
        type: 'GET',
        success: (data, status, xhr) ->
            console.log('success')
            localStorage['user'] = data
        error: (data, status, xhr) ->
            console.log('error')
            location.href = URL + 'hoge'
    console.log('setUser end')

reportError = (source, message) ->
    console.trace()
    console.log message

createTables =->
    createTableItems()
    createTableRecords()

saveOnServer =->
    console.log 'saveOnServer'
    db.transaction (tx) ->
        console.log 'tranx saveOnServer'
        tx.executeSql select_items_unsaved,
                      [localStorage['user']],
                      (tx, res) ->
                          len = res.rows.length
                          data = (res.rows.item(i) for i in [0...len])
                          $.ajax
                              type: 'POST'
                              url: '/save_item'
                              data: JSON.stringify(data)
                              success: -> console.log 'save items success'
                      reportError
    false

$ ->
    createTables()
    setUser()

    # render
    renderItems()
    renderRecords()

    # add event
    $('#itemstitle').click -> $('#itemadd').toggle()
    $('#itemadd button').click insertItem
    $(document).delegate '#itemlist li input', 'change', insertRecord

    # FOR DEBUG
    $('#clear').click ->
        dropTableItems()
        dropTableRecords()
    $('#create').click ->
        createTableItems()
        createTableRecords()
    $('#debug').click ->
        saveOnServer()

