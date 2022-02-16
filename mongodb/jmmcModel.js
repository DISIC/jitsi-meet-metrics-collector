module.exports = function(mongooseConnection){
    var mongoose = mongooseConnection; 
    var metricsSchema = mongoose.Schema(
        {
            conf: String,
            users: Array
        },
        {collection :'metrics-collector'}
    );
    return mongoose.model('metrics-collector', metricsSchema);
}
