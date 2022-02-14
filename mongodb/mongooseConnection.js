var mongoose = require('mongoose');

module.exports = function(mongodb){
    var mongoOptions={
        user:mongodb.user,
        pass:mongodb.password,
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
    
    console.log(mongoOptions)
    if(mongoOptions.user === undefined && mongoOptions.pass === undefined){
        mongoOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }
    
    //MongoDB Connection
    var mongoURI = "mongodb://"+mongodb.host+":"+mongodb.port+"/"+mongodb.dbName;
    
    mongoose.connect(mongoURI, mongoOptions).then(
        () => {
            console.log("Connecté à MongoDB : " + mongoURI);
        },
        (err) => {
            console.log("Erreur de conenxion à MongoDB: " + mongoURI);
            console.log("L'application va s'arrêter");
        }
    );
    return mongoose;
}

