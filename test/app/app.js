var app = require('express')();
let bodyParser = require('body-parser');
var jitsiMeetMetricsCollector = require('../../index');

const config = {mongodb: {
    user: 'test',
    passWord: 'test',
    host: '127.0.0.1',
    port: 2727,
    dbName: 'test'
}};

app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));

app.use('/', jitsiMeetMetricsCollector(config));

module.exports = app.listen(5000, console.log("App listening on port "+5000));
