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

if __name__ == '__main__':
    unittest.main()  


#rv = client.get('/jyutping/我哋盪失咗')
#print(rv.data)

#url_base = "http://localhost:5000"
#url = "{}/jyutping/我哋盪失咗".format(url_base)
#response = requests.get(url)
#print(json.loads(response.content)["jyutping"])
