
const jmmcModel_initializer = (config) => {
    var mongoose = config.Mongoose;
    var metricsSchema = mongoose.Schema(
        {
            conf: String,
            uid: String,
            m: Array
        },
        {collection :config.collection, versionKey: false}
    );

    return mongoose.model('metrics-collector', metricsSchema);
}

module.exports = jmmcModel_initializer;