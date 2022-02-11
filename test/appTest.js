var app = require('express')();
let bodyParser = require('body-parser');
var jitsiMeetMetricsCollector = require('../index');
var MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

// const mongod = new MongoMemoryServer({
//     instance: {
//       port: 27017, // by default choose any free port
//       ip: '127.0.0.1', // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`,
//       dbName: 'test', // by default '' (empty string)
//     }
//   });

// mongod.getUri().then(data => console.log(data))

const mongod = async () => {return await MongoMemoryServer.create();}
mongod()

const config = {mongodb: {
    user: 'test',
    passWord: 'test',
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


