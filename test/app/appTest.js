var app = require('express')();
let bodyParser = require('body-parser');
var jitsiMeetMetricsCollector = require('../../index');
var MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;


const mongod = async () => {
    console.log("mongod")
    return await MongoMemoryServer.create({
        instance:{
          port: 27017,
          ip: '127.0.0.1',
          dbName: 'test',
        }
    });}

mongod().then((data) => console.log(data));

const config = {mongodb: {
    host: '127.0.0.1',
    port: 27017,
    dbName: 'test'
}};

app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));  

app.use('/', jitsiMeetMetricsCollector(config));



module.exports = app.listen(5000, console.log(5000));


