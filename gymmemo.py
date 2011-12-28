# -*- coding: utf-8 -*-

DEVELOPER_MAIL = "shinichiro.su@gmail.com"

import os
# import pickle
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from django.utils import simplejson as json
import logging
import inspect
#logging.debug(inspect.currentframe().f_lineno)
from model import *
# from google.appengine.api import mail

#
# decorators
#
def login_required(function):
    def _loging_required(arg):
        user = users.get_current_user()
        if not user:
            arg.redirect(users.create_login_url(arg.request.uri))

        arg.user = user
        res = function(arg)
        return res
    return _loging_required

#
# RequestHandler
#
class SsRequestHandler(webapp.RequestHandler):
    pass

class IndexAction(SsRequestHandler):
    @login_required
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, {}))

class SaveItemAction(SsRequestHandler):
    @login_required
    def get(self):
#         path = os.path.join(os.path.dirname(__file__), 'index.html')
        path = os.path.join(os.path.dirname(__file__), 'save.html')
        self.response.out.write(template.render(path, {}))

    @login_required
    def post(self):
        params = self.request.POST.items()
        item_list = eval(params[0][0])
#         logging.info(item_list)

        for i in item_list:
            if not i.get('id'): continue
            if not i.get('user'): continue
            if not i.get('name'): continue
            item_id = int(i['id'])
            items = Item.get_by_item_id(item_id, i['user'])
            if items:
                item = items[0]
                self.redirect('/')
#                 item = items[0]
#                 logging.info(item.__class__)
#                 item(
#                     name = unicode(i['name'], 'utf-8', 'replace'),
#                     attr = unicode(i['attr'], 'utf-8', 'replace'),
#                 )
            else:
                item = Item(
                    user = i['user'],
                    item_id = item_id,
                    name = unicode(i['name'], 'utf-8', 'replace'),
                    attr = unicode(i['attr'], 'utf-8', 'replace'),
                )

            item.put()
        self.redirect('/')

class SaveRecordAction(SsRequestHandler):
    @login_required
    def post(self):
        params = self.request.POST.items()
        logging.info(params)
        record_list = eval(params[0][0])
        logging.info(record_list)
        self.redirect('/')

        for i in record_list:
            if not i.get('id'): continue
            if not i.get('user'): continue
            if not i.get('item_id'): continue
            record_id = int(i['id'])
            records = Record.get_by_record_id(record_id, i['user'])
            if records:
                record = records[0]
                self.redirect('/')
#                 record = records[0]
#                 logging.info(record.__class__)
#                 record(
#                     name = unicode(i['name'], 'utf-8', 'replace'),
#                     attr = unicode(i['attr'], 'utf-8', 'replace'),
#                 )
            else:
                record = Record(
                    user      = i['user'],
                    record_id = record_id,
                    item_id   = int(i['item_id']),
                    value     = int(i['value']),
                )

            record.put()
        self.redirect('/')

class UserInfoAction(SsRequestHandler):
    @login_required
    def get(self):
        self.response.out.write(self.user)

# class DebugAction(SsRequestHandler):
#     @login_required
#     def get(self):
#         path = os.path.join(os.path.dirname(__file__), 'debug.html')
#         self.response.out.write(template.render(path, {}))

# class TruncateAction(SsRequestHandler):
#     @login_required
#     def get(self):
#         items = Item.all().fetch(100)
#         for i in items:
#             i.delete()
#         trainnings = Trainning.all().fetch(100)
#         for t in trainnings:
#             t.delete()

#         self.redirect('/config')

# class TestAction(SsRequestHandler):
#     def get(self):
#         path = os.path.join(os.path.dirname(__file__), 'test.html')
#         self.response.out.write(template.render(path, {}))

application = webapp.WSGIApplication(
    [('/', IndexAction),
     ('/save_item', SaveItemAction),
     ('/save_record', SaveRecordAction),
#      ('/record', RecordTrainningAction),
#      ('/list', ListTrainningAction),
#      ('/view', ViewTrainningAction),
#      ('/config', SetConfigAction),
#      ('/add_item', AddItemAction),
     ('/user_info', UserInfoAction),
#      ('/debug', DebugAction),
#      ('/truncate', TruncateAction),
#      ('/test', TestAction),
    ],
    debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
