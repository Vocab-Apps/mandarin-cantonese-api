# building the image:
# docker build -t lucwastiaux/mandarin-cantonese-api:v0.2 .
# running the container:
# docker run --name mandarin-cantonese-api -p 9042:8042 --rm lucwastiaux/mandarin-cantonese-api:v0.2
# push to repository
# docker push lucwastiaux/mandarin-cantonese-api:v0.2

FROM python:3.6-alpine

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
RUN pip install gunicorn

COPY app.py start.sh ./
RUN chmod +x start.sh

EXPOSE 8042
ENTRYPOINT ["./start.sh"]
