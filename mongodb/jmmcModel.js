module.exports = function(mongooseConnection){
    var mongoose = mongooseConnection; //FIXME pas compris cette ligne ? pourquoi on assigne une variable qui est déjà dans les params ?
    var metricsSchema = mongoose.Schema(
        {
            conf: String,
            uid: String,
            m: Array
        },
        {collection :'metrics-collector', versionKey: false}
    );
    return mongoose.model('metrics-collector', metricsSchema);
}
