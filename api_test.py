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
            'spaces': False,
            'entries' : [
                '忘拿一些东西了',
                '没有什么',
                '提高口语'
            ]
        }
        expected_result = {'result': ['wàng ná yīxiē dōngxi le', 'méiyǒu shénme', 'tígāo kǒuyǔ']}
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        self.assertEqual(actual_result, expected_result)

    def test_batch_pinyin_spaces(self):
        data = {
            'conversion': 'pinyin',
            'tone_numbers': False,
            'spaces': True,
            'entries' : [
                '忘拿一些东西了',
                '没有什么',
                '提高口语'
            ]
        }
        expected_result = {'result': ['wàng ná yī xiē dōng xi le', 'méi yǒu shén me', 'tí gāo kǒu yǔ']}
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        self.assertEqual(actual_result, expected_result)        

    def test_batch_pinyin_tone_numbers(self):
        data = {
            'conversion': 'pinyin',
            'tone_numbers': True,
            'spaces': False,
            'entries' : [
                '忘拿一些东西了',
                '没有什么',
                '提高口语'
            ]
        }
        expected_result = {'result': ['wang4 na2 yi1xie1 dong1xi5 le5', 'mei2you3 shen2me5', 'ti2gao1 kou3yu3']}
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        self.assertEqual(actual_result, expected_result)

    def test_batch_jyutping(self):
        data = {
            'conversion': 'jyutping',
            'tone_numbers': False,
            'spaces': False,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        expected_result = {'result': ['ngǒ cēothêoi ló jěsik', 'jǎu dī hôu gwâi']}
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        #print(actual_result)
        self.assertEqual(actual_result, expected_result)

    def test_batch_jyutping(self):
        data = {
            'conversion': 'jyutping',
            'tone_numbers': False,
            'spaces': False,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        expected_result = {'result': ['ngǒ cēothêoi ló jěsik', 'jǎu dī hôu gwâi']}
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        #print(actual_result)
        self.assertEqual(actual_result, expected_result)        

    def test_batch_jyutping_tone_numbers(self):
        data = {
            'conversion': 'jyutping',
            'tone_numbers': True,
            'spaces': False,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        expected_result = {'result': ['ngo5 ceot1heoi3 lo2 je5sik6', 'jau5 di1 hou3 gwai3']}
        response = self.client.post('/batch', json=data)
        self.assertEqual(response.status_code, 200)
        actual_result = json.loads(response.data)
        #print(actual_result)
        self.assertEqual(actual_result, expected_result)                

    def test_batch_jyutping_tone_numbers_spaces(self):
        data = {
            'conversion': 'jyutping',
            'tone_numbers': True,
            'spaces': True,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        expected_result = {'result': ['ngo5 ceot1 heoi3 lo2 je5 sik6', 'jau5 di1 hou3 gwai3']}
        response = self.client.post('/batch', json=data)
        self.assertEqual(response.status_code, 200)
        actual_result = json.loads(response.data)
        self.assertEqual(actual_result, expected_result)                        

    def test_batch_errors(self):
        data = {
            #'conversion': 'jyutping',
            'tone_numbers': True,
            'spaces': True,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(actual_result, {'description': 'missing conversion argument', 'status': 'error'})

        # missing tone_numbers
        data = {
            'conversion': 'jyutping',
            #'tone_numbers': True,
            'spaces': True,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(actual_result, {'description': 'missing tone_numbers argument', 'status': 'error'})        

        # missing spaces
        data = {
            'conversion': 'jyutping',
            'tone_numbers': True,
            #'spaces': True,
            'entries' : [
                '我出去攞野食',
                '有啲好貴'
            ]
        }
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(actual_result, {'description': 'missing spaces argument', 'status': 'error'})                

        # missing entries
        data = {
            'conversion': 'jyutping',
            'tone_numbers': True,
            'spaces': True
        }
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(actual_result, {'description': 'missing entries argument', 'status': 'error'})                

        # too many entries
        many_entries = []
        for i in range(0, 1100):
            many_entries.append('我出去攞野食')
        data = {
            'conversion': 'jyutping',
            'tone_numbers': True,
            'spaces': True,
            'entries': many_entries
        }
        response = self.client.post('/batch', json=data)
        actual_result = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(actual_result, {'description': 'max number of entries is 1000', 'status': 'error'})                        

if __name__ == '__main__':
    unittest.main()  


#rv = client.get('/jyutping/我哋盪失咗')
#print(rv.data)

#url_base = "http://localhost:5000"
#url = "{}/jyutping/我哋盪失咗".format(url_base)
#response = requests.get(url)
#print(json.loads(response.content)["jyutping"])
