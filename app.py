#!/usr/bin/env python3

from flask import Flask, request
from flask_restful import Resource, Api, inputs
import json
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
        
class Batch(Resource):
    def post(self):
        print(request.form)
        conversion_type = request.form.get('conversion')
        #tone_numbers = request.form['tone_numbers']
        tone_numbers = inputs.boolean(request.form.get('tone_numbers'))
        #tone_numbers=False
        entry_list = request.form.getlist('entries')
        
        print(tone_numbers)

        if conversion_type == 'pinyin':
            conversion_function = pinyin_jyutping_sentence.pinyin
        elif conversion_type == 'jyutping':
            conversion_function = pinyin_jyutping_sentence.jyutping
        else:
            return {'status': 'error', 'description': 'incorrect conversion argument: ' + conversion_type}

        result_list = [conversion_function(x, tone_numbers=tone_numbers) for x in entry_list]
        #print(result_list)
        return {'result':result_list},200


api.add_resource(Jyutping, '/jyutping/<chinese>')
api.add_resource(Pinyin, '/pinyin/<chinese>')
api.add_resource(Batch, '/batch')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')