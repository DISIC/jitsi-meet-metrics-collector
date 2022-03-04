# jitsi-meet-metrics-collector

jitsi-meet-metrics-collector is a middleware for express.js/jtsi-meet application that receives metrics from the client side and store them in mongodb.

how to use it: 
    simply install it with "npm install @apitech/jitsi-meet-metrics-collector"
    use the middleware in your root app folder by using : app.use(your base url, require('@apitech/jitsi-meet-metrics-collector')(config));
    the config object must contain a mongodb object with this format : 
    {
    mongoose: mongoose //the mongoose object must be connected already in the application,
    confPattern: new RegExp('your regexp string here'),
    authorizedRegions: array of strings of the authorized regions,
    jmmcCollection: the name of your collection of type string
    }
    