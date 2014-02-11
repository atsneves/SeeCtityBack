var database = require("./database.js");

var DbEmpresa = database.Empresa;



exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	var retJson = req.query.json; 
	if(!req.session.admin && !retJson)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	
	
	var tipoEmpresa = req.query.tipo;
	
	console.log(tipoEmpresa);
	
	
		DbEmpresa.find().sort().exec(function (err, listAllEmpresa) {
	        
			
			
	        if (listAllEmpresa && listAllEmpresa.length > 0 && retJson) 
	        	res.json(listAllEmpresa);
	        else if(retJson)
	        	res.json(listAllEmpresa);
	        else 
	        {
	        	res.render('listEmpresa',{layout: 'home',qryEmpresa:listAllEmpresa,title:"Aprovador",code:err});
	        }
	        
	        
	    });
	
	
};
