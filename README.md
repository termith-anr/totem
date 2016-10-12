Totem
======

![Totem Logo](http://image.noelshack.com/fichiers/2016/04/1453734983-totem-cap.png)

You have Docker & want to watch Totem interface ? -> [Docker-Totem](https://hub.docker.com/r/matthd/totem/)

### Requirements 

Mongo running
Node > 11
& a modern navigator

### Test

To try totem just run : node totem exmpl & go to http://localhost:3000/

You will have to send an id in the form (ex : 220576)

### Docker

You can use totem with docker to try it . 

Just start mongo : 
````bash
docker run -p 27017:27017 --name MONGODB -d mongo 
````

Start Totem exemples:

````bash
docker run -ti -p 3000:3000 --name totem --link MONGODB:MONGO matthd/totem
````

Go http://localhost:3000 to access totem interface

### ezMaster
This app is ezMaster compatible





