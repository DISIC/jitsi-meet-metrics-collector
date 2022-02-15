const AppListeningPort=5000

var app = require('express')();
let bodyParser = require('body-parser');
var jitsiMeetMetricsCollector = require('../../index');
var MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

//FIXME: la base de données mongodb doit être lancée par le fichier indexTest.js ensuite l
const mongod = async () => {
    console.log("mongod")
    return await MongoMemoryServer.create({
        instance:{
          port: 27017,
          ip: '127.0.0.1',
          dbName: 'test',
        }
    });}

mongod().then((data) => 
console.log(data)
);

const config = {mongodb: { //FIXME : ces paramètres doivent être récupérés depuis la config globale et non pas écrits en dur
    host: '127.0.0.1',
    port: 27017,
    dbName: 'test'
}};

//FIXME: est-on sûr que ce bloc est indispensable ?
//  Début bloc
app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));  
//  Fin bloc

app.use('/', jitsiMeetMetricsCollector(config));

module.exports = app.listen(AppListeningPort, console.log(`App listening on port ${AppListeningPort}`));
