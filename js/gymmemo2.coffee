create_table_items = 'CREATE TABLE IF NOT EXISTS items (id INT, status INT, user TEXT, name TEXT, attr1 TEXT, attr2 TEXT)'
create_table_records = 'CREATE TABLE IF NOT EXISTS records (id INT, status INT, user TEXT, item_id INT, value1 INT, value2 INT, created_at TEXT)'
select_items = 'SELECT * FROM items WHERE user = ? AND status = ? ORDER BY id DESC'
select_count_items = 'SELECT COUNT(*) as cnt FROM items'
insert_item = 'INSERT INTO items (id, status, user, name, attr1, attr2) VALUES (?, ?, ?, ?, ?, ?)'
select_records = 'SELECT * FROM records r LEFT JOIN items i ON r.item_id = i.id WHERE r.user = ? AND r.status = ? ORDER BY r.id DESC LIMIT 10'
insert_record = 'INSERT INTO records (id, status, user, item_id, value1, value2) VALUES (?, ?, ?, ?, ?, ?)'
select_count_records = 'SELECT COUNT(*) as cnt FROM records'


db = window.openDatabase "gymmemo","","GYMMEMO", 1048576

dropTableItems =->
    console.trace()
    db.transaction (tx) ->
         tx.executeSql 'DROP TABLE items', [],
         -> alert 'error: dropTableItems',
         -> alert 'success: dropTableItems',

createTableItems =->
    console.trace()
    db.transaction (tx) ->
         tx.executeSql create_table_items, [],
         -> alert 'error: createTableItems',
         -> alert 'success: createTableItems'

dropTableRecords =->
    console.trace()
    db.transaction (tx) ->
         tx.executeSql 'DROP TABLE records', [],
         -> alert 'error: dropTableRecords',
         -> alert 'success: dropTableRecords',

createTableRecords =->
    console.trace()
    db.transaction (tx) ->
         tx.executeSql create_table_records, [],
         -> alert 'error: createTableRecords',
         -> alert 'success: createTableRecords',

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
        (res.rows.item(i).name + '<input type="number" id="item' + res.rows.item(i).id + '" size="3" />' + res.rows.item(i).id for i in [0...len])

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
        (res.rows.item(i).name + ' ' + res.rows.item(i).value1 + res.rows.item(i).attr1 for i in [0...len])

    tx.executeSql select_records, [localStorage['user'], 1],
                  (tx, res) ->
                      len = res.rows.length
                      $('#recordlist').empty()
                                      .append wrapHtmlList(_res2NameValues(res), 'li').join('')
                  reportError

insertItem = (ev) ->
    _insertItem localStorage['user'],
                $('#itemname').attr('value'),
                $('#itemattr1').attr('value'),
                $('#itemattr2').attr('value'),
    $('#itemname').attr('value', '')
    $('#itemattr1').attr('value', '')
    $('#itemattr2').attr('value', '')
    renderItems()
    false

_insertItem = (user, name, attr1, attr2) ->
    console.log 'user:' + user
    console.log 'name:' + name
    console.log 'attr1:' + attr1
    console.log 'attr2:' + attr2
    db.transaction (tx) ->
         tx.executeSql select_count_items, [],
                       (tx, res) ->
                           console.log res
                           tx.executeSql insert_item,
                                         [res.rows.item(0).cnt + 1, 1, user, name, attr1, attr2]
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

_insertRecord = (user, item_id, value1, value2) ->
    db.transaction (tx) ->
         tx.executeSql select_count_records, [],
                       (tx, res) ->
                           console.log res
                           tx.executeSql insert_record,
                                         [res.rows.item(0).cnt + 1, 1, user, item_id, value1, value2]
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
    alert message

$ ->
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
#     $('#debug').click -> console.log _selectItems()
#     $('#debug').click -> _insertItem 'suz', 'name1', 'at1', 'at2'
