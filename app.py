#!/usr/bin/env python3

from flask import Flask, request
from flask_restful import Resource, Api, inputs
import json
import functools
import pinyin_jyutping_sentence


app = Flask(__name__)
api = Api(app)

class Jyutping(Resource):
    def get(self, chinese):
        romanization = pinyin_jyutping_sentence.jyutping(chinese)
        return {'jyutping': romanization}
        
class Pinyin(Resource):
    def get(self, chinese):
        romanization = pinyin_jyutping_sentence.pinyin(chinese)
        return {'pinyin': romanization}
        
@functools.lru_cache(maxsize=10000)        
def perform_conversion(input, conversion_type, tone_numbers, spaces):
    if len(input) == 0:
        return ""

    if conversion_type == 'pinyin':
        conversion_function = pinyin_jyutping_sentence.pinyin
    elif conversion_type == 'jyutping':
        conversion_function = pinyin_jyutping_sentence.jyutping    
    return conversion_function(input, tone_numbers=tone_numbers, spaces=spaces)


class Batch(Resource):
    def post(self):
        BATCH_MAX_ENTRIES = 1000

        data = request.json
        if 'conversion' not in data:
            return {'status': 'error', 'description': 'missing conversion argument'}, 400
        if 'tone_numbers' not in data:
            return {'status': 'error', 'description': 'missing tone_numbers argument'}, 400            
        if 'spaces' not in data:
            return {'status': 'error', 'description': 'missing spaces argument'}, 400
        if 'entries' not in data:
            return {'status': 'error', 'description': 'missing entries argument'}, 400
        conversion_type = data['conversion']
        tone_numbers = data['tone_numbers']
        spaces = data['spaces']
        entry_list = data['entries']

        # print(f"conversion_type: {conversion_type} entries: {entry_list}")

        if conversion_type != 'pinyin' and conversion_type != 'jyutping':
            return {'status': 'error', 'description': 'incorrect conversion argument: ' + conversion_type}, 400

        if len(entry_list) > BATCH_MAX_ENTRIES:
            return {'status': 'error', 'description': "max number of entries is 1000"}, 400


        result_list = [perform_conversion(x, conversion_type, tone_numbers, spaces) for x in entry_list]
        #print(result_list)
        return {'result':result_list},200


api.add_resource(Jyutping, '/jyutping/<chinese>')
api.add_resource(Pinyin, '/pinyin/<chinese>')
api.add_resource(Batch, '/batch')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')