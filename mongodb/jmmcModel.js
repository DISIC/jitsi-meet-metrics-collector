module.exports = function(mongodb){
    var mongoose = require('./mongooseConnection')(mongodb);
    var metricsSchema = mongoose.Schema(
        {
            conf: String,
            users: Array
        },
        {collection :'metrics-collector'}
    );
    return mongoose.model('metrics-collector', metricsSchema);
}


