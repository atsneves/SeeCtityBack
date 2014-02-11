var database = require("./database.js");

var DbXml = database.Xmls;



exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	var retJson = req.query.json;
	
	console.log(database);
	
	if(!req.session.admin && !retJson)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/home");
	}
	
		DbXml.find().sort({data:1}).exec(function (err, listAllXml) {
	        
			
			
	        if (listAllXml && listAllXml.length > 0 && retJson) 
	        	res.json(listAllXml);
	        else if(retJson)
	        	res.json(listAllXml);
	        else 
	        {
	        	res.render('listXml',{layout: 'home',qryXml:listAllXml,title:"Aprovador",code:err});
	        }
	        
	        
	    });
	
	
};
