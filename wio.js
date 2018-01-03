/* 
 * This is the Wio module for interacting with Wio board and system
 *
 * Author: Raymond Xie, yuhua.xie@oracle.com. 
 * Date: 12/26/2017
 */

const log = require('npmlog')
// const wioRest = require('./sensor-config.js').wio_iot;
// const wioClient = require('node-wio-link')(wioRest.location)

const streamDelay = 100;    // default stream interval: 100ms
const location = 'us';      // default Wio server location
var streams = {};

function WioNode(opts) {
    if (typeof opts == 'undefined') 
        opts = {}

    console.log("called constructor")

    if (typeof opts.debug != 'underfined')
        this.debugMode = opts.debug
    else 
        this.debugMode = false

    if (typeof opts.token !== 'underfined') {
        this.restToken = opts.token
    }
    else {
        throw new Error('You must specify the access-token to Wio REST server')
    }

    if (typeof opts.location !== 'underfined')
        this.serverLocation = opts.location
    else 
        this.serverLocation = location

    this.wioBoard = require('node-wio-link')(this.serverLocation)
}

// WioNode.prototype = new WioNode();

WioNode.prototype.debug = function(msg) {
    if (this.debugMode)
        log.info('WinNode: ', msg)
}

/* 
 * write data to sensor connected on a connector
 * connector: which connector is the sensor connected
 * action: what action or property
 * details: actual data value to set or change
 */ 
WioNode.prototype.write = function(callback, connector, action, ...details) {
    this.debug(Object.values(arguments));

    this.wioBoard.node.write(this.restToken, connector, action, ...details)
        .then(function(data) {
            console.log(data)
            callback(data, null);
        })
        .catch(function(error) {
            console.log(error)
            callback(null, error);
        });
};

/* 
 * read a sensor value from a particular connector
 * connector: which connector is the sensor connected
 * property: which data property to read. For example: Temperature & Humidity sensor may have "temperature" and "humidity" properties
 */
WioNode.prototype.read = function(callback, connector, property) {
    this.wioBoard.node.read(this.restToken, connector, property)
        .then(function(data) {
            console.log(data)
            callback(data, null);
        })
        .catch(function(error) {
            console.log(error)
            callback(null, error);
        });
}

/* 
 * pull a sensor value from a particular connector, at a set schedule
 * connector: which connector is the sensor connected
 * property: which data property to read. For example: Temperature & Humidity sensor may have "temperature" and "humidity" properties
 */
WioNode.prototype.stream = function(connector, property, delay, callback) {
    var self = this;
    var interval = typeof delay == 'undefined' ? streamDelay : delay

    this.stopStream(connector, property);

    var streamId = setInterval( function() {
        self.read(callback, connector, property);
    }, interval);

    streams[connector+property] = streamId;

    return streamId;
}

/**
 *
 */
WioNode.prototype.stopStream = function(connector, property) {
    console.log("stopSteam");
    if( streams[connector+property] !== 'undefined' || streams[connector+property] !== null ) {
        clearInterval( streams[connector+property] );
        streams[connector+property] = null;
        console.log("stopped stream");
    }
}


/*
 * put the board into sleep mode
 * amount: number of second to sleep
 */
WioNode.prototype.sleep = function(amount) {
    this.wioBoard.node.sleep(wioRest.token, amount)   
        .then(function(data) {
            console.log(data)
        })
        .catch(function(error) {
            console.log(error)
        });
}

module.exports = WioNode;
