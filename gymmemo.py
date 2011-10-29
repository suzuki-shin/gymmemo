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
# RequestHandler
#
class RecordTrainningAction(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        items = Item.all().filter('status =', True).filter('user =', user).fetch(100)
        path = os.path.join(os.path.dirname(__file__), 'record.html')
        self.response.out.write(template.render(path, {'items': items, 'disps':Item.display}))

    def post(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        # logging.info(self.request.POST.items())
        for key, value in self.request.POST.items():
            if not (key and value): continue

            item = Item.get(key)
            trainning = Trainning(
                user   = user,
                item   = item,
                value  = int(value),
            )
            trainning.put()
        self.redirect('/')

class ListTrainningAction(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        days = Trainning.get_days(user)
        path = os.path.join(os.path.dirname(__file__), 'list.html')
        self.response.out.write(template.render(path, {'days': days}))

class ViewTrainningAction(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        trainnings = Trainning.get_list_at(user, self.request.get('created'))
        path = os.path.join(os.path.dirname(__file__), 'view.html')
        self.response.out.write(template.render(path, {'trainnings': trainnings}))

class SetConfigAction(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        items = Item.all().filter('user =', user).fetch(100)

        path = os.path.join(os.path.dirname(__file__), 'config.html')
        self.response.out.write(template.render(path, {'items': items}))

class AddItemAction(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        path = os.path.join(os.path.dirname(__file__), 'add_item.html')
        self.response.out.write(template.render(path, {'disps':Item.display}))

    def post(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        item = Item(
            user = user,
            name = self.request.get('name'),
            unit = self.request.get('unit'),
        )
        item.put()
        self.redirect('/config')

application = webapp.WSGIApplication(
    [('/', RecordTrainningAction),
     ('/list', ListTrainningAction),
     ('/view', ViewTrainningAction),
     ('/config', SetConfigAction),
     ('/add_item', AddItemAction),
    ],
    debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
