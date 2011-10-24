# -*- coding: utf-8 -*-

DEVELOPER_MAIL = "shinichiro.su@gmail.com"

import os
# import pickle
from datetime import datetime
from time import strptime
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
        self.response.out.write(template.render(path, {'items': items}))

    def post(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        for key, value in self.request.POST.items():
            if not (key and value): continue

            item = Item.get(key)
            trainning = Trainning(
                user = user,
                item = item,
                value = int(value),
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

        created = self.request.get('created')
        logging.info(created)
        trainnings = Trainning.all().filter('user =', user)
        trainnings.filter('created >=', datetime(*strptime(created + ' 00:00:00', '%Y-%m-%d %H:%M:%S')[0:6]))
        trainnings.filter('created <=', datetime(*strptime(created + ' 23:59:59', '%Y-%m-%d %H:%M:%S')[0:6]))
        trainnings.filter('status =', True)

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

    def post(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        weight  = self.request.get('weight')
        fat     = self.request.get('fat')
        muscle  = self.request.get('muscle')
        aerobic = self.request.get('aerobic')

        trainning = Trainning(
            user    = user,
            weight  = float(weight) if weight else None,
            fat     = float(fat) if fat else None,
            muscle  = int(muscle) if muscle else None,
            aerobic = int(aerobic) if aerobic else None,
        )
        trainning.put()
        self.redirect('/')

class AddItemAction(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        path = os.path.join(os.path.dirname(__file__), 'add_item.html')
        self.response.out.write(template.render(path, {}))

    def post(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))

        item = Item(
            user      = user,
            name      = self.request.get('name'),
            unit_name = self.request.get('unit_name')
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
