FROM node:argon

EXPOSE 3000

COPY . /app/

RUN echo '{ \
  "httpPort": 3000, \
  "configPath": "/app/config.json", \
  "dataPath": "/app/exemple" \
}' > /etc/ezmaster.json


WORKDIR /app


RUN npm install .

CMD node server.js exemple