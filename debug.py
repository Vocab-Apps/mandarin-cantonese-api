
import requests

url = 'http://localhost:5000/register_email'

response = requests.post(url, json={'email': 'languagetools+development.language_tools.customer-202204027-1@mailc.net'})
print(response)
print(response.json())