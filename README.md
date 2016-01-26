Totem
======

![Totem Logo](http://image.noelshack.com/fichiers/2016/04/1453734983-totem-cap.png)

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

### Docker-machine(boot2docker) & Proxy

If you are behind a corporate proxy & want to use docker-machine just follow steps :

First , create a new machine with proxy settings (delete engine-env if you do not use proxy in company) :

````bash
docker-machine create -d virtualbox --engine-env HTTP_PROXY=http://proxyout.myfirm.fr:8080 --engine-env HTTPS_PROXY=http://proxyout.myfirm.fr:8080 myfirm
````

Then , in it export env variables:

````bash
docker-machine env myfirm
````

& set it to the new active machine to your shell

````bash
eval $(docker-machine env myfirm)
````

Finnaly stop the default machine

````bash
docker-machine stop default
````

Now you have to follow classical docker steps (above);

To get your linux vm IP :

````bash
docker-machine ip myfirm
````

Will result something like 192.168.99.101 .

That's why you will need to check software at 192.168.99.101:3000 & not localhost ;)





