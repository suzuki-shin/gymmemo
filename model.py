# -*- coding: utf-8 -*-
# import os
# import random
# import urllib
#import json
# from django.utils import simplejson as json
# import pickle
# from google.appengine.ext.webapp import template
#import cgi
# from google.appengine.api import users
# from google.appengine.ext import webapp
# from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from sets import Set
from datetime import datetime
from time import strptime
# import logging
# import inspect
#logging.debug(inspect.currentframe().f_lineno)

#
# Model
#
class Item(db.Model):
    u"""トレーニング種目
     """
    status    = db.BooleanProperty(default=True)
    created   = db.DateTimeProperty(auto_now_add=True)
    user      = db.UserProperty(required=True)
    name    = db.TextProperty(required=True) # 種目名
    unit    = db.TextProperty(required=True) # 負荷単位名
    display = {'unit': (u'なし', u'kg', u'分')}

class Trainning(db.Model):
    u"""トレーニング記録
    """
    status  = db.BooleanProperty(default=True)
    created = db.DateTimeProperty(auto_now_add=True)
    user    = db.UserProperty(required=True)
    item    = db.ReferenceProperty(Item, required=True)
    value   = db.IntegerProperty()

    @classmethod
    def get_days(cls, user):
        trainnings = cls.all().filter('status =', True).filter('user =', user).fetch(100)
        return Set([t.created.strftime('%Y-%m-%d') for t in trainnings])

    @classmethod
    def get_list_at(cls, user, created):
        trainnings = Trainning.all().filter('user =', user)
        trainnings.filter('created >=', datetime(*strptime(created + ' 00:00:00', '%Y-%m-%d %H:%M:%S')[0:6]))
        trainnings.filter('created <=', datetime(*strptime(created + ' 23:59:59', '%Y-%m-%d %H:%M:%S')[0:6]))
        trainnings.filter('status =', True)
        return trainnings
