module.exports = function(mongoose){
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