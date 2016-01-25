Totem
======

### Requirements 

Mongo running
Node > 11
& a recent navigator

### Test

To try totem just run : node totem exmpl & go to http://localhost:3000/

You will have to try an id (ex : 220576)

### Docker


You can use totem with docker to try it . 
Just run : 
````bash
docker run -p 27017:27017 --name mongod -d mongo
docker run -ti --name totem --link mongo:mongodb docker-totem
````
