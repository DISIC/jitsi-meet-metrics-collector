var MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

module.exports = async () => {
    const mongod = await MongoMemoryServer.create();
    console.log(mongod.getUri());
}