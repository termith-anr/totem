var mongo = require("mongodb").MongoClient;

module.exports = function(config) {

  return function(req,res){

        if(!req.params.wid || (req.params.wid === undefined)){
            res.send({ info : "Aucun wid envoyé , merci d'en préciser un." });
            return;
        }

        var p,
            wid = req.params.wid;

        mongo.connect(config.get('connectionURI'), function(err, db) {
            //console.log("Connected correctly to server");
            db.collection(config.get('collectionName'))
            .find({ wid : wid} , {_id : 0 , "content.para" : 1})
            .each(function(err, item){
                if(!err && item){

                    if(!(item.content.para)){
                        console.info('Pas de paragraphe pour cet élément');
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