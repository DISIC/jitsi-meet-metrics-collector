module.exports = function(mongooseConnection){
    var mongoose = mongooseConnection; 
    var metricsSchema = mongoose.Schema(
        {
            conf: String,
            uid: String,
            metrics: Array
        },
        {collection :'metrics-collector', versionKey: false}
    );
    return mongoose.model('metrics-collector', metricsSchema);
}
