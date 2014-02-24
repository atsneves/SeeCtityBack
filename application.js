var express = require('express')
  , partials = require('express-partials')
  , app = express();
var request = require('needle');
var database = require("./model/database.js");
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var mime = require('mime');
var validator = require('validator');
var datejs = require('safe_datejs');
var tLog = database.LogErro;
var DbDevice = database.Device;

var DbComentario = database.Comentario;
var DbCrime = database.Crime;
var mongoose = require("mongoose");

var cadastroModule = require("./model/administrator.js");
var DbCadastro = database.Cadastro;



app.configure(function(){
	app.set("views","views");
	app.use(partials());
	app.use(express.favicon());
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use('/', express.static('public'));
	app.use(express.session({secret: 'sessionLoginHomeEae'}));
	app.engine('.html', require('ejs').renderFile);
	app.set("view engine","html");
	app.set("view options",{
		layout: 'home'
	});
	
});

app.post("/generateLogin",function(req,res,next){
	require('crypto').randomBytes(2, function(ex, buf) {
		var tokenBuf = buf.toString('hex');
		var token = new Object();
		token.name = "seecity"+tokenBuf;
		
		res.json(token);
		
		console.log(token);
	});
	
});

app.get("/",function(req,res,next){
	if(req.session.admin)
	{
		res.redirect("/home");
	}
	else
	{
		res.render('index',{layout: 'login',title:"Aprovador",erro:req.session.erro,code:""});
		req.session.destroy();
		
	}
	
	
});
app.get("/userNew/:login/:senha/:tipo/:situacao/:nome",function(req,res,next){
	
	console.log(req.params);
	request.post("http://127.0.0.1:8080/createAdmin",{login:req.params.login,senha:req.params.senha,tipo:req.params.tipo,nome:req.params.nome,situacao:"ATIVO"},function(error, response, body){
		console.log("erro é:"+error);
		//console.log(response);
		
	});
	res.end();
});
app.post("/novousuario", function(req,res,next){
	console.log(req.body);
	
	
	if(req.body.identificador)
	{
		
		
	}
	else
	{
		require('crypto').randomBytes(20, function(ex, buf) {
			var tokenBuf = buf.toString('hex');
			
			var cadastro = new DbCadastro();
			
			cadastro.nome = req.body.nome;
			cadastro.usuario = req.body.login;
			cadastro.senha = req.body.senha;
			cadastro.cidade = req.body.cidade;
			cadastro.email = req.body.email;
			cadastro.token = tokenBuf;
			cadastro.tipo = "USER";
			cadastro.situacao = "ATIVO";
			cadastro.save(function(err,salvo){
				
				if(!err)
				{
					res.json(salvo);
				}
				else
				{
					res.json(err);
				}
					
			});
			
		});
	}	
	


	
});


app.post("/login",function(req,res,next){
	console.log(req.body);
	if(req.body.isFacebook == "true")
	{
		
		DbCadastro.findOne({email : req.body.email,situacao:"ATIVO"}, function(err, retDatabase) {
	        if (retDatabase) 
	        {
				res.json(retDatabase)
	        }	
	        else
	        {
	        	res.json(err);
	        }
	    });
	}
	else
	{
		console.log("entrou no nao face");
		
		if(validator.isEmail(req.body.login))
		{
			DbCadastro.findOne({email : req.body.login,senha:req.body.senha,situacao:"ATIVO"}, function(err, retDatabase) {
		        console.log(req.body);
		        if (retDatabase) 
		        {
					res.json(retDatabase)
		        }	
		        else
		        {
		        	res.json(err);
		        }
		    });
		}
		else
		{
			DbCadastro.findOne({usuario : req.body.login,senha:req.body.senha,situacao:"ATIVO"}, function(err, retDatabase) {
		        console.log(req.body);
		        if (retDatabase) 
		        {
					res.json(retDatabase)
		        }	
		        else
		        {
		        	res.json(err);
		        }
		    });
		}
		
		
		
	}	
	
});



app.post("/",function(req,res,next){
	
	DbCadastro.findOne({usuario : req.body.login,senha:req.body.senha}, function(err, retDatabase) {
        console.log(req.body);
        if (retDatabase) 
        {
			console.log(retDatabase);
			
			req.session.admin = retDatabase;
			
			res.redirect("/home");
        }	
        else
        {
        	req.session.erro = {code:500,message:"Usu&aacute;rio ou senha inv&aacute;lidos"};
        	res.redirect("/");
        }
    });
});


app.get("/logout",function(req,res,next){
	req.session.destroy();
	res.redirect("/");
});

app.get("/admin/form",function(req,res,next){
	
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	console.log(req.query);
	
	
	
	if(req.query.p1)
	{
		DbCadastro.findOne({_id:req.query.p1},function(err,ret){
			DbEmpresa.find().sort().exec(function (err, listAllEmpresa) {
				
				res.render('formAdmin',{layout: 'home',qryEmpresa:listAllEmpresa,param:ret,title:"Aprovador",username:req.session.admin.nome,code:err});
				
			});
		});
	}
	else
	{
		DbEmpresa.find().sort().exec(function (err, listAllEmpresa) {	
			
			res.render('formAdmin',{layout: 'home',title:"Aprovador",qryEmpresa:listAllEmpresa,username:req.session.admin.nome,code:err});
			
		});
		
		
	}
	
	
});


app.get("/admin/list",cadastroModule.findAll);

app.get("/admin/listUser",cadastroModule.findAllUser);

app.post("/createAdmin",function(req,res,next){
//	if(!req.session.admin)
//	{	
//		req.session.erro = {code:400,message:"Sem acesso"};
//		res.redirect("/");
//		return;
//	}
	
	if(req.body.identificador)
	{
		DbCadastro.findOne({_id:req.body.identificador},function(err,ret){
			ret.usuario = req.body.login;
			ret.senha = req.body.senha;
			ret.nome = req.body.nome;
			ret.situacao = req.body.situacao;
			ret.cod_usuario = req.body.cod_usuario;
			if(req.body.situacao == "INATIVO")
			{
				var today = new Date();
				var unsafeToday = today.AsDateJs(); 
				ret.data_termino= unsafeToday;
			}
			
			ret.save(function(err,saveAdmin){
				console.log(err);
				console.log(saveAdmin);
				if(!err)
				{
					req.session.erro = {code:666,message:"Usuário alterado com sucesso!"};
					res.redirect("/home");
				}
				else
				{
					req.session.erro = {code:666,message:err.message};
					res.redirect("/home");
				}
				
			});
		});
		
	}
	else
	{
		var admin = new DbCadastro();
		admin.usuario = req.body.login;
		admin.senha = req.body.senha;
		admin.tipo = req.body.tipo;
		admin.nome = req.body.nome;
		admin.situacao = req.body.situacao;
		admin.cod_usuario = req.body.cod_usuario;
		var today = new Date();
		var unsafeToday = today.AsDateJs(); 
		admin.data_inicio = unsafeToday;
		
		
		admin.id_empresa = req.body.empresa;
		admin.save(function(err,saveAdmin){
			console.log(err);
			if(!err)
			{
				req.session.erro = {code:666,message:"Usuário incluído com sucesso!"};
				res.redirect("/home");
			}
			else
			{
				req.session.erro = {code:666,message:err.message};
				res.redirect("/home");
			}
		});
	}
});
app.get("/home",function(req,res,next){
	console.log(req.session.admin);
	
	if(req.session.admin)
	{
		console.log(req.session.admin);
		err = "";
	
		res.render('index',{layout: 'home',username:req.session.admin.nome,title:"Aprovador",erro:req.session.erro});
	}
	else
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
});



app.post("/registerDevice",function(req,res,next){
	if(!req.session.admin)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	
	if(req.body.udid)
	{
		exists = false;
		DbDevice.findOne({udid:{$ne : req.body.udid}},function(error,retorno)
		{
			device = new DbDevice();
			device.udid = req.body.udid;
			device.device = req.body.device;
			device.version = req.body.ios;

			device.save(function(err,saveXml){
				
				if(!err)
				{
					res.json(saveXml);
				}
				else
				{
					res.json(err);
				}
			});
		});
		
		///Caso não tenha nenhum device;
		device = new DbDevice();
		device.udid = req.body.udid;
		device.device = req.body.device;
		device.version = req.body.ios;

		device.save(function(err,saveXml){
			
			if(!err)
			{
				res.json(saveXml);
			}
			else
			{
				res.json(err);
			}
		});
		
				
	}
	else
	{
		erro.code = 666;
		erro.message = "Todos os campos são obrigatórios.";
		res.json(erro);
	}
	
});


app.get("/sendpush",function(req,res,next){
//	
//	
//	var id = req.query.p1;
//	
//	
//	DbXml.findOne({_id:id},function(err,retRev){
//		console.log(retRev);
//		
//		DbDevice.find().exec(function(error,retorno){
//			console.log("DbDevice = "+retorno);
//			for (i = 0;i< retorno.length;i++)
//			{
//				console.log("retorno titulo = "+retorno[i].udid);
//				var 
//				  cert_and_key = require('fs').readFileSync('./apns-dev.pem')
//				  notifier = require('node_apns').services.Notifier({ cert: cert_and_key, key: cert_and_key }, true /* development = true, production = false */)
//
//
//				 /* 
//				   Now you may send notifications!
//				 */
//
//				 var Notification = require('node_apns').Notification;
//
//				 notifier.notify(Notification("55c62665bad08c74a91a5208667e7ea89acaf69e747209699dc9ce0d3fccb831", { aps: { alert:"Nova Edição: "+p1, sound: "default" }}), 
//				   function (err) { 
//					 if (!err)
//						{
//							console.log("Sent", this);
//							res.json(this);
//						}  
//						else 
//						{
//							console.log('Error', err, 'on', this);
//							res.json(err);
//						}
//				   }
//				 );
//
//				
//			}
//			
//			
//			
//		});
//				
//	});
//	
	
	
});

//Create LOG

function createLog(ip,mensagem,tipo)
{
	var log = new LogErro();
	
	log.ip = ip;
	log.mensagem = mensagem;
	log.tipo = tipo;
	
	log.save(function(err,saveXML){
		if(!err)
		{
			return true;
		}
		else
		{
			return false;
		}
			
	});

}


app.post("/removeAdmin",function(req,res,next){
	var retApp = req.query.app;
	
	if(!req.session.admin && !retApp )
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	if(req.body.id)
	{
		DbCadastro.remove( {"_id": req.body.id},function(err,ret){
			if(!err)
			{
				req.session.erro = {code:001,message:"Cadastro removido com sucesso!"};
			}
			else
			{
				req.session.erro = err;
			}
			res.end();
		});
		
		
	}
});


app.post("/addCrime",function(req,res,next){
	
	if(req.body.categoria)
	{
		var crime = new DbCrime();
		crime.categoria = req.body.categoria;
		crime.descricao = req.body.descricao;
		crime.localizacao = [req.body.longitude,req.body.latitude];
		crime.usuario = req.body.usuario;
		crime.save(function(err,salvo){
			
			if(!err)
			{
				res.json(salvo);
			}
			else
			{
				res.json(err);
			}
		});
		
	}
	
});

app.post("/listaCrime",function(req,res,next){
	
	var pCenterLatitude = req.body.latitude;
	var pCenterLongitude = req.body.longitude;
	var pOrder = req.body.order;
	
	var ordernacao = {data:-1};
	if(pOrder == "PROX")
	{
		var ordernacao = {$maxDistance:-1};
	}
	else if(pOrder == "CATEGORIA")
	{
		var ordernacao = {categoria:1};
	}
	else
	{
		var ordernacao = {data:-1};
	}
		
	
	
	var pRadiusInKM = 5;
	var EARTH_RADIUS = 6371;
//	var geoQuery = {
//
//			localizacao: { 
//
//			$nearSphere: [pCenterLongitude, pCenterLatitude],
//
//			$maxDistance: pRadiusInKM/EARTH_RADIUS
//
//			}
//
//	};
//	
	DbCrime.find().sort(ordernacao).exec(function (err, listaCrime) {
		if(!err)
		{
			res.json(listaCrime);
			
			
		}
		else
		{
			res.json(err);
		}
	});
	
});
app.get("/countCommentByCrime/:cr",function(req,res,next){
	console.log(req.params.cr);
	DbComentario.count({crime:req.params.cr},function(er,co){
		if(!er)
			res.json(co);
		else
			res.json(er);
		
		
	});
	
});
app.post("/addComent",function(req,res,next){
	
	if(req.body.crime)
	{
		var comentario = new DbComentario();
		comentario.usuario = req.body.usuario;
		
		var today = new Date();
		var unsafeToday = today.AsDateJs(); 
		comentario.data = unsafeToday;
		comentario.comentario = req.body.comentario;
		comentario.crime = req.body.crime;
		comentario.usuario = req.body.usuario;
		comentario.save(function(err,salvo){
			
			if(!err)
			{
				res.json(salvo);
				
			}
			else
			{
				res.json(err);
			}
			
		})
		
	}
	
});

app.post("/listComment",function(req,res,next){
	
	
	if(req.body.crime)
	{
		DbComentario.find({crime:req.body.crime}).sort({data:-1}).exec(function (err, listaComment){
			
			if(!err)
				res.json(listaComment);
			else
				res.json(err);
		});
	}
	
});

app.post("/addAgradecer",function(req,res,next){
	
	if(req.body.crime)
	{
		DbCrime.findOne({_id : req.body.crime}, function(err, crime){
			console.log(crime);
			if(!err)
			{
				console.log(crime.agradecimento);
				crime.agradecimento = crime.agradecimento + 1;
				
				crime.save(function(erro,salvo){
					if(!erro)
						res.json(salvo);
					else
						res.json(erro);
				});
				
			}
			else
				res.json(err);
		});
	}
	
});

app.post("/changePass",function(req,res,next){
	DbCadastro.findOne({_id : req.body.ident}, function(erre, cadastro) {
        if (retDatabase) 
        {
        	cadastro.senha = req.body.senha;
        	cadastro.save(function(err,retCad){
				if(!err)
				{
					res.json(retCad);
				}
				else
				{
					res.json(err);
				}
				
			});
        }	
        else
        {
        	res.json(erre);
        }
    });
});

app.post("/cancelAccount",function(req,res,next){
	DbCadastro.findOne({_id : req.body.ident}, function(erre, cadastro) {
        if (retDatabase) 
        {
        	cadastro.situacao = "CANCELADO";
        	cadastro.save(function(err,retCad){
				if(!err)
				{
					res.json(retCad);
				}
				else
				{
					res.json(err);
				}
				
			});
        }	
        else
        {
        	res.json(erre);
        }
    });
});


app.configure("development",function(){
	app.use(express.errorHandler({dumpExceptions:true,showStack:true}));
	app.set("db-uri","mongodb://localhost/aprovador");
	
});



app.configure("production",function(){
	app.use(express.errorHandler());
	app.set("db-uri","mongodb://localhost/aprovador");
});

app.db = mongoose.createConnection(app.set("db-uri"));

app.listen(8080);
