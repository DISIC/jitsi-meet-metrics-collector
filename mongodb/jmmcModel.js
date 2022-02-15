module.exports = function(mongodb){
    var mongoose = require('./mongooseConnection')(mongodb); //FIXME: le modèle ne doit pas initier la connexion. C'est plutôt le index.js qui devrait le faire.
    var metricsSchema = mongoose.Schema(
        {
            conf: String,
            users: Array
        },
        {collection :'metrics-collector'}
    );
    return mongoose.model('metrics-collector', metricsSchema);
}
