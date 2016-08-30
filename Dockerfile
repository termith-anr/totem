FROM node:argon

EXPOSE 3000

RUN mkdir -p /opt/ezmaster/data
RUN ln -s exemple/ /opt/ezmaster/data

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app/

RUN npm install .

CMD node server.js exemple