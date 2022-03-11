const AppListeningPort=4000

var app = require('express')();
let bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var jitsiMeetMetricsCollector = require('../../index');
var MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;


// declaring mongo in memory instance
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

var mongoOptions={
    useNewUrlParser: true,
    useUnifiedTopology: true
};

//MongoDB Connection
mongoose.set('useFindAndModify', false);
var mongoURI = "mongodb://"+config.mongodb.host+":"+config.mongodb.port+"/"+config.mongodb.dbName;

mongoose.connect(mongoURI, mongoOptions).then(
    () => {
        logger.info("Connecté à MongoDB : " + mongoURI);
    },
    (err) => {
        logger.error("Erreur de conenxion à MongoDB: " + mongoURI);
        logger.error("L'application va s'arrêter");
        process.exit(1)
    }
);

app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));   
app.use(cookieParser("mySecret"));


app.use('/',jitsiMeetMetricsCollector({
    confPattern: new RegExp('^(?=(?:[a-zA-Z0-9]*[a-zA-Z]))(?=(?:[a-zA-Z0-9]*[0-9]){3})[a-zA-Z0-9]{10,}$'),
    mongoose : mongoose,
    authorizedRegions: config.authorizedRegions,
    jmmcCollection: 'metrics-collector'
}));


module.exports = app.listen(AppListeningPort, console.log(`App listening on port ${AppListeningPort}`));
