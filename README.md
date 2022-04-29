 :warning: **Warning** :warning:
**This module is currently expiremental. Please use caution when using it in production.**
# What is jitsi-meet-metrics-collector ?
jitsi-meet-metrics-collector is a Node.js module that serves as a middleware for Express.js. It collects browser metrics and stores them in MongoDB database.
```mermaid
sequenceDiagram
Browser->>jitsi-meet-metrics-collector: Get the JS file that sends metrics from /getClient
jitsi-meet-metrics-collector->>Browser: Send client JS file
loop Sending requests every X seconds (Default: 30s)
    Browser->>jitsi-meet-metrics-collector: Send metrics
    jitsi-meet-metrics-collector->>jitsi-meet-metrics-collector: Verify and Validate metrics
    jitsi-meet-metrics-collector->>MongoDB: Store metrics
    MongoDB->>jitsi-meet-metrics-collector: Send confirmation
    jitsi-meet-metrics-collector->>Browser: Send confirmation
    
end
```
# Using jitsi-meet-metrics-collector

In order to use jitsi-meet-metrics-collector, it needs to be imported into Express.js as follows : 

    var express = require('express');
    var app = express();
    var mongoose = require("mongoose")
    var jitsiMeetMetricsCollector = require("@apitech/jitsi-meet-metrics-collector");
    
    var config = {
        authorizedRegions : ["REGION1", "REGION2"]
    }
    
    app.use('/jitsi-meet-metrics-collector',jitsiMeetMetricsCollector({
        confPattern: new RegExp('^(?=(?:[a-zA-Z0-9]*[a-zA-Z]))(?=(?:[a-zA-Z0-9]*[0-9]){3})[a-zA-Z0-9]{10,}$'),
        mongoose : mongoose,
        authorizedRegions: config.authorizedRegions,
        jmmcCollection: 'metrics-collector'
    }));
    
    module.exports = app;

lookup ./test/app/appTest.js for a real example

# Requirements

    - Node > v16.14.2
    - Jitsi > v

# How does it work

    once the user opens a web conference the jmmc_client.js file is uploaded and appended to the client 
    script,the first post request send user's meta-data, the second sends metrics data (connectionquality,
    bandwidth...),and each 30 seconds after that it sends just the updated (changed) metrics. 

    example :
      - the fist request. the script sends the browser, the operating sustem and pid
      - the second request it sends metrics data containing for exemple cq (stands for connexion quality)
      - after that if the connexion quality change it sends metrics with the changed data if not it sends 
        just the updated data without cq.
