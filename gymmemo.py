# -*- coding: utf-8 -*-

DEVELOPER_MAIL = "shinichiro.su@gmail.com"

import os
# import pickle
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
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

class RecordTrainningAction(SsRequestHandler):
    @login_required
    def get(self):
        items = Item.all().filter('status =', True).filter('user =', self.user).fetch(100)
        path = os.path.join(os.path.dirname(__file__), 'record.html')
        self.response.out.write(template.render(path, {'items': items, 'disps':Item.display}))

    @login_required
    def post(self):
        for key, value in self.request.POST.items():
            if not (key and value): continue

            item = Item.get(key)
            trainning = Trainning(
                user   = self.user,
                item   = item,
                value  = int(value),
            )
            trainning.put()
        self.redirect('/')

class ListTrainningAction(SsRequestHandler):
    @login_required
    def get(self):
        days = Trainning.get_days(self.user)
        path = os.path.join(os.path.dirname(__file__), 'list.html')
        self.response.out.write(template.render(path, {'days': days}))

class ViewTrainningAction(SsRequestHandler):
    @login_required
    def get(self):
        trainnings = Trainning.get_list_at(self.user, self.request.get('created'))
        path = os.path.join(os.path.dirname(__file__), 'view.html')
        self.response.out.write(template.render(path, {'trainnings': trainnings}))

class SetConfigAction(SsRequestHandler):
    @login_required
    def get(self):
        items = Item.all().filter('user =', self.user).fetch(100)
        path = os.path.join(os.path.dirname(__file__), 'config.html')
        self.response.out.write(template.render(path, {'items': items}))

class AddItemAction(SsRequestHandler):
    @login_required
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'add_item.html')
        self.response.out.write(template.render(path, {'disps':Item.display}))

    @login_required
    def post(self):
        item = Item(
            user = self.user,
            name = self.request.get('name'),
            unit = self.request.get('unit'),
        )
        item.put()
        self.redirect('/config')

class DebugAction(SsRequestHandler):
    @login_required
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'debug.html')
        self.response.out.write(template.render(path, {}))

class TruncateAction(SsRequestHandler):
    @login_required
    def get(self):
        items = Item.all().fetch(100)
        for i in items:
            i.delete()
        trainnings = Trainning.all().fetch(100)
        for t in trainnings:
            t.delete()

        self.redirect('/config')

class TestAction(SsRequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'test.html')
        self.response.out.write(template.render(path, {}))

application = webapp.WSGIApplication(
    [('/', IndexAction),
     ('/record', RecordTrainningAction),
     ('/list', ListTrainningAction),
     ('/view', ViewTrainningAction),
     ('/config', SetConfigAction),
     ('/add_item', AddItemAction),
     ('/debug', DebugAction),
     ('/truncate', TruncateAction),
     ('/test', TestAction),
    ],
    debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
