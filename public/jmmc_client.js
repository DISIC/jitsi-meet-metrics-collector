// TODO: Ajouter des commentaires avant chaque fonction

let staticId = localStorage.getItem("staticUserId"); //TODO: remplacer le nom de la variable staticUserId par jmmc_staticUserId pour éviter la confusion avec d'autres scripts
const url = "/jitsi-meet-metrics-collector/push";
const events = [ //FIXME : remplacer le tableau par une variable string  car on a un seul evenement
    "cq.local_stats_updated",
];
let pushCondition = 0; //FIXME : mettre PUSHCONDITION sous forme de constante paramètrable égale à 3 par défaut
const jitsi_meet_infos = {
    uid: getStaticId()
}

class jitsi_meet_data {
    constructor() {
        this.j_br = "";  // browser_name
        this.j_os = "";   // operating_system

        this.j_sr = "";  // server_region
        this.j_cq = 100; // connection_quality

        this.j_u_bw = 0; // upload bandwidth
        this.j_u_ab = 0; // upload audio_bitrate
        this.j_u_vb = 0; // upload video_bitrate
        this.j_u_pl = 0; // upload packet_loss

        this.j_d_bw = 0; // download bandwidth
        this.j_d_ab = 0; // download audio_bitrate
        this.j_d_vb = 0; // download video_bitrate
        this.j_d_pl = 0; // download packet_loss

        this.j_t_ip = "0.0.0.0";  // transport ip
        // FIXME : le port doit être au format numérique
        this.j_t_p = "0";           // transport port
        this.j_t_tp = "tcp";       // transport type
        this.j_t_lip = "0.0.0.0"; // transport local_ip
        // FIXME : le port doit être au format numérique
        this.j_t_lp = "0";          // transport local_port

        this.j_v = {}; // video

        this.avgIntData = {}; // object of arrays that contains int elements to be updated after calculating their average

        this.updated = [];
        this.updatedVideos = [];
    }

    updateIP(data, elem) {
        if(typeof(data) === "string" &&
           data.match("^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")) {
            this.update(data, elem);
        }
    }

    updateStr(data, elem) {
        if (typeof(data) === "string" && data !== "null") {
            this.update(data, elem);
        }
    }

    // calculates the average of a set of int numbers
    avg(arr){
        var sum = 0;
        for( var i = 0; i < arr.length; i++ ){
            sum += parseInt( arr[i], 10 ); //don't forget to add the base
        }
        return (sum/arr.length).toFixed(2);
    }

    // calculates the average of 3 upcoming numbers and update them
    updateInt(data, elem) {
        if(!(this.avgIntData.hasOwnProperty(elem))){
            this.avgIntData[`${elem}`] = [];
        }
    
        if (typeof(data) === "number" && data !== "null") {
            this.avgIntData[`${elem}`].push(data);
            if(this.avgIntData[`${elem}`].length === 3){
                let avgdata = this.avg(this.avgIntData[`${elem}`]);
                this.update(parseInt(avgdata,10), elem);
                this.avgIntData[`${elem}`] = [];
            }
        } 
    }

    update(data, elem) {
        if (data !== null && data !== this[elem]) {
            this[elem] = data;
            this.updated.push(elem)
        }
    }

    updateVideo(video_uid, video_data, key) {
        if(video_data) {
            let index = video_uid + "_" + key;
            if(!this.j_v[index] || this.j_v[index] !== video_data)
            {
                this.j_v[index] = video_data;
                this.updatedVideos.push(index);
            }
        }
    }

    get() {
        let data = {};
        this.updated.forEach((update) => {
            data[update] = this[update];
        })

        if (this.updatedVideos.length > 0) {
            data.j_v = {};
            this.updatedVideos.forEach((update) => {
                data.j_v[update] = this.j_v[update];
            })
            this.updatedVideos = [];
        }
        this.updated = []

        return data;
    }
}

let jitsi_meet_buffer = new jitsi_meet_data();

startCollector();
// setTimeout(pushStats, 3000);

function getStaticId() {
    if (!staticId) {
        // https://stackoverflow.com/a/2117523
        staticId = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
        localStorage.setItem('staticUserId', staticId);
    }
    return staticId;
}

function startCollector() {
    if (APP.conference._room) {
        return setTimeout(logger, 1000);
    }
    setTimeout(startCollector, 500);
}

function logger() {
    jitsi_meet_infos.conf = APP.conference.roomName;

    collectBrowserInfos();
    pushStats();

    events.forEach(event => APP.conference._room.on(event, data => eventDispatcher(data, event)))
}

// it update stats every occured event (every 10 sec) and push them every 3 events (30 sec in our case)
function eventDispatcher(data, event) { //FIXME : changer le nom de cette fonction pour éviter les confusions
    if(pushCondition === 3){
        pushStats();
        pushCondition = 0;
    }
    
    if (!data) return //TODO : je n'ai pas compris cette ligne

    try { //FIXME : supprimer ce try catch s'il ne fait rien
        JSON.stringify(data)
    } catch (error) {
        return
    }

    if(event === "cq.local_stats_updated"){
        updateStats(data);
        pushCondition++ ;
    }
}

function collectBrowserInfos() {
    let browser = BrowserDetect.browser + " " + BrowserDetect.version;
    let os = BrowserDetect.OS;
    jitsi_meet_buffer.update(browser, "j_br");
    jitsi_meet_buffer.update(os, "j_os");
}

// update stats receives data and update each corresponding parameter in the class
function updateStats(stats) {
    if (stats.serverRegion) {
        jitsi_meet_buffer.updateStr(stats.serverRegion, "j_sr")
    }

    if (stats.connectionQuality) {
        jitsi_meet_buffer.updateInt(stats.connectionQuality, "j_cq")
    }

    if (stats.bandwidth) {
        jitsi_meet_buffer.updateInt(stats.bandwidth.upload, "j_u_bw");
        jitsi_meet_buffer.updateInt(stats.bandwidth.download, "j_d_bw");
    }

    if (stats.bitrate) {
        if (stats.bitrate.video) {
            jitsi_meet_buffer.updateInt(stats.bitrate.video.upload, "j_u_vb");
            jitsi_meet_buffer.updateInt(stats.bitrate.video.download, "j_d_vb");
        }
        if (stats.bitrate.audio) {
            jitsi_meet_buffer.updateInt(stats.bitrate.audio.upload, "j_u_ab");
            jitsi_meet_buffer.updateInt(stats.bitrate.audio.download, "j_d_ab");
        }
    }

    if (stats.pcketLoss) {
        jitsi_meet_buffer.updateInt(stats.packetLoss.upload, "j_u_pl");
        jitsi_meet_buffer.updateInt(stats.packetLoss.download, "j_d_pl");
    }

    if (stats.transport) {
        
        let transport = stats.transport[0];
        jitsi_meet_buffer.updateIP(transport.ip.split(":")[0], "j_t_ip");
        jitsi_meet_buffer.updateStr(  transport.ip.split(":")[1], "j_t_p");
        jitsi_meet_buffer.updateStr(  transport.type                    , "j_t_tp");
        jitsi_meet_buffer.updateIP(transport.localip.split(":")[0]   , "j_t_lip");
        jitsi_meet_buffer.updateStr(  transport.localip.split(":")[1]  , "j_t_lp");
    }

    if (stats.resolution && Object.keys(stats.resolution).length > 0) {
        Object.entries(stats.resolution).forEach(([video_uid, value]) => {

            let video_data = value[Object.keys(value)[0]];

            jitsi_meet_buffer.updateVideo(video_uid, video_data["width"], "w")
            jitsi_meet_buffer.updateVideo(video_uid, video_data["height"], "h")
        })
    }
    if (stats.framerate && Object.keys(stats.framerate).length > 0) {
        Object.entries(stats.framerate).forEach(([video_uid, value]) => {

            let video_data = value[Object.keys(value)[0]];
            jitsi_meet_buffer.updateVideo(video_uid, video_data["framerate"], "f")
        })
    }
}

// format_data is function that format data received from jitsi-meet
const format_data = (data) => {
    let formated_data = {
        u: {},
        d: {},
        t: {},
    };
    for(let key in data){
        let split_key_array = key.split("_");
        if(split_key_array.includes("j")){
            if(split_key_array.length === 2 && split_key_array[1] != "v"){
                formated_data[split_key_array[1]] = data[key];
            }

            if(split_key_array.length === 3){
                formated_data[split_key_array[1]][split_key_array[2]] = data[key];
            }
        }
    }
    for(let key in formated_data){
        if(typeof formated_data[key] === 'object'){
            if(Object.keys(formated_data[key]).length === 0){
                let {[key]: removed, ...rest} = formated_data;
                formated_data = rest;
            }
        }  
    }
    return {uid: data.uid, conf: data.conf, m: formated_data};
}

// pushStats is a function that pushes formated changed data to the specified url source
function pushStats() {
    let update = jitsi_meet_buffer.get();
    if (Object.keys(update).length > 0) {
        update.uid = jitsi_meet_infos.uid;
        update.conf = jitsi_meet_infos.conf;
        fetch(url, {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify(format_data(update))
        }).catch((e) => {});
    }
}

// https://gist.github.com/Fl0pZz/ade793a5cd082161cf94194467178033
var BrowserDetect = { //TODO : Etudier l'existant pour savoir si c'est compatible avec tous les browsers + etudier la possibilité de le remplacer avec https://github.com/faisalman/ua-parser-js
    init: function (userAgent, appVersion) {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(userAgent) || this.searchVersion(appVersion) || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) !== -1) {
                    return data[i].identity;
                }
            } else if (dataProp) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) return;
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    },
    dataBrowser: [{
        string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
    }, {
        string: navigator.userAgent,
        subString: "OmniWeb",
        versionSearch: "OmniWeb/",
        identity: "OmniWeb"
    }, {
        string: navigator.vendor,
        subString: "Apple",
        identity: "Safari",
        versionSearch: "Version"
    }, {
        prop: window.opera,
        identity: "Opera",
        versionSearch: "Version"
    }, {
        string: navigator.vendor,
        subString: "iCab",
        identity: "iCab"
    }, {
        string: navigator.vendor,
        subString: "KDE",
        identity: "Konqueror"
    }, {
        string: navigator.userAgent,
        subString: "Firefox",
        identity: "Firefox"
    }, {
        string: navigator.vendor,
        subString: "Camino",
        identity: "Camino"
    }, { // for newer Netscapes (6+)
        string: navigator.userAgent,
        subString: "Netscape",
        identity: "Netscape"
    }, {
        string: navigator.userAgent,
        subString: "MSIE",
        identity: "Explorer",
        versionSearch: "MSIE"
    }, {
        string: navigator.userAgent,
        subString: "Trident",
        identity: "Explorer",
        versionSearch: "rv"
    }, {
        string: navigator.userAgent,
        subString: "Edge",
        identity: "Edge"
    }, {
        string: navigator.userAgent,
        subString: "Gecko",
        identity: "Mozilla",
        versionSearch: "rv"
    }, { // for older Netscapes (4-)
        string: navigator.userAgent,
        subString: "Mozilla",
        identity: "Netscape",
        versionSearch: "Mozilla"
    }],
    dataOS: [{
        string: navigator.platform,
        subString: "Win",
        identity: "Windows"
    }, {
        string: navigator.platform,
        subString: "Mac",
        identity: "Mac"
    }, {
        string: navigator.userAgent,
        subString: "iPhone",
        identity: "iPhone/iPod"
    }, {
        string: navigator.platform,
        subString: "Linux",
        identity: "Linux"
    }]

};

BrowserDetect.init(navigator.userAgent, navigator.appVersion);