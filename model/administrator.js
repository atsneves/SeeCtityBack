var database = require("./database.js");

var DbCadastro = database.Cadastro;

exports.findAllUser = function(req,res,next){
	
	var params = req.params;
	
	var retJson =req.query.json; 
	
	DbCadastro.find({tipo:"USER"}).sort({name : 1}).exec(function (err, listAllAdmin) {
        
		
		
        if (listAllAdmin && listAllAdmin.length > 0 && retJson) 
        	res.json(listAllAdmin);
        else 
        {
        	if(req.session.admin && (req.session.admin.tipo == "ADMIN_GERAL" || req.session.admin.tipo == "ADMIN_EMPRESA"))
        	{
        		res.render('listAdmin',{layout: 'home',qryAdmin:listAllAdmin,title:"Aprovador",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
};


exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	var retJson =req.query.json; 
	
	DbCadastro.find({$or:[{tipo : "ADMIN_GERAL"},{tipo: "ADMIN_EMPRESA"}]}).sort({name : 1}).exec(function (err, listAllAdmin) {
        
		
		
        if (listAllAdmin && listAllAdmin.length > 0 && retJson) 
        	res.json(listAllAdmin);
        else 
        {
        	if(req.session.admin && req.session.admin.tipo == "ADMIN_GERAL")
        	{
        		res.render('listAdmin',{layout: 'home',qryAdmin:listAllAdmin,title:"Aprovador",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
};
