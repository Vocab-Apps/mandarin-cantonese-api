import unittest
import json
from app import app

class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        super(ApiTests, cls).setUpClass()
        cls.client = app.test_client()

    def test_pinyin(self):
        source = '忘拿一些东西了'
        expected_result = {'pinyin':'wàng ná yīxiē dōngxi le'}
        response = self.client.get('/pinyin/' + source)
        actual_result = json.loads(response.data) 
        print(actual_result)
        self.assertEqual(actual_result, expected_result)

    def test_batch_pinyin(self):
        data = {
            'conversion': 'pinyin',
            'tone_numbers': False,
            'entries' : [
                '忘拿一些东西了',
                '没有什么',
                '提高口语'
            ]
        }
        expected_result = {'result': ['wàng ná yīxiē dōngxi le', 'méiyǒu shénme', 'tígāo kǒuyǔ']}
        response = self.client.post('/batch', json=json.dumps(data))
        actual_result = json.loads(response.data)
        self.assertEqual(actual_result, expected_result)

    def test_batch_pinyin_tone_numbers(self):
        data = {
            'conversion': 'pinyin',
            'tone_numbers': True,
            'entries' : [
                '忘拿一些东西了',
                '没有什么',
                '提高口语'
            ]
        }
        expected_result = {'result': ['wang4 na2 yi1xie1 dong1xi5 le5', 'mei2you3 shen2me5', 'ti2gao1 kou3yu3']}
        response = self.client.post('/batch', json=json.dumps(data))
        actual_result = json.loads(response.data)
        self.assertEqual(actual_result, expected_result)

    def test_batch_jyutping(self):
        data = {
            'conversion': 'jyutping',
            'tone_numbers': False,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        expected_result = {'result': ['ngǒ cēothêoi ló jěsik', 'jǎu dī hôu gwâi']}
        response = self.client.post('/batch', json=json.dumps(data))
        actual_result = json.loads(response.data)
        #print(actual_result)
        self.assertEqual(actual_result, expected_result)

    def test_batch_jyutping(self):
        data = {
            'conversion': 'jyutping',
            'tone_numbers': False,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        expected_result = {'result': ['ngǒ cēothêoi ló jěsik', 'jǎu dī hôu gwâi']}
        response = self.client.post('/batch', json=json.dumps(data))
        actual_result = json.loads(response.data)
        #print(actual_result)
        self.assertEqual(actual_result, expected_result)        

    def test_batch_jyutping_tone_numbers(self):
        data = {
            'conversion': 'jyutping',
            'tone_numbers': True,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        expected_result = {'result': ['ngo5 ceot1heoi3 lo2 je5sik6', 'jau5 di1 hou3 gwai3']}
        response = self.client.post('/batch', json=json.dumps(data))
        actual_result = json.loads(response.data)
        #print(actual_result)
        self.assertEqual(actual_result, expected_result)                

if __name__ == '__main__':
    unittest.main()  


#rv = client.get('/jyutping/我哋盪失咗')
#print(rv.data)

#url_base = "http://localhost:5000"
#url = "{}/jyutping/我哋盪失咗".format(url_base)
#response = requests.get(url)
#print(json.loads(response.content)["jyutping"])
