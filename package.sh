#!/bin/sh

VERSION_NUMBER=$1 # for example 0.1
GIT_TAG=v${VERSION_NUMBER}

echo "MANDARIN_CANTONESE_API_VERSION='${VERSION_NUMBER}'" > version.py
git commit -a -m "upgraded version to ${VERSION_NUMBER}"
#git push
git tag -a ${GIT_TAG} -m "version ${GIT_TAG}"
#git push origin ${GIT_TAG}

# docker build
docker build -t lucwastiaux/mandarin-cantonese-api:${VERSION_NUMBER} -f Dockerfile .
docker push lucwastiaux/mandarin-cantonese-api:${VERSION_NUMBER}