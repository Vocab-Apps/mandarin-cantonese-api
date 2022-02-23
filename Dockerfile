# building the image:
# docker build -t lucwastiaux/mandarin-cantonese-api:v0.2 .
# running the container:
# docker run --name mandarin-cantonese-api -p 9042:8042 --rm lucwastiaux/mandarin-cantonese-api:v0.2
# push to repository
# docker push lucwastiaux/mandarin-cantonese-api:v0.2

FROM ubuntu:20.04

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY app.py version.py start.sh ./
RUN chmod +x start.sh

EXPOSE 8042
ENTRYPOINT ["./start.sh"]
