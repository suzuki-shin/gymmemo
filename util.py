# -*- coding: utf-8 -*-
from datetime import datetime

class MyUtil:
    @classmethod
    def get_yyyymmdd_from_created(dt):
        return dt.strftime('%Y-%m-%d')

# dt = datetime.datetime.strptime('2011/10/13 10:12', '%Y/%m/%d %H:%M')
# dt.strftime('%y-%m-%d') # '11-10-13'

if __name__ == "__main__":
 import doctest
 doctest.testmod()

