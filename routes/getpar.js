var mongo = require("mongodb").MongoClient,
    jsonselect = require('JSONSelect'),
    DOMParser = require('xmldom').DOMParser,
    cheerio = require('cheerio'),
    _ = require("lodash");

module.exports = function(config) {
    
    console.info("collection : " , config.get('connectionURI') , " / " , config.get('collectionName'));

  return function(req,res){

        if(config.get("teiFormat") !== "scenario1" ){
            res.send({ info : "Impossible d'utiliser TOTEM avec ces fichiers , veuillez préciser le format." });
            return
        }
        if(!req.params.wid || (req.params.wid === undefined)){
            res.send({ info : "Aucun ID terme envoyé , merci d'en préciser un." });
            return;
        }
        if(!req.params.target || (req.params.target === undefined)){
            res.send({ info : "Aucun target envoyé , merci d'en préciser un." });
            return;
        }

        console.info("Recherche le doc : " , req.params.wid , " , id : " , req.params.target);

        var p,
            wid = req.params.wid,
            target = req.params.target;

        mongo.connect(config.get('connectionURI'), function(err, db) {
            //console.log("Connected correctly to server");
            db.collection(config.get('collectionName'))
            .find({ wid : wid } , {_id : 0 , "content.xml" : 1})
            .each(function(err, item){
                if(!err && item){

                    console.info("target : " , 'body w[xml\\:id="' + target + '"]');

                    var $ = cheerio.load(item.content.xml.toString(), {xmlMode: true}),
                        w = $('body w[xml\\:id="' + target + '"]');

                    console.info("w " , w);

                    w.addClass("wordToSearch");

                    if(!(w.length > 0)){
                        console.info('Pas de W dans le body sur ce doc');
                        return;
                    }

                    p = w.parent().toString();                    
                }
                else{
                    db.close();
                    if(!err){
                        if(!p){
                            res.send({ info : "Le document n'a pas été trouvé" });
                            return;
                        }
                        res.send({p : p});
                    }
                    else{
                        console.info("err : " , err);
                    }
                }
            })

        });

  };
};