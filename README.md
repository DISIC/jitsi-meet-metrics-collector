# jitsi-meet-metrics-collector

jitsi-meet-metrics-collector is a middleware for express.js/jtsi-meet application that receives metrics from the client side and store them in mongodb.

how to use it: 
    simply install it with "npm install @apitech/jitsi-meet-metrics-collector"
    use the middleware in your root app folder by using : app.use(your base url, require('@apitech/jitsi-meet-metrics-collector')(config));
    the config object must contain a mongodb object with this format : 
    mongodb: 
        {
            host: '127.0.0.1 for localhost or ',
            port: 27017, 
            dbName: 'your database name',
            user: 'username'
            pass:   'password'
        }

    