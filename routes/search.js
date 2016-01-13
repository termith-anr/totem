var mongo = require("mongodb").MongoClient,
    kuler = require("kuler"),
    _ = require("lodash");

module.exports = function(config) {
    
    console.info("collection : " , config.get('connectionURI') , " / " , config.get('collectionName'));

	return function(req,res){

        if(!req.params.xmlid || (req.params.xmlid === undefined)){
            res.render('index.html');
            return;
        }
        if(!req.params.page || (req.params.page === undefined)){
            console.info("redirection ...");
            res.redirect("/search/" + req.params.xmlid + "/1");
            return;
        }

		var page = req.params.page ?  parseInt(req.params.page)  : 1,
            skip = (Number.isInteger(page) && page > 1) ? (page - 1)*50 +1 : 0 ;

        console.info("skip : " , skip);


        var obj = {}, // Contian all items
            title,
            target,
            count;

        mongo.connect(config.get('connectionURI'), function(err, db) {
            //console.log("Connected correctly to server");
            db.collection(config.get('collectionName')).count({"content.corresp" : req.params.xmlid }, function(err, totalDoc){
                db.collection(config.get('collectionName'))
                .find({"content.corresp" : req.params.xmlid } , {content : 1 , basename : 1 , wid : 1 , number : 1})
                .skip(skip)
                .limit(50)
                .each(function(err, item){
                    if(!err && item){
                        if(!(obj[item.basename]) || !(Array.isArray(obj[item.basename]))){
                            obj[item.basename] = [];
                        }
                        item.content.widdoc = item.wid;
                        item.content.nid = item.number;
                        obj[item.basename].push(item.content);
                        // console.info("Fichier -> ", item.basename );
                        // console.info("target : " , item.content.target); 
                        console.info("obj : " , Object.keys(obj).length);                 
                    }
                    else{
                        db.close();
                        if(!err){
                            if(!(Object.keys(obj).length > 0)){
                                res.render('index.html', { info : "Ce terme n'a pas été desambiguisé Ou la page n'existe pas" });
                                return;
                            }
                            var words = [],
                                lemma = obj[Object.keys(obj)[0]][0].lemma;
                            res.render('index.html', { page : page , id : req.params.xmlid, lemma : lemma , totalDoc : totalDoc, objs : obj });
                        }
                        else{
                            console.info("err : " , err);
                        }
                    }
                });
            });
            
        });

	};
};