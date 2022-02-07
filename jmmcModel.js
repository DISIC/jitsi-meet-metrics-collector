var mongoose = require('mongoose');

var metricsSchema = mongoose.Schema(
    {
        conf: String,
        users: Array
    },
    {collection :'metrics-collector'}
);

module.exports = mongoose.model('metrics-collector', metricsSchema);