var databaseURL = ("mongodb://localhost/aprovador");
var mongoose = require("mongoose");
mongoose.connect(databaseURL);
Schema = mongoose.Schema;

///Cria a tabela de administrador

var TABLE_CADASTRO = "Cadastro";
var TABLE_DEVICE = "Device";
var TABLE_LOG_EROO = "Erro";
var TABLE_CRIME = "Crime";
var TABLE_COMMENT = "Comentario";



var enumTipo = ["ADMIN_GERAL", "USER"];
var enumSituacao = ["INATIVO", "ATIVO"];

var enumCrime = ["FURTO","ASSALTO","ASSALTOCURSO","ALARME","ATIVIDADE","ACIDENTE","ATENTADOPUDOR","DROGAS","ARROMBAMENTO","SEQUESTRORELAMPAGO","ARRASTAO"];

var enumTipoLog = ["ERRO", "NOERRO"];

var CadastroSchema = new Schema({
	nome:{type:String,required:true},
	usuario: {type:String,required:true,unique: true},
	email: {type:String,required:true,unique: true},
	senha: {type:String,required:true},
	tipo: {type: String, required: true, enum: enumTipo},
	situacao: {type: String, required: true, enum: enumSituacao,default:"INATIVO"},
	token_ativacao:{type:String},
	cidade:{type:String},
	data_inicio: {type: Date,default: Date.now}
});

var DeviceSchema = new Schema({
	udid: {type: String, required:true,unique: true},
	device: {type:String, required:true},
	version:{type:String, required:true},
	cadastro: {type:String, required:true}
});

var CrimeSchema = new Schema ({
	categoria: {type: String, required: true, enum: enumCrime,default:"FURTO"},
	descricao: {type: String},
	localizacao: {type: [Number], index: "2d"},
	usuario:{type: String, required: true},
	data: {type: Date,default: Date.now},
	agradecimento: {type:Number, default:0}
});

var ComentarioSchema = new Schema ({
	usuario:{type: String, required: true},
	data: {type: Date,default: Date.now},
	comentario: {type: String, required:true},
	crime: {type: String, required:true}
});

var LogErroSchema = new Schema ({
	ip:{type:String,required:true},
	mensagem: {type:String,required:true},
	tipo: {type: String, required: true, enum: enumTipoLog,default:"NOERRO"},
	data: {type: Date,default: Date.now}
});

mongoose.model(TABLE_LOG_EROO, LogErroSchema);
exports.LogErro = mongoose.model(TABLE_LOG_EROO);

mongoose.model(TABLE_COMMENT, ComentarioSchema);
exports.Comentario = mongoose.model(ComentarioSchema);


mongoose.model(TABLE_CADASTRO, CadastroSchema);
exports.Cadastro = mongoose.model(TABLE_CADASTRO);

mongoose.model(TABLE_DEVICE, DeviceSchema);
exports.Device = mongoose.model(TABLE_DEVICE);

mongoose.model(TABLE_CRIME, CrimeSchema);
exports.Crime = mongoose.model(TABLE_CRIME);