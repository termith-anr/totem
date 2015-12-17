var mongo = require("mongodb").MongoClient,
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
            nb = req.params.wid,
            target = req.params.target;

        mongo.connect(config.get('connectionURI'), function(err, db) {
            //console.log("Connected correctly to server");
            db.collection(config.get('collectionName'))
            .find({ "content.nb" : nb } , {_id : 0 , "content.para" : 1})
            .each(function(err, item){
                if(!err && item){

                    if(!(item.content.para)){
                        console.info('Pas de W dans le body sur ce doc');
                        return;
                    }

                    p = item.content.para.toString();                    
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