var mongo = require("mongodb").MongoClient;

module.exports = function(config) {

    console.info("collection : " , config.get('connectionURI') , " / " , config.get('collectionName'));

  return function(req,res){

        if(!req.params.wid || (req.params.wid === undefined)){
            res.send({ info : "Aucun ID terme envoyé , merci d'en préciser un." });
            return;
        }
        if(!req.params.target || (req.params.target === undefined)){
            res.send({ info : "Aucun target envoyé , merci d'en préciser un." });
            return;
        }

        var p,
            nb = req.params.wid,
            target = req.params.target.split(",").length > 1  ? req.params.target.split(",") : req.params.target;

        console.info("target : " , target);

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
                            res.send({ p : null });
                            return;
                        }
                        res.send({p : p});
                    }
                    else{
                        console.info("err : " , err);
                    }
                }
            });
        });

  };
};