var mongoose = require('mongoose');

module.exports = function(mongodb){
    var mongoOptions={
        user:mongodb.user,
        pass:mongodb.password,
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
    
    if(mongoOptions.user === undefined && mongoOptions.pass === undefined){//TODO pourquoi cette ligne ? il faudrait pas passer directement le mongoURI dans la config  ?
        mongoOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }
    
    //MongoDB Connection
    var mongoURI = "mongodb://"+mongodb.host+":"+mongodb.port+"/"+mongodb.dbName; // TODO est-ce nécessaire ? mongoose ne gère pas le mongoURI tout seul?
    
    mongoose.connect(mongoURI, mongoOptions).then(
        () => {
            console.log("jitsi-meet-metrics-collector is connected to MongoDB : " + mongoURI);
        },
        (err) => {
            console.log("jitsi-meet-metrics-collector Mongodb connection error: " + mongoURI); //TODO il faut afficher l'erreur aussi 
            console.log("jitsi-meet-metrics-collector is going to stop");
        }
    );
    return mongoose;
}

