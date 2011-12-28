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
import logging
# import inspect
#logging.debug(inspect.currentframe().f_lineno)

#
# Model
#
class Item(db.Model):
    u"""トレーニング種目
     """
    item_id    = db.IntegerProperty(required=True)
    status     = db.BooleanProperty(default=True)
    created_at = db.DateTimeProperty(auto_now_add=True)
    user       = db.EmailProperty(required=True)
    name       = db.TextProperty(required=True) # 種目名
    attr       = db.TextProperty(required=False) # 負荷単位名
    #     is_saved   = db.BooleanProperty(default=True)

    @classmethod
    def get_by_item_id(cls, item_id, user):
        items = cls.all().filter('user =', user).filter('item_id =', item_id).fetch(1)
        logging.info(items)
#         return items[0] if len(items) > 0 else None
        dir(items)
        return items

class Record(db.Model):
    u"""トレーニング記録
    """
    status     = db.BooleanProperty(default=True)
    created_at = db.DateTimeProperty(auto_now_add=True)
    user       = db.EmailProperty(required=True)
    item_id    = db.IntegerProperty(required=True)
    record_id  = db.IntegerProperty(required=True)
    value      = db.IntegerProperty(required=True)
#     is_saved   = db.BooleanProperty(default=True)

    @classmethod
    def get_by_record_id(cls, record_id, user):
        records = cls.all().filter('user =', user).filter('record_id =', record_id).fetch(1)
        logging.info(records)
        return records

#     @classmethod
#     def get_days(cls, user):
#         trainnings = cls.all().filter('status =', True).filter('user =', user).fetch(100)
#         return Set([t.created_at.strftime('%Y-%m-%d') for t in trainnings])

#     @classmethod
#     def get_list_at(cls, user, created_at):
#         trainnings = Trainning.all().filter('user =', user)
#         trainnings.filter('created_at >=', datetime(*strptime(created_at + ' 00:00:00', '%Y-%m-%d %H:%M:%S')[0:6]))
#         trainnings.filter('created_at <=', datetime(*strptime(created_at + ' 23:59:59', '%Y-%m-%d %H:%M:%S')[0:6]))
#         trainnings.filter('status =', True)
#         return trainnings
