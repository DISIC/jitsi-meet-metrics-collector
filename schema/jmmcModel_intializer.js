
const jmmcModel_initializer = (config) => {
    var mongoose = config.Mongoose;
    var metricsSchema = mongoose.Schema(
        {
            conf: String,
            uid: String,
            m: Array
        },
        {collection :config.jmmcCollection, versionKey: false}
    );

    return mongoose.model(config.jmmcCollection, metricsSchema);
}

module.exports = jmmcModel_initializer;