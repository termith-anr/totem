FROM node:argon

EXPOSE 3000

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN echo '{ \
  "httpPort": 3000, \
  "configPath": "/usr/src/app/config.json", \
  "dataPath": "/usr/src/app/exemple" \
}' > /etc/ezmaster.json

# Install app dependencies
COPY . /usr/src/app/

RUN npm install .

CMD node server.js exemple