const AppListeningPort=5000

var app = require('express')();
let bodyParser = require('body-parser');
var jitsiMeetMetricsCollector = require('../../index');
var MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const mongod = async () => {
    return await MongoMemoryServer.create({
        instance:{
          port: 27017,
          ip: '127.0.0.1',
          dbName: 'test',
        }
    });}

mongod();

const config = {
    mongodb: { 
        host: '127.0.0.1',
        port: 27017,
        dbName: 'test'
    },
    authorizedRegions: ["RIE", "MTE", "INTERNET"]
};

app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               

app.use('/', jitsiMeetMetricsCollector(config));

module.exports = app.listen(AppListeningPort, console.log(`App listening on port ${AppListeningPort}`));
