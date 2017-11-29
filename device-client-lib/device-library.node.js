/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

(function () {
var name = 'iotcs';
function init(lib) {
'use strict';
//START///////////////////////////////////////////////////////////////////////

    /**
     * @global
     * @alias iotcs
     * @namespace
     */
    lib = lib || {};
    
    /**
     * @property {string} iotcs.name - the short name of this library
     */
    try {
        lib.name = lib.name || "iotcs";
    } catch(e) {}
    
    /**
     * @property {string} iotcs.description - the longer description
     */
    lib.description = "Oracle IoT Cloud Device Client Library";

    /**
     * @property {string} iotcs.version - the version of this library
     */
    lib.version = "1.1";

    /**
     * Log an info message
     * @function 
     */
    lib.log = function (msg) {
        if (lib.debug) {
            _log('info', msg);
        }
    };

    /**
     * Throw and log an error message
     * @function 
     */
    lib.error = function (msg) {
        if (lib.debug && console.trace) {
            console.trace(msg);
        }
        _log('error', msg);
        throw '[iotcs:error] ' + msg;
    };

    /**
     * Log and return an error message
     * @function
     */
    lib.createError = function (msg, error) {
        if (lib.debug && console.trace) {
            console.trace(msg);
        }
        _log('error', msg);
        if (!error) {
            return new Error('[iotcs:error] ' + msg);
        }
        return error;
    };

    /** @ignore */
    function _log(level, msg) {
        var msgstr = '[iotcs:'+level+'] ' + msg;
        console.log(msgstr);
    }
    
//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////
// file: library/device/@overview.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 *
 * @overview
 *
 * The device and enterprise client libraries simplify working with the Oracle IoT Cloud Service.
 * These client libraries are a low–level abstraction over top of messages and REST APIs.
 * Device clients are primarily concerned with sending data and alert messages to the cloud service,
 * and acting upon requests from the cloud service. Enterprise clients are primarily concerned
 * with monitor and control of device endpoints.
 *
 * <h2>Configuration</h2>
 *
 * The client must have a configuration in order to communicate with the cloud service.
 * This configuration includes the IoT Cloud Service host, the identifier of the device
 * or enterprise integration the client represents, and the shared secret of the device
 * or enterprise integration.
 * <p>
 * The configuration is created by using the provisioner tool: provisioner.js. This tool
 * creates a file that is used when running the client application. Usage is available
 * by running the tool with the -h argument.
 *
 * <h2>Device and Enterprise Clients</h2>
 *
 * Prerequisites:<br>
 * - Register your device and/or enterprise application with the Cloud Service.<br>
 * - Provision the device with the credentials obtained from above.<br>
 * - Optionally provision the device model.<br>
 *
 * @example <caption>Device Client Quick Start</caption>
 *
 * //The following steps must be taken to run a device-client application.
 * //The example shows a GatewayDevice. A DirectlyConnectedDevice is identical,
 * //except for registering indirectly-connected devices.
 *
 * // 1. Initialize device client
 *
 *      var gateway = new iotcs.device.GatewayDeviceUtil(configurationFilePath, password);
 *
 * // 2. Activate the device
 *
 *      if (!gateway.isActivated()) {
 *          gateway.activate(['urn:oracle:iot:device:default'], function (device, error) {
 *              if (!device || error) {
 *                  //handle activation error
 *              }
 *          });
 *
 * // 3. Register indirectly-connected devices
 *
 *      gateway.registerDevice(hardwareId,
 *          {serialNumber: 'someNumber',
 *          manufacturer: 'someManufacturer',
 *          modelNumber: 'someModel'}, ['urn:myModel'],
 *          function (response, error) {
 *              if (!response || error) {
 *                  //handle enroll error
 *              }
 *              indirectDeviceId = response;
 *          });
 *
 * // 4. Register handler for attributes and actions
 *
 *      var messageDispatcher = new iotcs.device.util.MessageDispatcher(gateway);
 *      messageDispatcher.getRequestDispatcher().registerRequestHandler(id,
 *          'deviceModels/urn:com:oracle:iot:device:humidity_sensor/attributes/maxThreshold',
 *          function (requestMessage) {
 *              //handle attribute update and validation
 *              return iotcs.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', '');
 *          });
 *
 * // 5. Send data from the indirectly-connected device
 *
 *      var message = new iotcs.message.Message();
 *      message
 *          .type(iotcs.message.Message.Type.DATA)
 *          .source(indirectDeviceId)
 *          .format('urn:com:oracle:iot:device:humidity_sensor' + ":attributes");
 *      message.dataItem('humidity', sensor.humidity);
 *      message.dataItem('maxThreshold', sensor.maxThreshold);
 *      messageDispatcher.queue(message);
 *
 * // 6. Dispose the device client
 *
 *      gateway.close();
 *
 * @example <caption>Enterprise Client Quick Start</caption>
 *
 * //The following steps must be taken to run an enterprise-client application.
 *
 * // 1. Initialize enterprise client
 *
 *      iotcs.enterprise.EnterpriseClient.newClient(applicationName, function (client, error) {
 *          if (!client || error) {
 *              //handle client creation error
 *          }
 *          ec = client;
 *      });
 *
 * // 2. Select a device
 *
 *      ec.getActiveDevices('urn:myModelUrn').page('first').then(function(response, error){
 *          if (!response || error) {
 *              //handle get device model error
 *          }
 *          if(response.items){
 *              response.items.forEach(function(item){
 *                  //handle select of an item as a device
 *                  device = item;
 *              });
 *          }
 *      });
 *
 * // 3. Monitor a device
 *
 *      messageEnumerator = new iotcs.enterprise.MessageEnumerator(ec);
 *      messageEnumerator.setListener(device.id, 'ALERT', function (items) {
 *          items.forEach(function(item) {
 *              //handle each item as a message received from the device
 *          });
 *      });
 *
 * // 4. List the resources of a device
 *
 *      resourceEnumerator = new iotcs.enterprise.ResourceEnumerator(ec, device.id);
 *      resourceEnumerator.getResources().page('first').then(function (response){
 *              response.items.forEach(function(item){
 *                  //handle each item as a resource
 *              });
 *      }, function (error) {
 *          //handle error on enumeration
 *      });
 *
 * // 5. Dispose the enterprise client
 *
 *      ec.close();
 *
 */


//////////////////////////////////////////////////////////////////////////////
// file: library/device/@globals.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * @namespace
 * @alias iotcs.device
 * @memberOf iotcs
 */
lib.device = {};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
lib.oracle = lib.oracle || {};

/** @ignore */
lib.oracle.iot = lib.oracle.iot || {};

/** @ignore */
lib.oracle.iot.client = lib.oracle.iot.client || {};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
lib.oracle.iot.client.httpConnectionTimeout = lib.oracle.iot.client.httpConnectionTimeout || 15000;

/** @ignore */
lib.oracle.iot.client.monitor = lib.oracle.iot.client.monitor || {};

/** @ignore */
lib.oracle.iot.client.monitor.pollingInterval = lib.oracle.iot.client.monitor.pollingInterval || 1000;

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
lib.oracle.iot.client.device = lib.oracle.iot.client.device || {};

/** @ignore */
lib.oracle.iot.client.device.disableLongPolling = lib.oracle.iot.client.device.disableLongPolling || false;

/** @ignore */
lib.oracle.iot.client.device.longPollingTimeoutOffset = lib.oracle.iot.client.device.longPollingTimeoutOffset || 100;

/** @ignore */
lib.oracle.iot.client.device.allowDraftDeviceModels = lib.oracle.iot.client.device.allowDraftDeviceModels || false;

/** @ignore */
lib.oracle.iot.client.device.requestBufferSize = lib.oracle.iot.client.device.requestBufferSize || 4192;

/** @ignore */
lib.oracle.iot.client.device.maximumMessagesToQueue = lib.oracle.iot.client.device.maximumMessagesToQueue || 1000;

/** @ignore */
lib.oracle.iot.client.device.maximumMessagesPerConnection = lib.oracle.iot.client.device.maximumMessagesPerConnection || 100;

/** @ignore */
lib.oracle.iot.client.device.defaultMessagePoolingInterval = lib.oracle.iot.client.device.defaultMessagePoolingInterval || 3000;

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
lib.oracle.iot.tam = lib.oracle.iot.tam || {};

/** @ignore */
lib.oracle.iot.tam.store = lib.oracle.iot.tam.store || './trustedAssetsStore.json';

/** @ignore */
lib.oracle.iot.tam.storePassword = lib.oracle.iot.tam.storePassword || null;

//////////////////////////////////////////////////////////////////////////////
// file: library/shared/$port-node.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/** @ignore */
var $port = lib.$port || {};

if (lib.debug) {
    lib.$port = $port;
}

var _b2h = (function () {
    var r = [];
    for (var i=0; i<256; i++) {
        r[i] = (i + 0x100).toString(16).substr(1);
    }
    return r;
})();

// pre-requisites (internal to lib)
var forge = require('node-forge');

// pre-requisites (internal to $port);
var os = require('os');
var https = require('https');
var querystring = require('querystring');
var fs = require('fs');

var spawn = require('child_process').spawnSync;
/**
 * This method is used for retrieving disk space information. It uses OS specific
 * utility commands, so it is very OS specific implementation. Also because handling
 * of external processes executed with spawn is not good, the timeout and try/catch
 * is used and if any error occurs -1 value is returned for each info.
 * 
 * @ignore
 */
var _getDiskSpace = function() {
    var diskSpace = {
        freeDiskSpace: -1,
        totalDiskSpace: -1
    };
    try {
        if (os.platform() === 'win32') {
            var prc1 = spawn('wmic', ['LogicalDisk', 'Where', 'DriveType="3"', 'Get', 'DeviceID,Size,FreeSpace'], {timeout: 1000});
            var str1 = prc1.stdout.toString();
            var lines1 = str1.split(/(\r?\n)/g);
            lines1.forEach(function (line) {
                if (line.indexOf(__dirname.substring(0, 2)) > -1) {
                    var infos = line.match(/\d+/g);
                    diskSpace.totalDiskSpace = infos[1];
                    diskSpace.freeDiskSpace = infos[0];
                }
            });
        } else if (os.platform() === 'linux') {
            var prc2 = spawn('df', [__dirname], {timeout: 1000});
            var str2 = prc2.stdout.toString();
            str2 = str2.replace(/\s/g,'  ');
            var infos = str2.match(/\s\d+\s/g);
            diskSpace.freeDiskSpace = parseInt(infos[2]);
            diskSpace.totalDiskSpace = (parseInt(infos[1]) + parseInt(infos[2]));
        }
    } catch (e) {
        //just ignore
    }
    return diskSpace;
};

var tls = require('tls');
tls.checkServerIdentity = function (host, cert) {
    var cn = cert.subject.CN;
    if (cn.startsWith('*.')) {
        var i = host.indexOf('.');
        if (i > 0) {
            host = host.substring(i);
        }
        cn = cn.substring(1);
    }
    if (cn === host) {
        return;
    } else {
        lib.error('SSL host name verification failed');
    }
};

// implement porting interface

$port.userAuthNeeded = function () {
    return false;
};

$port.os = {};

$port.os.type = function () {
    return os.type();
};

$port.os.release = function () {
    return os.release();
};

$port.https = {};

$port.https.req = function (options, payload, callback) {

    if (options.tam
        && (typeof options.tam.getTrustAnchorCertificates === 'function')
        && Array.isArray(options.tam.getTrustAnchorCertificates())
        && (options.tam.getTrustAnchorCertificates().length > 0)) {
        options.ca = options.tam.getTrustAnchorCertificates();
    }

    options.rejectUnauthorized = true;
    options.protocol = options.protocol + ':';
    options.agent = false;

    if ((options.method !== 'GET') && ((options.path.indexOf('attributes') > -1) || (options.path.indexOf('actions') > -1))) {
        options.headers['Content-Length'] = payload.length;
    }

    var req = https.request(options, function (response) {

        //console.log(response.statusCode + ' ' + response.statusMessage);

        // Continuously update stream with data
        var body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            // Data reception is done, do whatever with it!
            //console.log('BODY: '+body);
            if ((response.statusCode === 200) || (response.statusCode === 202)) {
                if (response.headers && (typeof response.headers['x-min-acceptbytes'] !== 'undefined')
                    && (response.headers['x-min-acceptbytes'] !== '') && (response.headers['x-min-acceptbytes'] !== 0)){
                    callback(JSON.stringify({'x-min-acceptbytes': response.headers['x-min-acceptbytes']}));
                } else {
                    callback(body);

                }
            } else {
                var error = new Error(JSON.stringify({statusCode: response.statusCode, statusMessage: response.statusMessage, body: body}));
                callback(body, error);
            }
        });
    });
    if (options.path.indexOf('iot.sync') < 0) {
        req.setTimeout(lib.oracle.iot.client.httpConnectionTimeout);
    } else if (options.path.indexOf('iot.timeout=') > -1) {
        var timeout = parseInt(options.path.substring(options.path.indexOf('iot.timeout=') + 12));
        req.setTimeout(timeout * 1000 + lib.oracle.iot.client.device.longPollingTimeoutOffset);
    }
    req.on('timeout', function () {
        callback(null, new Error('connection timeout'));
    });
    req.on('error', function(error) {
        callback(null, error);
    });
    req.write(payload);
    req.end();
};

$port.file = {};

$port.file.store = function (path, data) {
    try {
        fs.writeFileSync(path, data, {encoding:'binary'});
    } catch (e) {
        lib.error('could not store file "'+path+'"');
    }
};

$port.file.exists = function (path) {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
};

$port.file.load = function (path) {
    var data = null;
    try {
        var tmp = fs.readFileSync(path, {encoding:'binary'});
        var len = tmp.length;
        data = '';
        for (var i=0; i<len; i++) {
            data += tmp[i];
        }
    } catch (e) {
        lib.error('could not load file "'+path+'"');
        return;
    }
    return data;
};

$port.file.append = function (path, data) {
    try {
        fs.appendFileSync(path, data);
    } catch (e) {
        lib.error('could not append to file "'+path+'"');
    }
};

$port.file.remove = function (path) {
    try {
        fs.unlinkSync(path);
    } catch (e) {
        lib.error('could not remove file "'+path+'"');
    }
};

$port.util = {};

$port.util.rng = function (count) {
    var b = forge.random.getBytesSync(count);
    var a = new Array(count);
    for (var i=0; i<count; i++) {
        a[i] = b[i].charCodeAt(0);
    }
    return a;
};

/*@TODO: this implementation is erroneous: leading '0's are sometime missing. => please use exact same implementation as $port-browser.js (it is anyway based on $port.util.rng()) + import _b2h @DONE
*/
$port.util.uuidv4 = function () {
    var r16 = $port.util.rng(16);
    r16[6]  &= 0x0f;  // clear version
    r16[6]  |= 0x40;  // set to version 4
    r16[8]  &= 0x3f;  // clear variant
    r16[8]  |= 0x80;  // set to IETF variant
    var i = 0;
    var uuid = _b2h[r16[i++]] + _b2h[r16[i++]] + _b2h[r16[i++]] + _b2h[r16[i++]] + '-' +
        _b2h[r16[i++]] + _b2h[r16[i++]] + '-' +
        _b2h[r16[i++]] + _b2h[r16[i++]] + '-' +
        _b2h[r16[i++]] + _b2h[r16[i++]] + '-' +
        _b2h[r16[i++]] + _b2h[r16[i++]] + _b2h[r16[i++]] +
        _b2h[r16[i++]] + _b2h[r16[i++]] + _b2h[r16[i++]];
    return uuid;
};

$port.util.btoa = function (str) {
    return new Buffer(str).toString('base64');
};

$port.util.atob = function (str) {
    return new Buffer(str, 'base64').toString();
};

$port.util.diagnostics = function () {
    var obj = {};
    obj.version = (process.env['oracle.iot.client.version'] || 'Unknown');
    var net = os.networkInterfaces();
    var space = _getDiskSpace();
    obj.freeDiskSpace = space.freeDiskSpace;
    obj.totalDiskSpace = space.totalDiskSpace;
    obj.ipAddress = 'Unknown';
    obj.macAddress = 'Unknown';
    var netInt = null;
    for (var key in net) {
        if ((key !== 'lo') && (key.indexOf('Loopback') < 0) && (net[key].length > 0)) {
            netInt = net[key][0];
            break;
        }
    }
    if (netInt && netInt.address) {
        obj.ipAddress = netInt.address;
    }
    if (netInt && netInt.mac) {
        obj.macAddress = netInt.mac;
    }
    return obj;
};

$port.util.query = {};

$port.util.query.escape = function (str) {
    return querystring.escape(str);
};

$port.util.query.unescape = function (str) {
    return querystring.unescape(str);
};

$port.util.query.parse = function (str, sep, eq, options) {
    return querystring.parse(str, sep, eq, options);
};

$port.util.query.stringify = function (obj, sep, eq, options) {
    return querystring.stringify(obj, sep, eq, options);
};

/*@TODO: check that Promise are actually supported! either try/catch or if (!Promise) else lib.error ...
*/
$port.util.promise = function(executor){
    return new Promise(executor);
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/$port-mqtt.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */
$port.mqtt = {};

$port.mqtt.initAndReconnect = function (tam, callback, disconnectCallback, messageHandler) {

    var connectOptions = {};

    var id = (tam.isActivated() ? tam.getEndpointId() : tam.getClientId());

    connectOptions.host = tam.getServerHost();
    connectOptions.port = tam.getServerPort();
    connectOptions.protocol = 'mqtts';
    connectOptions.rejectUnauthorized = true;

    if ((typeof tam.getTrustAnchorCertificates === 'function')
        && Array.isArray(tam.getTrustAnchorCertificates())
        && (tam.getTrustAnchorCertificates().length > 0)) {
        connectOptions.ca = tam.getTrustAnchorCertificates();
    }

    connectOptions.clientId = id;
    connectOptions.username = id;
    connectOptions.password = tam.buildClientAssertion();

    if (!connectOptions.password) {
        callback(null, lib.createError('error on generating oauth signature'));
        return;
    }

    connectOptions.clean = true;
    connectOptions.connectTimeout = 30 * 1000;
    connectOptions.reconnectPeriod = 60 * 1000;

    var client = require('mqtt').connect(connectOptions);

    client.on('error', function (error) {
        callback(null, error);
    });

    client.on('connect', function (connack) {
        callback(client);
    });

    client.on('close', function () {
        disconnectCallback();
    });

    client.on('message', function (topic, message, packet) {
        messageHandler(topic, message);
    });

};

$port.mqtt.subscribe = function (client, topics, callback) {
    client.subscribe(topics, function (err, granted) {
        if (err && (err instanceof Error)) {
            callback(lib.createError('error on topic subscription: ' + topics.toString(), err));
            return;
        }
        callback();
    });
};

$port.mqtt.unsubscribe = function (client, topics) {
    client.unsubscribe(topics);
};

$port.mqtt.publish = function (client, topic, message, waitForResponse, callback) {
    var qos = (waitForResponse ? 1 : 0);
    client.publish(topic, message, {qos: qos, retain: false}, function (err) {
        if (err && (err instanceof Error)) {
            callback(err);
            return;
        }
        callback();
    });
};

$port.mqtt.close = function (client, callback) {
    client.end(true, callback);
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/$impl.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/** @ignore */
var $impl = {};

if (lib.debug) {
    lib.$impl = $impl;
}

/** @ignore */
$impl.https = $impl.https || {};

//@TODO: Default TAM Integration
/** @ignore */
$impl.https.req = $impl.https.req || function (options, payload, callback) {
    if (!$impl.tam && !(options.tam)) {
        _initTAM(function () {
            _httpsTAMReq(options, payload, callback);
        });
    } else {
        _httpsTAMReq(options, payload, callback);
    }
};

function _initTAM (callback) {
    if (lib.oracle.iot.tam.store && (typeof window !== 'undefined') && location.hostname && location.protocol) {
        var i = location.protocol.indexOf(':');
        var protocol = (i<0) ? location.protocol : location.protocol.substring(0, i);
        $port.https.req({
            method: 'GET',
            path: lib.oracle.iot.tam.store,
            protocol: protocol,
            hostname: location.hostname,
            port: location.port
        }, '', function(response) {
            $port.file.store(lib.oracle.iot.tam.store, response);
            $impl.tam = new lib.enterprise.TrustedAssetsManager();
            callback();
        }, false);
    } else {
        $impl.tam = (lib.enterprise ? new lib.enterprise.TrustedAssetsManager() : new lib.device.TrustedAssetsManager());
        callback();
    }
}

/** @ignore */
function _httpsTAMReq (options, payload, callback) {

    var basePath = null;
    var testPath = null;

    if (options.path.indexOf($impl.reqroot) > -1) {
        basePath = $impl.reqroot;
        testPath = (lib.oracle.iot.client.test ? lib.oracle.iot.client.test.reqroot : null);
    } else if (lib.oracle.iot.client.test && (options.path.indexOf(lib.oracle.iot.client.test.reqroot) > -1)) {
        basePath = lib.oracle.iot.client.test.reqroot;
    }

    // @TODO: Better way of handling links
    if(options.path && ((options.path.indexOf('http:') === 0) || (options.path.indexOf('https:') === 0))){
        options.path = options.path.substring(options.path.indexOf(basePath));
    }

    var _opt = {};
    var oracleIoT = true;
    if (!(options.tam)) {
        options.tam = $impl.tam;
    }
    if (options.tam) {
        _opt.protocol = 'https';
        _opt.hostname = options.tam.getServerHost();
        _opt.port = options.tam.getServerPort();
    } else if (typeof location !== 'undefined') {
        if (location.protocol) {
            var i = location.protocol.indexOf(':');
            _opt.protocol = (i<0) ? location.protocol : location.protocol.substring(0, i);
        }
        if (location.hostname) {
            _opt.hostname = location.hostname;
        }
        if (location.port) {
            _opt.port = location.port;
        }
        oracleIoT = false;
    }
    _opt.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    //@TODO: Remove basic auth; only for tests and test server
    //@TODO: (jy) use lib.debug if this configuration is really/always needed for tests ...
    if (lib.oracle.iot.client.test && lib.oracle.iot.client.test.auth.activated) {
        _opt.protocol = lib.oracle.iot.client.test.auth.protocol;
        _opt.headers.Authorization = 'Basic ' + $port.util.btoa(lib.oracle.iot.client.test.auth.user + ':' + lib.oracle.iot.client.test.auth.password);
        if (testPath) {
            options.path = options.path.replace(basePath, testPath);
        }
    }

    for (var key in options) {
        if (key === 'headers') {
            for (var header in options.headers) {
                if (options.headers[header] === null) {
                    delete _opt.headers[header];
                } else {
                    _opt.headers[header] = options.headers[header];
                }
            }
        } else {
            _opt[key] = options[key];
        }
    }

    $port.https.req(_opt, payload, function(response_body, error) {
        if (!response_body || error) {
            callback(null, error);
            return;
        }
        var response_json = null;
        try {
            response_json = JSON.parse(response_body);
        } catch (e) {

        }
        if (!response_json || (typeof response_json !== 'object')) {
            callback(null, lib.createError('response not JSON'));
            return;
        }
        callback(response_json);
    }, oracleIoT);
}


//////////////////////////////////////////////////////////////////////////////

/** @ignore */
function _mandatoryArg(arg, types) {
    if (!arg) {
        lib.error('missing argument');
        return;
    }
    __checkType(arg, types);
}

/** @ignore */
function _optionalArg(arg, types) {
    if (!arg) {
        return;
    }
    __checkType(arg, types);
}

/** @ignore */
//@TODO: [v2] (?) increase check on 'number' with parseInt()!==NaN ?? 
//@TODO: [v2] add support for {'array':'type'}
function __isArgOfType(arg, type) {
    switch(typeof(type)) {
    case 'function':
    case 'object':
        return (arg instanceof type);
    case 'string':
        return (type==='array')
            ? Array.isArray(arg)
            : (typeof(arg) === type);
    default:
    }
    return false;
}

/** @ignore */
function __checkType(arg, types) {
    var argType = typeof(arg);
    if (Array.isArray(types)) {
        var nomatch = types.every(function(type) { return !__isArgOfType(arg, type); });
        if (nomatch) {
            lib.log('type mismatch: got '+argType+' but expecting any of '+types+')');
            lib.error('illegal argument type');
            return;
        }
        return;
    }
    if (!__isArgOfType(arg, types)) {
        lib.log('type mismatch: got '+argType+' but expecting '+types+')');
        lib.error('illegal argument type');
        return;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/MqttController.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

$impl.mqtt = $impl.mqtt || {};

function _addArrayCallback(array, callback) {
    if (Array.isArray(array)
        && (typeof callback === 'function')) {
        array.push(callback);
    }
}

function _callArrayCallback(array, messages, error) {
    if (Array.isArray(array)
        && (array.length > 0)
        && (typeof array[0] === 'function')) {
        array.splice(0, 1)[0](messages, error);
    }
}

$impl.mqtt.MqttController = function (tam, topicsGenerator) {

    this.callbacks = [];
    this.apiHandlers = {};
    this.errorHandlers = {};
    this.staticApiHandlers = {};
    this.topicsGenerator = topicsGenerator;
    this.tam = tam;
    this.connected = false;

    var self = this;

    this.disconnectHandler = function () {
        self.client = null;
        self.connected = false;
    };

    this.messageHandler = function (topic, message) {
        var response_json = null;
        try {
            response_json = JSON.parse(message);
        } catch (e) {

        }
        if (!response_json || (typeof response_json !== 'object')) {
            if (self.staticApiHandlers[topic]) {
                self.staticApiHandlers[topic](null, new Error(message));
            }
            if (self.apiHandlers[topic]) {
                _callArrayCallback(self.apiHandlers[topic], null, new Error(message));
            }
            else if (self.errorHandlers[topic] && self.apiHandlers[self.errorHandlers[topic]]) {
                _callArrayCallback(self.apiHandlers[self.errorHandlers[topic]], null, new Error(message));
            }
            return;
        }
        if (self.staticApiHandlers[topic]) {
            self.staticApiHandlers[topic](response_json);
        }
        if (self.apiHandlers[topic]) {
            _callArrayCallback(self.apiHandlers[topic], response_json);
        }
        else if (self.errorHandlers[topic] && self.apiHandlers[self.errorHandlers[topic]]) {
            _callArrayCallback(self.apiHandlers[self.errorHandlers[topic]], null, new Error(message));
        }
    };

    this.connectHandler = function (client, error) {
        if (!client || error) {
            for (var topic in self.apiHandlers) {
                _callArrayCallback(self.apiHandlers[topic], null, error);
            }
            _callArrayCallback(self.callbacks, null, error);
            return;
        }

        var topicObjects = self.topicsGenerator();

        if (Array.isArray(topicObjects) && (topicObjects.length > 0)) {

            var topics = [];
            topicObjects.forEach(function (topicObject) {
                if (topicObject.responseHandler) {
                    topics.push(topicObject.responseHandler);
                }
                if (topicObject.errorHandler) {
                    self.errorHandlers[topicObject.errorHandler] = topicObject.responseHandler;
                    topics.push(topicObject.errorHandler);
                }
            });

            $port.mqtt.subscribe(client, topics, function (error) {
                if (error) {
                    var err = lib.createError('unable to subscribe', error);
                    for (var topic in self.apiHandlers) {
                        _callArrayCallback(self.apiHandlers[topic], null, err);
                    }
                    for (var topic1 in self.staticApiHandlers) {
                        self.staticApiHandlers[topic1](null, err);
                    }
                    _callArrayCallback(self.callbacks, null, err);
                    return;
                }
                self.client = client;
                self.connected = true;
                _callArrayCallback(self.callbacks, self);
            });
        } else {
            self.client = client;
            self.connected = true;
            _callArrayCallback(self.callbacks, self);
        }
    };

};

$impl.mqtt.MqttController.prototype.connect = function(callback) {
    if (callback) {
        _addArrayCallback(this.callbacks, callback);
    }
    $port.mqtt.initAndReconnect(this.tam, this.connectHandler, this.disconnectHandler, this.messageHandler);
};

$impl.mqtt.MqttController.prototype.disconnect = function(callback) {
    $port.mqtt.close(this.client, callback);
};

$impl.mqtt.MqttController.prototype.isConnected = function() {
    if (!this.client) {
        return false;
    }
    return this.connected;
};

$impl.mqtt.MqttController.prototype.register = function (topic, callback){
    if (callback) {
        this.staticApiHandlers[topic] = callback;
    }
};

$impl.mqtt.MqttController.prototype.req = function (topic, payload, expect, callback) {

    var self = this;

    var request = function(controller, error) {

        if (!controller || error) {
            callback(null, error);
            return;
        }

        if (expect && callback && (typeof callback === 'function')) {
            var tempCallback = null;
            tempCallback = function (message, error) {
                if (!message || error) {
                    callback(null, error);
                    return;
                }
                callback(message);
            };
            if (!self.apiHandlers[expect]) {
                self.apiHandlers[expect] = [];
            }
            _addArrayCallback(self.apiHandlers[expect], tempCallback);
        }

        $port.mqtt.publish(self.client, topic, payload, (callback ? true : false), function (error) {
            if (error && callback) {
                callback(null, error);
                return;
            }
            if (!expect && callback) {
                callback(payload);
            }
        });
    };

    if (!this.isConnected()) {
        this.connect(request);
    } else {
        request(this);
    }
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/$impl-dcl.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/** @ignore */
$impl.reqroot = '/iot/api/v2';

function QueueNode (data) {
    this.data = data;
    this.priority = ['LOWEST','LOW','MEDIUM','HIGH','HIGHEST'].indexOf(data.getJSONObject().priority);
}

// takes an array of objects with {data, priority}
$impl.PriorityQueue = function (maxQueue) {
    this.heap = [null];
    this.maxQueue = maxQueue;
};

$impl.PriorityQueue.prototype = {
    push: function(data) {
        if (this.heap.length === (this.maxQueue + 1)) {
            lib.error('maximum queue number reached');
            return;
        }
        var node = new QueueNode(data);
        this.bubble(this.heap.push(node) -1);
    },

    // removes and returns the data of highest priority
    pop: function() {
        if (this.heap.length === 1) {
            return null;
        }
        if (this.heap.length === 2) {
            return this.heap.pop().data;
        }
        var topVal = this.heap[1].data;
        this.heap[1] = this.heap.pop();
        this.sink(1); return topVal;
    },

    // bubbles node i up the binary tree based on
    // priority until heap conditions are restored
    bubble: function(i) {
        while (i > 1) {
            var parentIndex = i >> 1; // <=> floor(i/2)

            // if equal, no bubble (maintains insertion order)
            if (!this.isHigherPriority(i, parentIndex)) break;

            this.swap(i, parentIndex);
            i = parentIndex;
        }   },

    // does the opposite of the bubble() function
    sink: function(i) {
        while (i*2 < this.heap.length - 1) {
            // if equal, left bubbles (maintains insertion order)
            var leftHigher = !this.isHigherPriority(i*2 +1, i*2);
            var childIndex = leftHigher ? i*2 : i*2 +1;

            // if equal, sink happens (maintains insertion order)
            if (this.isHigherPriority(i,childIndex)) break;

            this.swap(i, childIndex);
            i = childIndex;
        }   },

    // swaps the addresses of 2 nodes
    swap: function(i,j) {
        var temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    },

    // returns true if node i is higher priority than j
    isHigherPriority: function(i,j) {
        return this.heap[i].priority < this.heap[j].priority;
    }
};

$impl.protocolReq = function (options, payload, callback, retryCallback, dcd) {
    if (!options.tam) {
        options.tam = new lib.device.TrustedAssetsManager();
    }
    if (options.tam.getServerScheme && (options.tam.getServerScheme().indexOf('mqtt') > -1)) {
        $impl.mqtt.apiReq(options, payload, callback, retryCallback, dcd);
    } else {
        if (options.path.startsWith($impl.reqroot+'/activation/policy')
            || options.path.startsWith($impl.reqroot+'/activation/direct')
            || options.path.startsWith($impl.reqroot+'/oauth2/token')){
            $impl.https.req(options, payload, callback);
        } else {
            $impl.https.bearerReq(options, payload, callback, retryCallback, dcd);
        }
    }
};

function _mqttControllerInit (dcd) {
    if (!dcd._.mqttController) {
        var getTopics = function () {
            var topics = [];
            var id = dcd._.tam.getClientId();
            if (dcd.isActivated()) {
                id = dcd._.tam.getEndpointId();
                topics.push({
                    responseHandler: 'devices/' + id + '/deviceModels',
                    errorHandler: 'devices/' + id + '/deviceModels/error'
                });
                topics.push({
                    responseHandler: 'devices/' + id + '/messages',
                    errorHandler: 'devices/' + id + '/messages/error'
                });
                topics.push({
                    responseHandler: 'devices/' + id + '/messages/acceptBytes'
                });
                if (dcd._.gateway) {
                    topics.push({
                        responseHandler: 'devices/' + id + '/activation/indirect/device',
                        errorHandler: 'devices/' + id + '/activation/indirect/device/error'
                    });
                }
            } else {
                topics.push({
                    responseHandler: 'devices/' + id + '/activation/policy',
                    errorHandler: 'devices/' + id + '/activation/policy/error'
                });
                topics.push({
                    responseHandler: 'devices/' + id + '/deviceModels',
                    errorHandler: 'devices/' + id + '/deviceModels/error'
                });
                topics.push({
                    responseHandler: 'devices/' + id + '/activation/direct',
                    errorHandler: 'devices/' + id + '/activation/direct/error'
                });
            }
            return topics;
        };
        Object.defineProperty(dcd._, 'mqttController', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: new $impl.mqtt.MqttController(dcd._.tam, getTopics)
        });
    }
}

$impl.protocolRegister = function (path, callback, dcd) {
    if (dcd.isActivated() && dcd._.tam.getServerScheme && (dcd._.tam.getServerScheme().indexOf('mqtt') > -1)) {
        _mqttControllerInit(dcd);
        if (path.startsWith($impl.reqroot+'/messages/acceptBytes')) {
            dcd._.mqttController.register('devices/' + dcd.getEndpointId() + '/messages/acceptBytes', callback);
        } else if (path.startsWith($impl.reqroot+'/messages')) {
            dcd._.mqttController.register('devices/' + dcd.getEndpointId() + '/messages', callback);
        }
    }
};

$impl.mqtt.apiReq = function (options, payload, callback, retryCallback, dcd) {

    var tempCallback = callback;

    var tempCallbackBearer = function (response_body, error) {
        if (error) {
            var exception = null;
            try {
                exception = JSON.parse(error.message);
                if (exception.status && (exception.status === 401)) {
                    dcd._.mqttController.disconnect(retryCallback);
                    return;
                }
            } catch (e) {

            }
        }
        callback(response_body, error);
    };

    function callApi(controller) {
        var id = (dcd.isActivated() ? dcd._.tam.getEndpointId() : dcd._.tam.getClientId());
        var topic = null;
        var expect = null;
        if (options.method === 'GET') {
            if (options.path.startsWith($impl.reqroot+'/activation/policy')) {
                topic = 'iotcs/' + id + '/activation/policy';
                expect = 'devices/' + id + '/activation/policy';
                payload = JSON.stringify({OSName: $port.os.type(), OSVersion: $port.os.release()});
            } else if (options.path.startsWith($impl.reqroot+'/deviceModels')) {
                topic = 'iotcs/' + id + '/deviceModels';
                expect = 'devices/' + id + '/deviceModels';
                tempCallback = tempCallbackBearer;
                payload = JSON.stringify({urn: options.path.substring(options.path.lastIndexOf('/') + 1)});
            }
        } else if (options.method === 'POST') {
            if (options.path.startsWith($impl.reqroot+'/activation/direct')) {
                topic = 'iotcs/' + id + '/activation/direct';
                expect = 'devices/' + id + '/activation/direct';
                tempCallback = function (response_body, error) {
                    if (error) {
                        dcd._.tam.setEndpointCredentials(dcd._.tam.getClientId(), null);
                    }
                    controller.disconnect(function () {
                        callback(response_body, error);
                    });
                };
            } else if (options.path.startsWith($impl.reqroot+'/oauth2/token')) {
                callback({token_type: 'empty', access_token: 'empty'});
                return;
            } else if (options.path.startsWith($impl.reqroot+'/activation/indirect/device')) {
                topic = 'iotcs/' + id + '/activation/indirect/device';
                expect = 'devices/' + id + '/activation/indirect/device';
                tempCallback = tempCallbackBearer;
            } else if (options.path.startsWith($impl.reqroot+'/messages')) {
                expect = 'devices/' + id + '/messages';
                topic = 'iotcs/' + id + '/messages';
                tempCallback = tempCallbackBearer;
                var acceptBytes = parseInt(options.path.substring(options.path.indexOf('acceptBytes=')+12));
                if (acceptBytes && ((typeof controller.acceptBytes === 'undefined') || (controller.acceptBytes !== acceptBytes))) {
                    topic = 'iotcs/' + id + '/messages/acceptBytes';
                    var buffer = forge.util.createBuffer();
                    buffer.putInt32(acceptBytes);
                    controller.req(topic, buffer.toString(), null, function () {
                        controller.acceptBytes = acceptBytes;
                        topic = 'iotcs/' + id + '/messages';
                        controller.req(topic, payload, expect, tempCallback);
                    });
                    return;
                }
            }
        }
        controller.req(topic, payload, expect, tempCallback);
    }

    _mqttControllerInit(dcd);

    callApi(dcd._.mqttController);
};

$impl.https.bearerReq = function (options, payload, callback, retryCallback, dcd) {
    $impl.https.req(options, payload, function (response_body, error) {
        if (error) {
            var exception = null;
            try {
                exception = JSON.parse(error.message);
                if (exception.statusCode && (exception.statusCode === 401)) {
                    dcd._.refresh_bearer(false, function (error) {
                        if (error) {
                            callback(response_body, error);
                            return;
                        }
                        retryCallback();
                    });
                    return;
                }
            } catch (e) {

            }
        }
        callback(response_body, error);
    });
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/Client.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: add and validate this.tam = new $impl.TrustedAssetsManager();

/**
 * Client of the Oracle IoT Cloud Service. A client is a
 * directly-connected device, a gateway, or an enterprise
 * application.
 *
 * @class
 */
lib.Client = function () {
    this.cache = this.cache || {};
    this.cache.deviceModels = {};
};

/**
 * Create an AbstractVirtualDevice instance with the given device model
 * for the given device identifier. This method creates a new
 * AbstractVirtualDevice instance for the given parameters. The client
 * library does not cache previously created AbstractVirtualDevice
 * objects.
 * <p>
 * A device model can be obtained by it's afferent urn with the
 * Client if it is registered on the cloud.
 *
 * @see {@link iotcs.Client#getDeviceModel}
 * @param {string} endpointId - The endpoint identifier of the
 * device being modeled. 
 * @param {object} deviceModel - The device model object
 * holding the full description of that device model that this
 * device implements. 
 * @returns {iotcs.AbstractVirtualDevice} The newly created virtual device
 *
 * @memberof iotcs.Client.prototype
 * @function createVirtualDevice
 */
lib.Client.prototype.createVirtualDevice = function (endpointId, deviceModel) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(deviceModel, 'object');
    return new lib.AbstractVirtualDevice(endpointId, deviceModel, this);
};

/**
 * Get the device model for the urn.
 *
 * @param {string} deviceModelUrn - The URN of the device model
 * @param {function} callback - The callback function. This
 * function is called with the following argument: a
 * deviceModel object holding full description e.g. <code>{ name:"",
 * description:"", fields:[...], created:date,
 * isProtected:boolean, lastModified:date ... }</code>.
 * If an error occurs the deviceModel object is null
 * and an error object is passed: callback(deviceModel, error) and
 * the reason can be taken from error.message
 *
 * @memberof iotcs.Client.prototype
 * @function getDeviceModel
 */
lib.Client.prototype.getDeviceModel = function (deviceModelUrn, callback) {
    _mandatoryArg(deviceModelUrn, 'string');
    _mandatoryArg(callback, 'function');
    var deviceModel = this.cache.deviceModels[deviceModelUrn];
    if (deviceModel) {
        callback(deviceModel);
        return;
    }
    var self = this;
    $impl.https.bearerReq({
        method: 'GET',
        path:   $impl.reqroot
            + '/deviceModels/' + deviceModelUrn
    }, '', function (response, error) {
        if(!response || error || !(response.urn)){
            callback(null, lib.createError('invalid response on get device model', error));
            return;
        }
        var deviceModel = response;
        Object.freeze(deviceModel);
        self.cache.deviceModels[deviceModelUrn] = deviceModel;
        callback(deviceModel);
    }, function () {
        self.getDeviceModel(deviceModelUrn, callback);
    }, (lib.$port.userAuthNeeded() ? null : (lib.$impl.DirectlyConnectedDevice ? new lib.$impl.DirectlyConnectedDevice() : new lib.$impl.EnterpriseClientImpl())));
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/Monitor.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: a little more JSDOC is needed; explain the (simple) state machine and e.g. when the monitor thread is actually started, whether start and stop can be called multiple time; the default frequency ...etc...

/**
 * @param {function()} callback - function associated to this monitor
 * @class
 */
/** @ignore */
$impl.Monitor = function (callback) {
    _mandatoryArg(callback, 'function');
    this.running = false;
    this.callback = callback;
};

//@TODO: a little more JSDOC is needed

/**
 * @memberof iotcs.util.Monitor.prototype
 * @function start
 */
$impl.Monitor.prototype.start = function () {
    if (this.running) {
        return;
    }
    this.running = true;
    var self = this;
    this.monitorid = _register(this.callback);
};

//@TODO: a little more JSDOC is needed

/**
 * @memberof iotcs.util.Monitor.prototype
 * @function stop
 */
$impl.Monitor.prototype.stop = function () {
    if (!this.running) {
        return;
    }
    this.running = false;
    _unregister(this.monitorid);
};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
var monitors = {};

/** @ignore */
var index = 0;

/** @ignore */
var threadid = null;

/** @ignore */
function _caroussel() {
    Object.keys(monitors).forEach(function (id) {
        if (typeof monitors[id] === 'function') {
            monitors[id]();
        }
    });
}

/** @ignore */
function _register(callback) {
    monitors[++index] = callback;
    if (Object.keys(monitors).length === 1) {
        // if at least one registered monitor, then start thread
        if (threadid) {
            lib.log('inconsistent state: monitor thread already started!');
            return;
        }
        threadid = setInterval(_caroussel, lib.oracle.iot.client.monitor.pollingInterval);
    }
    return index;
}

/** @ignore */
function _unregister(id) {
    if (!monitors[id]) {
        lib.log('unknown monitor id #'+id);
        return;
    }
    delete monitors[id];
    if (Object.keys(monitors).length === 0) {
        // if no registered monitor left, then stop thread
        if (!threadid) {
            lib.log('inconsistent state: monitor thread already stopped!');
            return;
        }
        clearInterval(threadid);
        threadid = null;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/AbstractVirtualDevice.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: is AbstractVirtualDevice supposed to be a public/visible class ? if not, could be moved to $impl @DONE: it is public in JavaSE

/**
 * AbstractVirtualDevice is a representation of a device model
 * implemented by an endpoint. A device model is a
 * specification of the attributes, formats, and resources
 * available on the endpoint. 
 * <p>
 * The AbstractVirtualDevice API is identical for both the enterprise
 * client and the device client. The semantics of the API are
 * also the same. The processing model on the enterprise
 * client is different, however, from the processing model on
 * the device client. 
 * <p>
 * A device model can be obtained by it's afferent urn with the
 * Client if it is registered on the cloud.
 * <p>
 * An AbstractVirtualDevice can also be created with the appropriate
 * parameters from the Client.
 *
 * @see {@link iotcs.Client#getDeviceModel}
 * @see {@link iotcs.Client#createVirtualDevice}
 * @param {string} endpointId - The endpoint id of this device
 * @param {object} deviceModel - The device model object
 * holding the full description of that device model that this
 * device implements.
 * @class
 */
lib.AbstractVirtualDevice = function (endpointId, deviceModel) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(deviceModel, 'object');

    this.endpointId = endpointId;
    this.model = deviceModel;

    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this, 'onChange', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this._.onChange;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onChange that is not a function!');
                return;
            }
            this._.onChange = newValue;
        }
    });
    this._.onChange = null;

    Object.defineProperty(this, 'onError', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this._.onError;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onError that is not a function!');
                return;
            }
            this._.onError = newValue;
        }
    });
    this._.onError = null;
};

/**
 * Get the device model of this device object. This is the exact model
 * that was used at construction of the device object.
 *
 * @returns {Object} the object representing the device model for this
 * device
 *
 * @memberof iotcs.AbstractVirtualDevice.prototype
 * @function getDeviceModel
 */
lib.AbstractVirtualDevice.prototype.getDeviceModel = function () {
    return this.model;
};

/**
 * Get the endpoint id of the device.
 *
 * @returns {string} The endpoint id of this device as given at construction
 * of the virtual device
 *
 * @memberof iotcs.AbstractVirtualDevice.prototype
 * @function getEndpointId
 */
lib.AbstractVirtualDevice.prototype.getEndpointId = function () {
    return this.endpointId;
};

//@TODO: accessing directly a very internal object is not clean: e.g. "this.attributes[attribute]._."

/**
 * The update call allows more than one value to be set on
 * this Device object and in the end, it is sending the values
 * to the server.
 * <p>
 * The values are sent to the server when the method is
 * called, which also marks the end of the update
 * transaction.
 * <p>
 * For example <code>device.update({"min":10, "max":20});</code>
 * <p>
 * If the virtual device has the onError property set with a callback
 * method or any/all of the attributes given in the update call
 * have the onError attribute set with a callback method, in case
 * of error on update the callbacks will be called with related attribute
 * information. See VirtualDevice description for more info on onError.
 *
 * @param {Object} attributes - An object holding a list of attribute name/
 * value pairs to be updated as part of this transaction,
 * e.g. <code>{ "temperature":23, ... }</code>. Note that keys shall refer
 * to device attribute names or aliases. 
 *
 * @see {@link iotcs.enterprise.VirtualDevice}
 * @memberof iotcs.AbstractVirtualDevice.prototype
 * @function update
 */
lib.AbstractVirtualDevice.prototype.update = function (attributes) {

};

/**
 * Close this virtual device and all afferent resources used
 * for monitoring or controlling the device.
 *
 * @memberof iotcs.AbstractVirtualDevice.prototype
 * @function close
 */
lib.AbstractVirtualDevice.prototype.close = function () {
    this.endpointId = null;
    this.model = null;
    this.onChange = function (arg) {};
    this.onError = function (arg) {};
};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
function _link(name, device, element) {
    _mandatoryArg(name, 'string');
    _mandatoryArg(device, 'object'); //@TODO: should be checked against instance name
    _mandatoryArg(element, 'object');
    if (device[name]) {
        return;
    }
    Object.defineProperty(device, name, {
        enumerable: true,
        configurable: false,
        writable: false,
        value: element
    });
    Object.defineProperty(element, 'device', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: device
    });
}


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/UnifiedTrustStore.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This class provides an implementation of the trusted assets format
 * as values of the tag-length-value form in a Base64 encoded AES encrypted
 * file.
 * <p>
 * Unified client provisioning format:
 * <p>
 * format = version & blob & *comment<br>
 * version = 1 byte, value 33<br>
 * blob = MIME base64 of encrypted & new line<br>
 * encrypted = IV & AES-128/CBC/PKCS5Padding of values<br>
 * IV = 16 random bytes<br>
 * values = *TLV<br>
 * TLV = tag & length & value<br>
 * tag = byte<br>
 * length = 2 byte BE unsigned int<br>
 * value = length bytes<br>
 * comment = # & string & : & string & new line<br>
 * string = UTF-8 chars<br>
 * <p>
 * The password based encryption key is the password processed by 10000
 * interations of PBKDF2WithHmacSHA1 with the IV as the salt.
 * <p>
 * This class is internally used by the trusted assets store managers
 * to read/write files in the unified format
 *
 * @class
 * @memberOf iotcs
 * @alias UnifiedTrustStore
 *
 */
lib.UnifiedTrustStore = function (taStoreFileExt, taStorePasswordExt, forProvisioning) {

    this.trustStoreValues = {
        clientId: null,
        sharedSecret: null,
        serverHost: null,
        serverPort: null,
        endpointId: null,
        serverScheme: null,
        privateKey: null,
        publicKey: null,
        trustAnchors: null,
        certificate: null
    };

    var taStoreFile = taStoreFileExt || lib.oracle.iot.tam.store;
    var taStorePassword = taStorePasswordExt || lib.oracle.iot.tam.storePassword;

    if (!taStoreFile) {
        lib.error('No TA Store file defined');
        return;
    }
    if (!taStorePassword) {
        lib.error('No TA Store password defined');
        return;
    }

    var self = this;

    this.load = function () {
        var input = $port.file.load(taStoreFile);
        if (input.charCodeAt(0) != lib.UnifiedTrustStore.constants.version) {
            lib.error('Invalid unified trust store version');
            return;
        }
        var base64BlockStr = input.substring(1, input.indexOf('#'));
        var encryptedData = forge.util.decode64(base64BlockStr);
        var iv = forge.util.createBuffer();
        var encrypted = forge.util.createBuffer();
        for (var i = 0; i < lib.UnifiedTrustStore.constants.AES_BLOCK_SIZE; i++) {
            iv.putInt(encryptedData.charCodeAt(i), 8);
        }
        iv = iv.getBytes();
        for (i = lib.UnifiedTrustStore.constants.AES_BLOCK_SIZE; i < encryptedData.length; i++) {
            encrypted.putInt(encryptedData.charCodeAt(i), 8);
        }
        var key = forge.pkcs5.pbkdf2(taStorePassword, iv, lib.UnifiedTrustStore.constants.PBKDF2_ITERATIONS, lib.UnifiedTrustStore.constants.AES_KEY_SIZE);
        var decipher = forge.cipher.createDecipher('AES-CBC', key);
        decipher.start({iv: iv});
        decipher.update(encrypted);
        decipher.finish();
        var output = decipher.output;
        while (!output.isEmpty()) {
            var tag = output.getInt(8);
            var length = (output.getInt(16) >> 0);
            var buf = output.getBytes(length);
            switch (tag) {
                case lib.UnifiedTrustStore.constants.TAGS.serverUri:
                    var urlObj = forge.util.parseUrl(buf);
                    self.trustStoreValues.serverHost = urlObj.host;
                    self.trustStoreValues.serverPort = urlObj.port;
                    self.trustStoreValues.serverScheme = urlObj.scheme;
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.clientId:
                    self.trustStoreValues.clientId = buf;
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.sharedSecret:
                    self.trustStoreValues.sharedSecret = buf;
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.endpointId:
                    self.trustStoreValues.endpointId = buf;
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.trustAnchor:
                    if (!self.trustStoreValues.trustAnchors) {
                        self.trustStoreValues.trustAnchors = [];
                    }
                    self.trustStoreValues.trustAnchors.push(forge.pki.certificateToPem(forge.pki.certificateFromAsn1(forge.asn1.fromDer(buf))));
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.privateKey:
                    self.trustStoreValues.privateKey = forge.pki.privateKeyFromAsn1(forge.asn1.fromDer(buf));
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.publicKey:
                    self.trustStoreValues.publicKey = forge.pki.publicKeyFromAsn1(forge.asn1.fromDer(buf));
                    break;
            }
        }
    };

    this.store = function (values) {
        if (values) {
            Object.keys(values).forEach(function (key) {
                self.trustStoreValues[key] = values[key];
            });
        }
        var buffer = forge.util.createBuffer();
        var serverUri = self.trustStoreValues.serverScheme + '://' + self.trustStoreValues.serverHost + ':' + self.trustStoreValues.serverPort;
        buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.serverUri, 8);
        buffer.putInt(serverUri.length, 16);
        buffer.putBytes(serverUri);
        buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.clientId, 8);
        buffer.putInt(self.trustStoreValues.clientId.length, 16);
        buffer.putBytes(self.trustStoreValues.clientId);
        buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.sharedSecret, 8);
        buffer.putInt(self.trustStoreValues.sharedSecret.length, 16);
        buffer.putBytes(self.trustStoreValues.sharedSecret);
        if (self.trustStoreValues.endpointId) {
            buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.endpointId, 8);
            buffer.putInt(self.trustStoreValues.endpointId.length, 16);
            buffer.putBytes(self.trustStoreValues.endpointId);
        }
        if (Array.isArray(self.trustStoreValues.trustAnchors)) {
            self.trustStoreValues.trustAnchors.forEach(function (trustAnchor) {
                var trust = forge.asn1.toDer(forge.pki.certificateToAsn1(forge.pki.certificateFromPem(trustAnchor))).getBytes();
                buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.trustAnchor, 8);
                buffer.putInt(trust.length, 16);
                buffer.putBytes(trust);
            });
        }
        if (self.trustStoreValues.privateKey) {
            buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.privateKey, 8);
            var tempBytes = forge.asn1.toDer(forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(self.trustStoreValues.privateKey))).getBytes();
            buffer.putInt(tempBytes.length, 16);
            buffer.putBytes(tempBytes);
        }
        if (self.trustStoreValues.publicKey) {
            buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.publicKey, 8);
            var tempBytes1 = forge.asn1.toDer(forge.pki.publicKeyToAsn1(self.trustStoreValues.publicKey)).getBytes();
            buffer.putInt(tempBytes1.length, 16);
            buffer.putBytes(tempBytes1);
        }
        var iv = forge.random.getBytesSync(lib.UnifiedTrustStore.constants.AES_BLOCK_SIZE);
        var key = forge.pkcs5.pbkdf2(taStorePassword, iv, lib.UnifiedTrustStore.constants.PBKDF2_ITERATIONS, lib.UnifiedTrustStore.constants.AES_KEY_SIZE);
        var cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({iv: iv});
        cipher.update(buffer);
        cipher.finish();
        var finalBuffer = forge.util.createBuffer();
        finalBuffer.putInt(lib.UnifiedTrustStore.constants.version, 8);
        finalBuffer.putBytes(forge.util.encode64(iv+cipher.output.getBytes()));
        finalBuffer.putBytes('#');
        $port.file.store(taStoreFile, finalBuffer.getBytes());
    };

    this.setValues = function (otherManager) {
        Object.keys(otherManager).forEach(function (key) {
            if (self.trustStoreValues[key]) {
                otherManager[key] = self.trustStoreValues[key];
            }
        });
    };

    this.update = function (otherManager) {
        Object.keys(otherManager).forEach(function (key) {
            if (otherManager[key] && (typeof self.trustStoreValues[key] !== 'undefined')) {
                self.trustStoreValues[key] = otherManager[key];
            }
        });
        self.store();
    };

    if (!forProvisioning) {
        this.load();
    }

};

/**
 * Enumeration of unified trust store format constants
 *
 * @memberOf iotcs.UnifiedTrustStore
 * @alias constants
 * @class
 * @readonly
 * @enum {Integer}
 */
lib.UnifiedTrustStore.constants = {
    version: 33,
    AES_BLOCK_SIZE: 16,
    AES_KEY_SIZE: 16,
    PBKDF2_ITERATIONS: 10000
};

lib.UnifiedTrustStore.constants.TAGS = {
    serverUri: 1,
    clientId: 2,
    sharedSecret: 3,
    endpointId: 4,
    trustAnchor: 5,
    privateKey: 6,
    publicKey: 7
};


/**
 * This is a helper method for provisioning files used by
 * the trusted assets store managers in the unified trust
 * store format.
 *
 * @param {string} taStoreFile - the Trusted Assets Store file name.
 * @param {string} taStorePassword - the Trusted Assets Store password.
 * @param {string} serverHost - the IoT CS server host name.
 * @param {number} serverPort - the IoT CS server port.
 * @param {string} clientId - activation ID for devices or client ID for application integrations.
 * @param {string} sharedSecret - the client's shared secret.
 * @param {string} truststore - the truststore file containing PEM-encoded trust anchors certificates to be used to validate the IoT CS server
 * certificate chain.
 * @param {string} serverScheme - the scheme used to communicate with the server. Possible values are http(s) or mqtt(s).
 *
 * @memberOf iotcs.UnifiedTrustStore
 * @function provision
 */
lib.UnifiedTrustStore.provision = function (taStoreFile, taStorePassword, serverHost, serverPort, clientId, sharedSecret, truststore, serverScheme) {
    if (!taStoreFile) {
        throw 'No TA Store file provided';
    }
    if (!taStorePassword) {
        throw 'No TA Store password provided';
    }
    var entries = {
        clientId: clientId,
        serverHost: serverHost,
        serverPort: serverPort,
        serverScheme: (serverScheme ? serverScheme : 'http'),
        sharedSecret: sharedSecret,
        trustAnchors: (truststore ? (Array.isArray(truststore) ? truststore : _loadTrustAnchorsBinary(truststore)) : [])
    };
    new lib.UnifiedTrustStore(taStoreFile, taStorePassword, true).store(entries);
};

/** @ignore */
function _loadTrustAnchorsBinary (truststore) {
    return $port.file.load(truststore)
        .split(/\-{5}(?:B|E)(?:[A-Z]*) CERTIFICATE\-{5}/)
        .filter(function(elem) { return ((elem.length > 1) && (elem.indexOf('M') > -1)); })
        .map(function(elem) { return '-----BEGIN CERTIFICATE-----' + elem.replace(new RegExp('\r\n', 'g'),'\n') + '-----END CERTIFICATE-----'; });
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/TrustedAssetsManager.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The <code>TrustedAssetsManager</code> interface defines methods for handling trust
 * material used for activation and authentication to the IoT CS. Depending on
 * the capability of the client or device as well as on the security
 * requirements implementations of this interface may simply store sensitive
 * trust material in a plain persistent store, in some keystore or in a secure
 * token.
 * <dl>
 * <dt>Authentication of Devices with the IoT CS</dt>
 * <dd>
 * <dl>
 * <dt>Before/Upon Device Activation</dt>
 * <dd>
 * A device must use client secret-based authentication to authenticate with the
 * OAuth service and retrieve an access token to perform activation with the IoT
 * CS server. This is done by using an activation ID and a shared secret.
 * </dd>
 * <dt>After Device Activation</dt>
 * <dd>
 * A device must use client assertion-based authentication to authenticate with
 * the OAuth service and retrieve an access token to perform send and retrieve
 * messages from the IoT CS server. This is done by using the assigned endpoint ID
 * and generated private key.</dd>
 * </dl>
 * </dd>
 * <dt>Authentication of <em>Pre-activated</em> Enterprise Applications with the
 * IoT CS</dt>
 * <dd>
 * <dl>
 * <dt>Before/After Application Activation</dt>
 * <dd>
 * An enterprise integration must use client secret-based authentication to authenticate with the
 * OAuth service and retrieve an access token to perform any REST calls with the IoT
 * CS server. This is done by using the integration ID and a shared secret.</dd>
 * </dd>
 * </dl>
 *
 * @class
 * @memberOf iotcs.device
 * @alias TrustedAssetsManager
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 *
 */
lib.device.TrustedAssetsManager = function (taStoreFileExt, taStorePasswordExt) {

    this.clientId = null;
    this.sharedSecret = null;
    this.serverHost = null;
    this.serverPort = null;
    this.endpointId = null;
    this.serverScheme = 'http';

    this.privateKey = null;
    this.publicKey = null;
    this.certificate = null;
    this.trustAnchors = [];

    var taStoreFile = taStoreFileExt || lib.oracle.iot.tam.store;
    var taStorePassword = taStorePasswordExt || lib.oracle.iot.tam.storePassword;

    if (!taStoreFile) {
        lib.error('No TA Store file defined');
        return;
    }
    if (!taStorePassword) {
        lib.error('No TA Store password defined');
        return;
    }

    if (!taStoreFile.endsWith('.json')) {
        this.unifiedTrustStore = new lib.UnifiedTrustStore(taStoreFile, taStorePassword, false);
        this.unifiedTrustStore.setValues(this);
    } else {
        this.load = function () {
            var input = $port.file.load(taStoreFile);
            var entries = JSON.parse(input);

            if (!_verifyTaStoreContent(entries, taStorePassword)) {
                lib.error('TA Store not signed or tampered with');
                return;
            }

            this.clientId = entries.clientId;
            this.serverHost = entries.serverHost;
            this.serverPort = entries.serverPort;
            this.serverScheme = entries.serverScheme;
            this.sharedSecret = _decryptSharedSecret(entries.sharedSecret, taStorePassword);
            this.trustAnchors = entries.trustAnchors;

            {
                var keyPair = entries.keyPair;
                if (keyPair) {
                    var p12Der = forge.util.decode64(entries.keyPair);
                    var p12Asn1 = forge.asn1.fromDer(p12Der, false);
                    var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, taStorePassword);

                    var bags = p12.getBags({
                        bagType: forge.pki.oids.certBag
                    });
                    this.certificate = bags[forge.pki.oids.certBag][0].cert;
                    bags = p12.getBags({
                        bagType: forge.pki.oids.pkcs8ShroudedKeyBag
                    });
                    var bag = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
                    this.privateKey = bag.key;
                    this.endpointId = bag.attributes.friendlyName[0];
                }
            }
        };

        this.store = function () {
            lib.log('store' + (this.privateKey !== null) + ' ' + this.endpointId);
            var keyPairEntry = null;
            if (this.privateKey) {
                var p12Asn1 = forge.pkcs12.toPkcs12Asn1(
                    this.privateKey,
                    this.certificate,
                    taStorePassword, {
                        'friendlyName': this.endpointId
                    });
                var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
                keyPairEntry = forge.util.encode64(p12Der);
            }
            var entries = {
                'clientId': this.clientId,
                'serverHost': this.serverHost,
                'serverPort': this.serverPort,
                'serverScheme': this.serverScheme,
                'sharedSecret': _encryptSharedSecret(this.sharedSecret, taStorePassword),
                'trustAnchors': this.trustAnchors,
                'keyPair': keyPairEntry
            };

            entries = _signTaStoreContent(entries, taStorePassword);

            var output = JSON.stringify(entries);
            $port.file.store(taStoreFile, output);
        };
        this.load();
    }
};

/**
 * Retrieves the IoT CS server host name.
 *
 * @returns {String} the IoT CS server host name
 * or <code>null</code> if any error occurs retrieving the server host
 * name.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getServerHost
 */
lib.device.TrustedAssetsManager.prototype.getServerHost = function () {
    return this.serverHost;
};

/**
 * Retrieves the IoT CS server port.
 *
 * @returns {Number} the IoT CS server port (a positive integer)
 * or <code>null</code> if any error occurs retrieving the server port.
 * 
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getServerPort
 */
lib.device.TrustedAssetsManager.prototype.getServerPort = function () {
    return this.serverPort;
};

/**
 * Retrieves the ID of this client. If the client is a device the client ID
 * is the device activation ID; if the client is a pre-activated enterprise application
 * the client ID corresponds to the assigned integration ID. The client ID is
 * used along with a client secret derived from the shared secret to perform
 * secret-based client authentication with the IoT CS server.
 *
 * @returns {string} the ID of this client.
 * or <code>null</code> if any error occurs retrieving the client ID.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getClientId
 */
lib.device.TrustedAssetsManager.prototype.getClientId = function () {
    return this.clientId;
};

/**
 * Retrieves the public key to be used for certificate request.
 *
 * @returns {string} the device public key as a PEM-encoded string
 * or <code>null</code> if any error occurs retrieving the public key.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getPublicKey
 */
lib.device.TrustedAssetsManager.prototype.getPublicKey = function () {
    if ((!this.publicKey) && (!this.certificate)) {
        throw new Error('Key pair not yet generated or certificate not yet assigned');
    }
    var key = (this.publicKey) ? this.publicKey : this.certificate.publicKey;
    return forge.pki.publicKeyToPem(key);
};

/**
 * Retrieves the trust anchor or most-trusted Certification
 * Authority (CA) to be used to validate the IoT CS server
 * certificate chain.
 *
 * @returns {Array} the PEM-encoded trust anchor certificates.
 * or <code>null</code> if any error occurs retrieving the trust anchor.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getTrustAnchorCertificates
 */
lib.device.TrustedAssetsManager.prototype.getTrustAnchorCertificates = function () {
    return this.trustAnchors;
};

/**
 * Sets the assigned endpoint ID and certificate as returned
 * by the activation procedure.
 * Upon a call to this method, a compliant implementation of the
 * <code>TrustedAssetsManager</code>
 * interface must ensure the persistence of the provided endpoint
 * credentials.
 * This method can only be called once; unless the <code>TrustedAssetsManager</code> has
 * been reset.
 * <p>
 * If the client is a pre-activated enterprise application, the endpoint ID
 * has already been provisioned and calling this method MUST fail with an
 * <code>IllegalStateException</code>.
 * </p>
 *
 * @param endpointId the assigned endpoint ID.
 * @param certificate the PEM-encoded certificate issued by the server or <code>null</code> if no certificate was provided
 *            by the server.
 * @returns {boolean} whether setting the endpoint credentials succeeded.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function setEndpointCredentials
 */
lib.device.TrustedAssetsManager.prototype.setEndpointCredentials = function (endpointId, certificate) {
    /*if (!endpointId) {
        lib.error('EndpointId cannot be null');
        return false;
    }
    if (this.endpointId) {
        lib.error('EndpointId already assigned');
        return false;
    }*/
    if (!this.privateKey) {
        lib.error('Private key not yet generated');
        return false;
    }
    if (endpointId) {
        this.endpointId = endpointId;
    } else {
        this.endpointId = '';
    }
    try {
        if (certificate && certificate.length > 0) {
            this.certificate = forge.pki.certificateFromPem(certificate);
        } else {
            this.certificate = _generateSelfSignedCert(this.privateKey, this.publicKey, this.clientId);
        }
    } catch (e) {
        lib.error('Error generating certificate: ' + e);
        return false;
    }
    try {
        if (this.unifiedTrustStore) {
            this.unifiedTrustStore.update(this);
        } else {
            this.store();
        }
    } catch (e) {
        lib.error('Error storing the trust assets: ' + e);
        return false;
    }
    return true;
};

/**
 * Retrieves the assigned endpoint ID.
 *
 * @return {string} the assigned endpoint ID or <code>null</code> if any error occurs retrieving the 
 * endpoint ID.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getEndpointId
 */
lib.device.TrustedAssetsManager.prototype.getEndpointId = function () {
    if (!this.endpointId) {
        throw new Error('EndpointId not assigned');
    }
    return this.endpointId;
};

/**
 * Retrieves the assigned endpoint certificate.
 *
 * @returns {string} the PEM-encoded certificate or <code>null</code> if no certificate was assigned,
 * or if any error occurs retrieving the endpoint certificate.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getEndpointCertificate
 */
lib.device.TrustedAssetsManager.prototype.getEndpointCertificate = function () {
    var certificate = null;
    if (!this.certificate) {
        lib.error('Endpoint certificate not assigned');
        return null;
    }
    try {
        if (!_isSelfSigned(this.certificate)) {
            certificate = forge.pki.certificateToPem(this.certificate);
        }
    } catch (e) {
        lib.error('Unexpected error retrieving certificate encoding: ' + 2);
        return null;
    }
    //XXX ??? is it an array or a string
    return certificate;
};

/**
 * Generates the key pair to be used for assertion-based client
 * authentication with the IoT CS.
 *
 * @param {string} algorithm the key algorithm.
 * @param {number} keySize the key size.
 * @returns {boolean} whether the key pair generation succeeded.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function generateKeyPair
 */
lib.device.TrustedAssetsManager.prototype.generateKeyPair = function (algorithm, keySize) {
    if (!algorithm) {
        lib.error('Algorithm cannot be null');
        return false;
    }
    if (keySize <= 0) {
        lib.error('Key size cannot be negative or 0');
        return false;
    }
    if (this.privateKey) {
        lib.error('Key pair already generated');
        return false;
    }
    try {
        var keypair = forge.rsa.generateKeyPair({
            bits : keySize
            //, e: 0x10001
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    } catch (e) {
        lib.error('Could not generate key pair: ' + e);
        return false;
    }
    return true;
};

/**
 * Signs the provided data using the specified algorithm and the
 * private key. This method is only use for assertion-based client authentication
 * with the IoT CS.
 *
 * @param {array} data the bytes to sign.
 * @param {string} algorithm the algorithm to use.
 * @returns {array} the signature bytes
 * or <code>null</code> if any error occurs retrieving the necessary key
 * material or performing the operation.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function signWithPrivateKey
 */
lib.device.TrustedAssetsManager.prototype.signWithPrivateKey = function (data, algorithm) {
    var signature = null;
    if (!algorithm) {
        lib.error('Algorithm cannot be null');
        return null;
    }
    if (!data) {
        lib.error('Data cannot be null');
        return null;
    }
    if (!this.privateKey) {
        lib.error('Private key not yet generated');
        return null;
    }
    try {
        var md = null;
        switch (algorithm) {
        case 'md5': {
            md = forge.md.md5.create();
            break;
        }
        case 'sha1': {
            md = forge.md.sha1.create();
            break;
        }
        case 'sha256': {
            md = forge.md.sha256.create();
            break;
        }
        case 'sha512': {
            md = forge.md.sha512.create();
            break;
        }
        case 'sha512/224': {
            md = forge.md.sha512.sha224.create();
            break;
        }
        case 'sha512/256': {
            md = forge.md.sha512.sha256.create();
            break;
        }
        }
        if (md) {
            md.update(data);
            signature = this.privateKey.sign(md);
        }
    } catch (e) {
        lib.error('Error signing with private key: ' + e);
        return null;
    }
    return signature;
};


/**
 * Retrieves the client's shared secret to be used for post-production
 * registration (optional). The shared secret may be generated if not
 * already provisioned. The returned shared secret is encrypted using some
 * pre-provisioned key - such as a public key / certificate of the IoT CS.
 * <p>
 * Until IOT-9708 is fixed returns shared secret in clear.
 *
 * @returns {string} the encrypted shared secret
 * or <code>null</code> if any error occurs retrieving the necessary key
 * material or performing the operation.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getEncryptedSharedSecret
 */
lib.device.TrustedAssetsManager.prototype.getEncryptedSharedSecret = function () {
    return this.sharedSecret;
};

/**
 * Signs the provided data using the specified algorithm and the shared
 * secret. This method is only use for secret-based client authentication
 * with the IoT CS server.
 *
 * @param {array} data the bytes to be signed.
 * @param {string} algorithm the hash algorithm to use.
 * @return {array} the signature bytes
 * or <code>null</code> if any error occurs retrieving the necessary key
 * material or performing the operation.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function signWithSharedSecret
 */
lib.device.TrustedAssetsManager.prototype.signWithSharedSecret = function (data, algorithm) {
    var digest = null;
    if (!algorithm) {
        lib.error('Algorithm cannot be null');
        return null;
    }
    if (!data) {
        lib.error('Data cannot be null');
        return null;
    }
    try {
        var hmac = forge.hmac.create();
        hmac.start(algorithm, this.sharedSecret);
        hmac.update(data);
        digest = hmac.digest();
        // lib.log(digest.toHex());
    } catch (e) {
        lib.error('Error signing with shared secret: ' + e);
        return null;
    }
    return digest;
};

/**
 * Returns whether the client is activated. The client is deemed activated
 * if it has at least been assigned endpoint ID.
 *
 * @returns {boolean} whether the device is activated.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function isActivated
 */
lib.device.TrustedAssetsManager.prototype.isActivated = function () {
    return (this.endpointId && (this.endpointId !== null) && (this.endpointId !== '')) ? true : false;
};

/** 
 * Resets the trust material back to its provisioning state; in
 * particular, the key pair is erased.  The client will have to go, at least,through activation again;
 * depending on the provisioning policy in place, the client may have to go 
 * through registration again.
 * 
 * @return {boolean} whether the operation was successful.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function reset
 */
lib.device.TrustedAssetsManager.prototype.reset = function () {
    this.endpointId = null;
    this.privateKey = null;
    this.publicKey = null;
    this.certificate = null;
    try {
        if (this.unifiedTrustStore) {
            this.unifiedTrustStore.update(this);
        } else {
            this.store();
        }
    } catch (e) {
        lib.error('Error resetting the trust assets: ' + e);
        return false;
    }
    return true;
};

lib.device.TrustedAssetsManager.prototype.buildClientAssertion = function () {
    var id = (!this.isActivated() ? this.getClientId() : this.getEndpointId());

    var now = ((typeof this.serverDelay === 'undefined') ? Date.now() : (Date.now() + this.serverDelay));

    var exp = parseInt((now + 900000)/1000);
    var header = {
        typ: 'JWT',
        alg: (!this.isActivated() ? 'HS256' : 'RS256')
    };
    var claims = {
        iss: id,
        sub: id,
        aud: 'oracle/iot/oauth2/token',
        exp: exp
    };

    var inputToSign =
        $port.util.btoa(JSON.stringify(header))
        + '.'
        + $port.util.btoa(JSON.stringify(claims));

    var signed;

    try {
        if (!this.isActivated()) {
            var digest = this.signWithSharedSecret(inputToSign, "sha256");
            signed = forge.util.encode64(forge.util.hexToBytes(digest.toHex()));
        } else {
            var signatureBytes = this.signWithPrivateKey(inputToSign, "sha256");
            signed = forge.util.encode64(signatureBytes);
        }
    } catch (e) {
        var error = lib.createError('error on generating oauth signature', e);
        return null;
    }

    inputToSign = inputToSign + '.' + signed;
    inputToSign = inputToSign.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');

    return inputToSign;
};

lib.device.TrustedAssetsManager.prototype.getServerScheme = function () {
    return this.serverScheme;
};

/**
 * Provisions the designated Trusted Assets Store with the provided provisioning assets.
 * The provided shared secret will be encrypted using the provided password.
 * 
 * @param {string} taStoreFile the Trusted Assets Store file name.
 * @param {string} taStorePassword the Trusted Assets Store password.
 * @param {string} serverHost the IoT CS server host name.
 * @param {number} serverPort the IoT CS server port.
 * @param {string} clientId the ID of the client.
 * @param {string} sharedSecret the client's shared secret.
 * @param {string} truststore the truststore file containing PEM-encoded trust anchors certificates to be used to validate the IoT CS server
 * certificate chain.
 *
 * @memberof iotcs.device.TrustedAssetsManager
 * @function provision
 *
 */
lib.device.TrustedAssetsManager.provision = function (taStoreFile, taStorePassword, serverHost, serverPort, clientId, sharedSecret, truststore, serverScheme) {
	if (!taStoreFile) {
		throw 'No TA Store file provided';
	}
	if (!taStorePassword) {
		throw 'No TA Store password provided';
	}
	var entries = {
		'clientId' : clientId,
		'serverHost' : serverHost,
		'serverPort' : serverPort,
        'serverScheme' : (serverScheme ? serverScheme : 'http'),
		'sharedSecret' : _encryptSharedSecret(sharedSecret, taStorePassword),
		'trustAnchors' : (truststore ? (Array.isArray(truststore) ? truststore : _loadTrustAnchors(truststore)) : [])
	};
	entries = _signTaStoreContent(entries, taStorePassword);
	var output = JSON.stringify(entries);
	$port.file.store(taStoreFile, output);
};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
function _isSelfSigned (certificate) {
    return certificate.isIssuer(certificate);
}

/** @ignore */
function _generateSelfSignedCert (privateKey, publicKey, clientId) {
    var cert = forge.pki.createCertificate();
    cert.publicKey = publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    var attrs = [{
        name: 'commonName',
        value: clientId
    }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(privateKey);
    return cert;
}

/** @ignore */
function _signTaStoreContent (taStoreEntries, password) {
    var data = '{' + taStoreEntries.clientId + '}'
    	+ '{' + taStoreEntries.serverHost + '}'
    	+ '{' + taStoreEntries.serverPort + '}'
        + '{' + taStoreEntries.serverScheme + '}'
    	+ '{' + taStoreEntries.sharedSecret + '}'
    	+ '{' + taStoreEntries.trustAnchors + '}'
    	+ '{' + taStoreEntries.keyPair + '}';
    var key = _pbkdf(password);
    var hmac = forge.hmac.create();
	hmac.start('sha256', key);
	hmac.update(data);
	taStoreEntries.signature = hmac.digest().toHex();
	return taStoreEntries;
}

/** @ignore */
function _verifyTaStoreContent (taStoreEntries, password) {
    var data = '{' + taStoreEntries.clientId + '}'
	+ '{' + taStoreEntries.serverHost + '}'
	+ '{' + taStoreEntries.serverPort + '}'
    + (taStoreEntries.serverScheme ? ('{' + taStoreEntries.serverScheme + '}') : '')
	+ '{' + taStoreEntries.sharedSecret + '}'
	+ '{' + taStoreEntries.trustAnchors + '}'
	+ '{' + taStoreEntries.keyPair + '}';
    var key = _pbkdf(password);
    var hmac = forge.hmac.create();
    hmac.start('sha256', key);
    hmac.update(data);
	return taStoreEntries.signature && hmac.digest().toHex() === taStoreEntries.signature;
}

/** @ignore */
//PBKDF2 (RFC 2898) 
function _pbkdf (password) {
	return forge.pkcs5.pbkdf2(password, '', 1000, 16);
}

/** @ignore */
function _encryptSharedSecret (sharedSecret, password) {
	var key = _pbkdf(password);
	var cipher = forge.cipher.createCipher('AES-CBC', key);
	cipher.start({iv: forge.util.createBuffer(16).fillWithByte(0, 16)});
	cipher.update(forge.util.createBuffer(sharedSecret, 'utf8'));
	cipher.finish();
	return cipher.output.toHex();
}

/** @ignore */
function _decryptSharedSecret (encryptedSharedSecret, password) {
	var key = _pbkdf(password);
	var cipher = forge.cipher.createDecipher('AES-CBC', key);
	cipher.start({iv: forge.util.createBuffer(16).fillWithByte(0, 16)});
	cipher.update(forge.util.createBuffer(forge.util.hexToBytes(encryptedSharedSecret), 'binary'));
	cipher.finish();
	return cipher.output.toString();
}

/** @ignore */
function _loadTrustAnchors (truststore) {
	return $port.file.load(truststore)
		.split(/\-{5}(?:B|E)(?:[A-Z]*) CERTIFICATE\-{5}/)
		.filter(function(elem) { return ((elem.length > 1) && (elem.indexOf('M') > -1)); })
		//.filter(elem => elem.length > 0)
		.map(function(elem) { return '-----BEGIN CERTIFICATE-----' + elem.replace(new RegExp('\r\n', 'g'),'\n') + '-----END CERTIFICATE-----'; });
	    //.map(elem => elem = '-----BEGIN CERTIFICATE-----' + elem + '-----END CERTIFICATE-----');
}



//////////////////////////////////////////////////////////////////////////////
// file: library/device/Message.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * @namespace
 * @alias iotcs.message
 * @memberOf iotcs
 */
lib.message = {};

/**
 * This object helps in the construction of a general type
 * message to be sent to the server. This object and
 * it's components are used as utilities by the
 * low level API clients, like the DirectlyConnectedDevice
 * or GatewayDevice or indirectly by the MessageDispatcher.
 *
 * @memberOf iotcs.message
 * @alias Message
 * @class
 */
lib.message.Message = function () {

    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this._, 'internalObject',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {
            clientId: $port.util.uuidv4(),
            source: null,
            destination: '',
            sender: '',
            priority: 'MEDIUM',
            reliability: 'BEST_EFFORT',
            eventTime: new Date().getTime(),
            type: null,
            properties: {},
            payload: {}
        }
    });

};

/**
 * Sets the payload of the message as object.
 *
 * @param {Object} payload - the payload to set.
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function payload
 */
lib.message.Message.prototype.payload = function (payload) {

    _mandatoryArg(payload, 'object');

    this._.internalObject.payload = payload;
    return this;
};

/**
 * Sets the source of the message.
 *
 * @param {string} source - the source to set
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function source
 */
lib.message.Message.prototype.source = function (source) {

    _mandatoryArg(source, 'string');

    if(this._.internalObject.source === null) {
        this._.internalObject.source = source;
    }
    return this;
};

/**
 * Sets the destination of the message.
 *
 * @param {string} destination - the destination
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function destination
 */
lib.message.Message.prototype.destination = function (destination) {

    _mandatoryArg(destination, 'string');

    this._.internalObject.destination = destination;
    return this;
};

/**
 * This returns the built message as JSON to be sent
 * to the server as it is.
 *
 * @returns {Object} JSON representation of the message to be sent
 *
 * @memberOf iotcs.message.Message.prototype
 * @function payload
 */
lib.message.Message.prototype.getJSONObject = function () {
    return this._.internalObject;
};

/**
 * This sets the type of the message. Types are defined in the
 * Message.Type enumeration. If an invalid type is given an
 * exception is thrown.
 *
 * @param {string} type - the type to set
 * @returns {iotcs.message.Message} This object
 *
 * @see {@link iotcs.message.Message.Type}
 * @memberOf iotcs.message.Message.prototype
 * @function type
 */
lib.message.Message.prototype.type = function (type) {

    _mandatoryArg(type, 'string');
    if (Object.keys(lib.message.Message.Type).indexOf(type) < 0) {
        lib.error('invalid message type given');
        return;
    }

    if(type === lib.message.Message.Type.RESOURCES_REPORT) {
        this._.internalObject.id = $port.util.uuidv4();
    }
    this._.internalObject.type = type;
    return this;
};

/**
 * This sets the format URN in the payload of the message.
 * This is mostly specific for the DATA or ALERT type
 * of messages.
 *
 * @param {string} format - the format to set
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function format
 */
lib.message.Message.prototype.format = function (format) {

    _mandatoryArg(format, 'string');

    this._.internalObject.payload.format = format;
    return this;
};

/**
 * This sets a key/value pair in the data property of the payload
 * of the message. This is specific to DATA or ALERT type messages.
 *
 * @param {string} dataKey - the key
 * @param {Object} [dataValue] - the value associated with the key
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function dataItem
 */
lib.message.Message.prototype.dataItem = function (dataKey, dataValue) {

    _mandatoryArg(dataKey, 'string');

    if (!('data' in this._.internalObject.payload)) {
        this._.internalObject.payload.data = {};
    }
    this._.internalObject.payload.data[dataKey] = dataValue;
    return this;
};

/**
 * This sets the priority of the message. Priorities are defined in the
 * Message.Priority enumeration. If an invalid type is given an
 * exception is thrown. The MessageDispatcher implements a
 * priority queue and it will use this parameter.
 *
 * @param {string} priority - the priority to set
 * @returns {iotcs.message.Message} This object
 *
 * @see {@link iotcs.device.util.MessageDispatcher}
 * @see {@link iotcs.message.Message.Priority}
 * @memberOf iotcs.message.Message.prototype
 * @function priority
 */
lib.message.Message.prototype.priority = function (priority) {

    _mandatoryArg(priority, 'string');
    if (Object.keys(lib.message.Message.Priority).indexOf(priority) < 0) {
        lib.error('invalid priority given');
        return;
    }

    this._.internalObject.priority = priority;
    return this;
};

/**
 * Enumeration of message types
 *
 * @memberOf iotcs.message.Message
 * @alias Type
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.Type = {
    DATA: 'DATA',
    ALERT: 'ALERT',
    REQUEST: 'REQUEST',
    RESPONSE: 'RESPONSE',
    RESOURCES_REPORT: 'RESOURCES_REPORT'
};

/**
 * Enumeration of message priorities
 *
 * @memberOf iotcs.message.Message
 * @alias Priority
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.Priority = {
    LOWEST: 'LOWEST',
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    HIGHEST: 'HIGHEST'
};

/**
 * This is a helper method for building a response
 * message to be sent to the server as response
 * to a request message sent from the server.
 * This is mostly used by handlers registered
 * with the RequestDispatcher. If no requestMessage
 * is given the id for the response message will be
 * a random UUID.
 *
 * @param {Object} [requestMessage] - the message received
 * from the server as JSON
 * @param {number} statusCode - the status code to be
 * added in the payload of the response message
 * @param {Object} [headers] - the headers to be added in
 * the payload of the response message
 * @param {string} [body] - the body to be added in the
 * payload of the response message
 * @param {string} [url] - the url to be added in the payload
 * of the response message
 *
 * @returns {iotcs.message.Message} The response message
 * instance built on the given parameters
 *
 * @see {@link iotcs.device.util.RequestDispatcher}
 * @memberOf iotcs.message.Message
 * @function buildResponseMessage
 */
lib.message.Message.buildResponseMessage = function (requestMessage, statusCode, headers, body, url) {

    _optionalArg(requestMessage, 'object');
    _mandatoryArg(statusCode, 'number');
    _optionalArg(headers, 'object');
    _optionalArg(body, 'string');
    _optionalArg(url, 'string');

    var payload = {
        statusCode: statusCode,
        url: (url ? url : ''),
        requestId: ((requestMessage && requestMessage.id) ? requestMessage.id : $port.util.uuidv4()),
        headers: (headers ? headers : {}),
        body: (body ? $port.util.btoa(body) : '')
    };
    var message = new lib.message.Message();
    message.type(lib.message.Message.Type.RESPONSE)
        .source((requestMessage && requestMessage.destination) ? requestMessage.destination : '')
        .destination((requestMessage && requestMessage.source) ? requestMessage.source : '')
        .payload(payload);
    return message;
};

/**
 * Helpers for building alert messages.
 *
 * @memberOf iotcs.message.Message
 * @alias AlertMessage
 * @class
 */
lib.message.Message.AlertMessage = {};

/**
 * Enumeration of severities for alert messages
 *
 * @memberOf iotcs.message.Message.AlertMessage
 * @alias Severity
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.AlertMessage.Severity = {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    SIGNIFICANT: 'SIGNIFICANT',
    CRITICAL: 'CRITICAL'
};

/**
 * Helper method used for building alert messages
 * to be sent to the server. The severity is defined
 * in the AlertMessage.Severity enumeration. If an invalid
 * value is given an exception is thrown.
 *
 * @param {string} format - the format added in the
 * payload of the generated message
 * @param {string} description - the description added
 * in the payload of the generated message
 * @param {string} severity - the severity added in the
 * payload of the generated message
 *
 * @returns {iotcs.message.Message} The instance of
 * the alert message built based on the given
 * parameters.
 *
 * @see {@link iotcs.message.Message.AlertMessage.Severity}
 * @memberOf iotcs.message.Message.AlertMessage
 * @function buildAlertMessage
 */
lib.message.Message.AlertMessage.buildAlertMessage = function (format, description, severity) {

    _mandatoryArg(format, 'string');
    _mandatoryArg(description, 'string');
    _mandatoryArg(severity, 'string');
    if (Object.keys(lib.message.Message.AlertMessage.Severity).indexOf(severity) < 0) {
        lib.error('invalid severity given');
        return;
    }

    var payload = {
        format: format,
        severity: severity,
        description: description
    };
    var message = new lib.message.Message();
    message.type(lib.message.Message.Type.ALERT)
        .priority(lib.message.Message.Priority.HIGHEST)
        .payload(payload);
    return message;
};

/**
 * Helpers for building resource report messages
 *
 * @memberOf iotcs.message.Message
 * @alias ResourceMessage
 * @class
 */
lib.message.Message.ResourceMessage = {};

/**
 * Enumeration of the type of resource report messages
 *
 * @memberOf iotcs.message.Message.ResourceMessage
 * @alias Type
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.ResourceMessage.Type = {
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    RECONCILIATION: 'RECONCILIATION'
};

/**
 * This generates an MD5 hash of an array of
 * strings. Thi has to be used to generate
 * the reconciliationMark of the resource
 * report message.
 *
 * @param {string[]} stringArray - the array of string
 * for which to generate the hash
 *
 * @returns {string} The MD5 hash
 *
 * @memberOf iotcs.message.Message.ResourceMessage
 * @function getMD5ofList
 */
lib.message.Message.ResourceMessage.getMD5ofList = function (stringArray) {

    _mandatoryArg(stringArray, 'array');
    stringArray.forEach( function (str) {
        _mandatoryArg(str, 'string');
    });

    var hash = forge.md.md5.create();
    var i;
    for (i = 0; i < stringArray.length; i++) {
        hash.update(stringArray[i]);
    }
    return hash.digest().toHex();
};

/**
 * Helper method used for building a resource report
 * message to be sent to the server. Th resources
 * objects can be generated by using the
 * ResourceMessage.Resource.buildResource method.
 * The reportType must be taken from the
 * ResourceMessage.Type enumeration. If an invalid
 * value is given an exception is thrown.
 * The rM parameter is the reconciliationMark that can
 * be calculated by using the ResourceMessage.getMD5ofList
 * over the array of paths of the resources given as objects.
 * A resource is an object that must have at least 2
 * properties as strings: path and methods. Also methods
 * must be string that represents a concatenation of
 * valid HTTP methods comma separated.
 *
 * @param {Object[]} resources - the array of resources that are
 * included in the report message
 * resource report message
 * @param {string} endpointName - the endpoint that is giving the
 * resource report
 * @param {string} reportType - the type of the report
 * @param {string} [rM] - the reconciliationMark used by teh server
 * to validate the report
 *
 * @returns {iotcs.message.Message} The isntance of the resource
 * report message to be sent to the server.
 *
 * @see {@link iotcs.message.Message.ResourceMessage.Resource.buildResource}
 * @see {@link iotcs.message.Message.ResourceMessage.Type}
 * @memberOf iotcs.message.Message.ResourceMessage
 * @function buildResourceMessage
 */
lib.message.Message.ResourceMessage.buildResourceMessage = function (resources, endpointName, reportType, rM) {

    _mandatoryArg(resources, 'array');
    resources.forEach( function(resource) {
        _mandatoryArg(resource, 'object');
        _mandatoryArg(resource.path, 'string');
        _mandatoryArg(resource.methods, 'string');
        resource.methods.split(',').forEach( function (method) {
            if (['GET', 'PUT', 'POST', 'HEAD', 'OPTIONS', 'CONNECT', 'DELETE', 'TRACE'].indexOf(method) < 0) {
                lib.error('invalid method in resource message');
                return;
            }
        });
    });
    _mandatoryArg(endpointName, 'string');
    _mandatoryArg(reportType, 'string');
    if (Object.keys(lib.message.Message.ResourceMessage.Type).indexOf(reportType) < 0) {
        lib.error('invalid report type given');
        return;
    }
    _optionalArg(rM, 'string');

    var payload = {
        type: 'JSON',
        value: {
            reportType: reportType,
            endpointName: endpointName,
            resources: resources
        }
    };
    if (rM) {
        payload.value.reconciliationMark = rM;
    }
    var message = new lib.message.Message();
    message.type(lib.message.Message.Type.RESOURCES_REPORT)
        .payload(payload);
    return message;
};

/**
 * Helpers used to build resource objects, used by the
 * resource report messages.
 *
 * @memberOf iotcs.message.Message.ResourceMessage
 * @alias Resource
 * @class
 */
lib.message.Message.ResourceMessage.Resource = {};

/**
 * Enumeration of possible statuses of the resources
 *
 * @memberOf iotcs.message.Message.ResourceMessage.Resource
 * @alias Status
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.ResourceMessage.Resource.Status = {
    ADDED: 'ADDED',
    REMOVED: 'REMOVED'
};

/**
 * Helper method used to build a resource object.
 * The status parameter must be given from the
 * Resource.Status enumeration. If an invalid value is given
 * the method will throw an exception. Also the methods array
 * must be an array of valid HTTP methods, otherwise
 * an exception will be thrown.
 *
 * @param {string} name - the name of the resource
 * @param {string} path - the path of the resource
 * @param {string[]} methods - the methods that the resource
 * implements
 * @param {string} [endpointName] - the endpoint associated
 * with the resource
 * @param {string} status - the status of the resource
 *
 * @returns {Object} The instance of the object representing
 * a resource
 *
 * @see {@link iotcs.message.Message.ResourceMessage.Resource.Status}
 * @memberOf iotcs.message.Message.ResourceMessage.Resource
 * @function buildResource
 */
lib.message.Message.ResourceMessage.Resource.buildResource = function (name, path, methods, status, endpointName) {

    _mandatoryArg(name, 'string');
    _mandatoryArg(path, 'string');
    _mandatoryArg(methods, 'string');
    methods.split(',').forEach( function (method) {
        if (['GET', 'PUT', 'POST', 'HEAD', 'OPTIONS', 'CONNECT', 'DELETE', 'TRACE'].indexOf(method) < 0) {
            lib.error('invalid method in resource message');
            return;
        }
    });
    _mandatoryArg(status, 'string');
    _optionalArg(endpointName, 'string');
    if (Object.keys(lib.message.Message.ResourceMessage.Resource.Status).indexOf(status) < 0) {
        lib.error('invalid status given');
        return;
    }

    var obj = {
        name: name,
        path: path,
        status: status,
        methods: methods.toString()
    };

    if (endpointName) {
        obj.endpointName = endpointName;
    }

    return obj;
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DirectlyConnectedDeviceImpl.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/** @ignore */
$impl.DirectlyConnectedDevice = function (taStoreFile, taStorePassword, gateway) {

    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    if (gateway) {
        Object.defineProperty(this._, 'gateway', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: gateway
        });
    }

    Object.defineProperty(this._, 'tam',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: new lib.device.TrustedAssetsManager(taStoreFile, taStorePassword)
    });

    Object.defineProperty(this._, 'bearer',{
        enumerable: false,
        configurable: true,
        writable: false,
        value: ""
    });

    Object.defineProperty(this._, 'activating',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: false
    });

    Object.defineProperty(this._, 'refreshing',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: false
    });

    var self = this;

    Object.defineProperty(this._, 'getCurrentServerTime',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            if (typeof self._.serverDelay === 'undefined') {
                return Date.now();
            } else {
                return (Date.now() + self._.serverDelay);
            }
        }
    });

    Object.defineProperty(this._, 'refresh_bearer',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (activation, callback) {

            self._.refreshing = true;

            var inputToSign = self._.tam.buildClientAssertion();

            if (!inputToSign) {
                self._.refreshing = false;
                var error1 = lib.createError('error on generating oauth signature', e);
                if (callback) {
                    callback(error1);
                }
                return;
            }

            var dataObject = {
                grant_type: 'client_credentials',
                client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                client_assertion: inputToSign,
                scope: (activation ? 'oracle/iot/activation' : '')
            };

            var payload = $port.util.query.stringify(dataObject, null, null, {encodeURIComponent: $port.util.query.unescape});

            payload = payload.replace(new RegExp(':', 'g'),'%3A');

            var options = {
                path: $impl.reqroot + '/oauth2/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                tam: self._.tam
            };

            $impl.protocolReq(options, payload, function (response_body, error) {

                self._.refreshing = false;

                if (!response_body || error || !response_body.token_type || !response_body.access_token) {
                    if (error) {
                        var exception = null;
                        try {
                            exception = JSON.parse(error.message);
                            var now = Date.now();
                            if (exception.statusCode && (exception.statusCode === 400)) {
                                if (exception.body) {
                                    try{
                                        var body = JSON.parse(exception.body);
                                        if ((body.currentTime) && (typeof self._.serverDelay === 'undefined') && (now < parseInt(body.currentTime))) {
                                            Object.defineProperty(self._, 'serverDelay', {
                                                enumerable: false,
                                                configurable: false,
                                                writable: false,
                                                value: (parseInt(body.currentTime) - now)
                                            });
                                            Object.defineProperty(self._.tam, 'serverDelay', {
                                                enumerable: false,
                                                configurable: false,
                                                writable: false,
                                                value: (parseInt(body.currentTime) - now)
                                            });
                                            self._.refresh_bearer(activation, callback);
                                            return;
                                        }
                                    } catch (e) {

                                    }
                                }
                                if (activation) {
                                    self._.tam.setEndpointCredentials(self._.tam.getClientId(), null);
                                    self._.refresh_bearer(false, function (error) {
                                        self._.activating = false;
                                        if (error) {
                                            callback(null, error);
                                            return;
                                        }
                                        callback(self);
                                    });
                                    return;
                                }

                            }
                        } catch (e) {

                        }
                        if (callback) {
                            callback(error);
                        }
                    } else {
                        if (callback) {
                            callback(new Error(JSON.stringify(response_body)));
                        }
                    }
                    return;
                }

                delete self._.bearer;
                Object.defineProperty(self._, 'bearer',{
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: (response_body.token_type + ' ' + response_body.access_token)
                });

                if (callback) {
                    callback();
                }

            }, null, self);
        }
    });


};

/** @ignore */
$impl.DirectlyConnectedDevice.prototype.activate = function (deviceModelUrns, callback) {

    _mandatoryArg(deviceModelUrns, 'array');
    _mandatoryArg(callback, 'function');

    var self = this;

    if (this.isActivated()) {
        lib.error('cannot activate an already activated device');
        return;
    }

    // #############################################################
    // CS 1.1 Server still has enrollment compliant with REST API v1
    //function enroll(host, port, id, secret, cert, device_register_handler) {

    function private_get_policy(error) {

        if (error) {
            callback(null, lib.createError('error on get policy for activation', error));
            return;
        }

        var options = {
            path: $impl.reqroot + '/activation/policy?OSName=' + $port.os.type() + '&OSVersion=' + $port.os.release(),
            method: 'GET',
            headers: {
                'Authorization': self._.bearer,
                'X-ActivationId': self._.tam.getClientId()
            },
            tam: self._.tam
        };

        $impl.protocolReq(options, "", function (response_body, error) {

            if (!response_body || error || !response_body.keyType || !response_body.hashAlgorithm || !response_body.keySize) {
                self._.activating = false;
                callback(null, lib.createError('error on get policy for activation', error));
                return;
            }

            private_key_generation_and_activation(response_body);
        }, null, self);
    }

    function private_key_generation_and_activation(parsed) {
        var algorithm = parsed.keyType;
        var hashAlgorithm = parsed.hashAlgorithm;
        var keySize = parsed.keySize;

        var isGenKeys = null;

        try {
            isGenKeys = self._.tam.generateKeyPair(algorithm, keySize);
        } catch (e) {
            self._.activating = false;
            callback(null, lib.createError('keys generation failed on activation',e));
            return;
        }

        if (!isGenKeys) {
            self._.activating = false;
            callback(null, lib.createError('keys generation failed on activation'));
            return;
        }

        var content = self._.tam.getClientId();

        var payload = {};

        try {

            var client_secret = self._.tam.signWithSharedSecret(content, 'sha256');

            var publicKey = self._.tam.getPublicKey();
            publicKey = publicKey.substring(publicKey.indexOf('----BEGIN PUBLIC KEY-----')
                + '----BEGIN PUBLIC KEY-----'.length,
                publicKey.indexOf('-----END PUBLIC KEY-----')).trim();

            var toBeSigned = forge.util.bytesToHex(forge.util.encodeUtf8(self._.tam.getClientId() + '\n' + algorithm + '\nX.509\nHmacSHA256\n'))
                + forge.util.bytesToHex(client_secret)
                + forge.util.bytesToHex(forge.util.decode64(publicKey));
            toBeSigned = forge.util.hexToBytes(toBeSigned);

            var signature = forge.util.encode64(self._.tam.signWithPrivateKey(toBeSigned, 'sha256'));

            payload = {
                certificationRequestInfo: {
                    subject: self._.tam.getClientId(),
                    subjectPublicKeyInfo: {
                        algorithm: algorithm,
                        publicKey: publicKey,
                        format: 'X.509',
                        secretHashAlgorithm: 'HmacSHA256'
                    },
                    attributes: {}
                },
                signatureAlgorithm: hashAlgorithm,
                signature: signature,
                deviceModels: deviceModelUrns
            };

            self._.tam.setEndpointCredentials(null, null);

        } catch (e) {
            self._.activating = false;
            callback(null, lib.createError('certificate generation failed on activation',e));
            return;
        }

        var options = {
            path : $impl.reqroot + '/activation/direct'
                    + (lib.oracle.iot.client.device.allowDraftDeviceModels ? '' : '?createDraft=false'),
            method : 'POST',
            headers : {
                'Authorization' : self._.bearer,
                'X-ActivationId' : self._.tam.getClientId()
            },
            tam: self._.tam
        };

        //console.log(JSON.stringify(payload, null, 4));

        $impl.protocolReq(options, JSON.stringify(payload), function (response_body, error) {

            if (!response_body || error || !response_body.endpointState || !response_body.endpointId) {
                self._.activating = false;
                callback(null,lib.createError('invalid response on activation',error));
                return;
            }

            if(response_body.endpointState !== 'ACTIVATED') {
                self._.activating = false;
                callback(null,lib.createError('endpoint not activated: '+JSON.stringify(response_body)));
                return;
            }

            try {
                self._.tam.setEndpointCredentials(response_body.endpointId, response_body.certificate);
            } catch (e) {
                self._.activating = false;
                callback(null,lib.createError('error when setting credentials on activation',e));
                return;
            }

            self._.refresh_bearer(false, function (error) {

                self._.activating = false;

                if (error) {
                    callback(null,lib.createError('error on authorization after activation',error));
                    return;
                }

                callback(self);
            });
        }, null, self);

    }

    self._.activating = true;

    // implementation-end of end-point auth/enroll method

    // ####################################################################################
    self._.refresh_bearer(true, private_get_policy);
};

/** @ignore */
$impl.DirectlyConnectedDevice.prototype.isActivated = function () {
    return this._.tam.isActivated();
};

/** @ignore */
$impl.DirectlyConnectedDevice.prototype.getEndpointId = function () {
    return this._.tam.getEndpointId();
};

function _getUtf8BytesLength(string) {
    return forge.util.createBuffer(string, 'utf8').length();
}

//////////////////////////////////////////////////////////////////////////////
// file: library/device/DirectlyConnectedDeviceUtil.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * @namespace
 * @alias iotcs.device.util
 * @memberOf iotcs.device
 */
lib.device.util = {};

/**
 * A directly-connected device is able to send messages to,
 * and receive messages from, the IoT server. When the
 * directly-connected device is activated on the server, the
 * server assigns a logical-endpoint identifier. This
 * logical-endpoint identifier is required for sending
 * messages to, and receiving messages from, the server.
 * <p>
 * The directly-connected device is able to activate itself using
 * the direct activation capability. The data required for activation
 * and authentication is retrieved from a TrustedAssetsStore generated
 * using the TrustedAssetsProvisioner tool using the Default TrustedAssetsManager.
 * <p>
 * This object represents the low level API for the directly-connected device
 * and uses direct methods for sending or receiving messages.
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 *
 * @memberOf iotcs.device.util
 * @alias DirectlyConnectedDevice
 * @class
 */
lib.device.util.DirectlyConnectedDevice = function (taStoreFile, taStorePassword, gateway) {

    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    var dcd = new $impl.DirectlyConnectedDevice(taStoreFile, taStorePassword, gateway);

    Object.defineProperty(this._, 'internalDev',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: dcd
    });

    var maxAcceptBytes = lib.oracle.iot.client.device.requestBufferSize;
    var receive_message_queue = [];
    var sending = false;

    var self = this;

    Object.defineProperty(this._, 'get_received_message',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            if (receive_message_queue.length > 0) {
                return receive_message_queue.splice(0, 1)[0];
            } else {
                return null;
            }
        }
    });

    Object.defineProperty(this._, 'send_receive_messages',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(messages, deliveryCallback, errorCallback, longPolling, timeout) {
            if (!dcd.isActivated()) {
                var error = lib.createError('device not yet activated');
                if (errorCallback) {
                    errorCallback(messages, error);
                }
                return;
            }
            var bodyArray = [];
            var i;
            var len = messages.length;

            for (i = 0; i < len; i++) {
                var messagePush = messages[i].getJSONObject();
                if (self._.internalDev._.serverDelay) {
                    bodyArray.push({
                        clientId: messagePush.clientId,
                        source: messagePush.source,
                        destination: messagePush.destination,
                        sender: messagePush.sender,
                        priority: messagePush.priority,
                        reliability: messagePush.reliability,
                        eventTime: messagePush.eventTime + self._.internalDev._.serverDelay,
                        type: messagePush.type,
                        properties: messagePush.properties,
                        payload: messagePush.payload
                    });
                } else {
                    bodyArray.push(messagePush);
                }
            }
            var post_body = JSON.stringify(bodyArray);
            var acceptBytes = maxAcceptBytes - _getUtf8BytesLength(JSON.stringify(receive_message_queue));
            if ((typeof acceptBytes !== 'number') || isNaN(acceptBytes) || (acceptBytes < 0) || (acceptBytes > maxAcceptBytes)) {
                var error1 = lib.createError('bad acceptBytes query parameter');
                if (errorCallback) {
                    errorCallback(messages, error1);
                }
                return;
            }
            var options = {
                path: $impl.reqroot + '/messages?acceptBytes=' + acceptBytes + (longPolling ? '&iot.sync' : '') + (timeout ? ('&iot.timeout=' + timeout) : ''),
                method: 'POST',
                headers: {
                    'Authorization': dcd._.bearer,
                    'X-EndpointId': dcd._.tam.getEndpointId()
                },
                tam: dcd._.tam
            };
            $impl.protocolReq(options, post_body, function (response_body, error) {

                if (!response_body || error) {
                    var err = error;
                    if (messages.length > 0) {
                        err = lib.createError('error on sending messages', error);
                    }
                    if (errorCallback) {
                        errorCallback(messages, err);
                    }
                    return;
                }

                if (Array.isArray(response_body) && response_body.length > 0) {
                    var i;
                    for (i = 0; i < response_body.length; i++) {
                        receive_message_queue.push(response_body[i]);
                    }
                } else if ((typeof response_body === 'object') && (response_body['x-min-acceptbytes'] !== 0)) {
                    var acceptBytes1 = maxAcceptBytes - _getUtf8BytesLength(JSON.stringify(receive_message_queue));
                    var bytes = parseInt(response_body['x-min-acceptbytes']);
                    if (bytes > maxAcceptBytes) {
                        lib.createError('The server has a request of ' + bytes +
                            ' bytes for this client, which is too large for the '+maxAcceptBytes+
                            ' byte request buffer. Please restart the client with larger value for the maxAcceptBytes property.');
                    } else if (bytes > acceptBytes1) {
                        lib.createError('The server has a request of ' + bytes +
                            ' which cannot be sent because the ' + maxAcceptBytes +
                            ' byte request buffer is filled with ' + (maxAcceptBytes - acceptBytes1) +
                            ' of unprocessed requests.');
                    }
                }

                if (deliveryCallback) {
                    deliveryCallback(messages);
                }

            }, function () {
                self._.send_receive_messages(messages, deliveryCallback, errorCallback, longPolling, timeout);
            }, dcd);
        }
    });

    if (dcd._.tam.getServerScheme && (dcd._.tam.getServerScheme().indexOf('mqtt') > -1)) {

        /*Object.defineProperty(this._, 'receiver',{
            enumerable: false,
            configurable: false,
            writable: true,
            value: function (messages, error) {
                if (!messages || error) {
                    lib.createError('invalid message', error);
                    return;
                }
                if (Array.isArray(messages) && messages.length > 0) {
                    var acceptBytes = maxAcceptBytes - _getUtf8BytesLength(JSON.stringify(receive_message_queue));
                    if (acceptBytes >= _getUtf8BytesLength(JSON.stringify(messages))) {
                        var i;
                        for (i = 0; i < messages.length; i++) {
                            receive_message_queue.push(messages[i]);
                        }
                    } else {
                        lib.createError('not enough space for receiving messages');
                    }
                }
            }
        });*/

        var messageRegisterMonitor = null;

        messageRegisterMonitor = new $impl.Monitor(function () {

            if (!dcd.isActivated()) {
                return;
            }

            if (messageRegisterMonitor) {
                messageRegisterMonitor.stop();
            }

            /*$impl.protocolRegister($impl.reqroot + '/messages', function (message, error) {
                self._.receiver(message, error);
            }, dcd);*/

            $impl.protocolRegister($impl.reqroot + '/messages/acceptBytes', function (message, error) {
                var acceptBytes1 = maxAcceptBytes - _getUtf8BytesLength(JSON.stringify(receive_message_queue));
                var logMessage = (error ? error.message : JSON.stringify(message));
                var buffer = forge.util.createBuffer(logMessage, 'utf8');
                var bytes = buffer.getInt32();
                if (bytes > maxAcceptBytes) {
                    lib.createError('The server has a request of ' + bytes +
                        ' bytes for this client, which is too large for the '+maxAcceptBytes+
                        ' byte request buffer. Please restart the client with larger value for the maxAcceptBytes property.');
                } else if (bytes > acceptBytes1) {
                    lib.createError('The server has a request of ' + bytes +
                        ' which cannot be sent because the ' + maxAcceptBytes +
                        ' byte request buffer is filled with ' + (maxAcceptBytes - acceptBytes1) +
                        ' of unprocessed requests.');
                }
            }, dcd);

        });

        messageRegisterMonitor.start();

    }

};

/**
 * Activate the device. The device will be activated on the
 * server if necessary. When the device is activated on the
 * server. The activation would tell the server the models that
 * the device implements. Also the activation can generate
 * additional authorization information that will be stored in
 * the TrustedAssetsStore and used for future authentication
 * requests. This can be a time/resource consuming operation for
 * some platforms.
 * <p>
 * If the device is already activated, this method will throw
 * an exception. The user should call the isActivated() method
 * prior to calling activate.
 *
 * @param {string[]} deviceModelUrns - an array of deviceModel
 * URNs implemented by this directly connected device
 * @param {function} callback - the callback function. This
 * function is called with this object but in the activated
 * state. If the activation is not successful then the object
 * will be null and an error object is passed in the form
 * callback(device, error) and the reason can be taken from
 * error.message
 *
 * @memberOf iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function activate
 */
lib.device.util.DirectlyConnectedDevice.prototype.activate = function (deviceModelUrns, callback) {

    if (this.isActivated()) {
        lib.error('cannot activate an already activated device');
        return;
    }

    _mandatoryArg(deviceModelUrns, 'array');
    _mandatoryArg(callback, 'function');

    deviceModelUrns.forEach(function (urn) {
        _mandatoryArg(urn, 'string');
    });

    var deviceModels = deviceModelUrns;
    deviceModels.push('urn:oracle:iot:dcd:capability:direct_activation');
    var self = this;
    this._.internalDev.activate(deviceModels, function(activeDev, error) {
        if (!activeDev || error) {
            callback(null, error);
            return;
        }
        callback(self);
    });
};

/**
 * This will return the directly connected device state.
 *
 * @returns {boolean} whether the device is activated.
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function isActivated
 */
lib.device.util.DirectlyConnectedDevice.prototype.isActivated = function () {
    return this._.internalDev.isActivated();
};

/**
 * Return the logical-endpoint identifier of this
 * directly-connected device. The logical-endpoint identifier
 * is assigned by the server as part of the activation
 * process.
 *
 * @returns {string} the logical-endpoint identifier of this
 * directly-connected device.
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function getEndpointId
 */
lib.device.util.DirectlyConnectedDevice.prototype.getEndpointId = function () {
    return this._.internalDev.getEndpointId();
};

/**
 * This method is used for sending messages to the server.
 * If the directly connected device is not activated an exception
 * will be thrown. If the device is not yet authenticated the method
 * will try first to authenticate the device and then send the messages.
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function send
 *
 * @param {iotcs.message.Message[]} messages - An array of the messages to be sent
 * @param {function} callback - The callback function. This
 * function is called with the messages that have been sent and in case of error
 * the actual error from sending as the second parameter.
 */
lib.device.util.DirectlyConnectedDevice.prototype.send = function (messages, callback) {

    if (!this.isActivated()) {
        lib.error('device not activated yet');
        return;
    }

    _mandatoryArg(messages, 'array');
    _mandatoryArg(callback, 'function');

    messages.forEach(function (message) {
        _mandatoryArg(message, lib.message.Message);
    });

    this._.send_receive_messages(messages, callback, callback);
};

/**
 * This method is used for retrieving messages. The DirectlyConnectedDevice
 * uses an internal buffer for the messages received that has a size of
 * 4192 bytes. When this method is called and there is at least one message
 * in the buffer, the first message from the buffer is retrieved. If no
 * message is in the buffer a force send of an empty message is tried so to
 * see if any messages are pending on the server side for the device and if there
 * are, the buffer will be filled with them and the first message retrieved.
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function receive
 *
 * @param {number} [timeout] - The forcing for retrieving the pending messages
 * will be done this amount of time.
 * @param {function} callback - The callback function. This function is called
 * with the first message received or null is no message is received in the
 * timeout period.
 */
lib.device.util.DirectlyConnectedDevice.prototype.receive = function (timeout, callback) {

    if (!this.isActivated()) {
        lib.error('device not activated yet');
        return;
    }

    if (typeof  timeout === 'function') {
        callback = timeout;
    } else {
        _optionalArg(timeout, 'number');
    }
    _mandatoryArg(callback, 'function');

    var message = this._.get_received_message();
    if (message) {
        callback(message);
    } else {
        var self = this;
        var startTime = Date.now();
        var monitor = null;
        var handleReceivedMessages = function () {
            message = self._.get_received_message();
            if (message || (timeout && (Date.now() > (startTime + timeout)))) {
                if (monitor) {
                    monitor.stop();
                }
                callback(message);
            }
        };
        var handleSendReceiveMessages = function () {
            if (self._.internalDev._.refreshing) {
                return;
            }
            self._.send_receive_messages([], handleReceivedMessages, handleReceivedMessages);
        };
        if (self._.receiver) {
            monitor = new $impl.Monitor(handleReceivedMessages);
            monitor.start();
        } else if (lib.oracle.iot.client.device.disableLongPolling) {
            monitor = new $impl.Monitor(handleSendReceiveMessages);
            monitor.start();
        } else {
            self._.send_receive_messages([], handleReceivedMessages, handleReceivedMessages, true, (typeof timeout === 'number' ? Math.floor(timeout/1000) : null));
        }
    }
};

/**
 * Get the device model for the urn.
 *
 * @param {string} deviceModelUrn - The URN of the device model
 * @param {function} callback - The callback function. This
 * function is called with the following argument: a
 * deviceModel object holding full description e.g. <code>{ name:"",
 * description:"", fields:[...], created:date,
 * isProtected:boolean, lastModified:date ... }</code>.
 * If an error occurs the deviceModel object is null
 * and an error object is passed: callback(deviceModel, error) and
 * the reason can be taken from error.message
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function getDeviceModel
 */
lib.device.util.DirectlyConnectedDevice.prototype.getDeviceModel = function (deviceModelUrn, callback) {
    new $impl.DeviceModelFactory().getDeviceModel(this, deviceModelUrn, callback);
};

/**
 * This method will close this directly connected device (client) and
 * all it's resources. All monitors required by the message dispatcher
 * associated with this client will be stopped, if there is one.
 *
 * @see {@link iotcs.device.util.MessageDispatcher}
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function close
 */
lib.device.util.DirectlyConnectedDevice.prototype.close = function () {
    if (this.dispatcher) {
        this.dispatcher._.stop();
    }
};

//////////////////////////////////////////////////////////////////////////////
// file: library/device/GatewayDeviceUtil.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This represents a GatewayDevice in the low level API.
 * It has the exact same specifications and capabilities as
 * a directly connected device from the low level API and additionally
 * it has the capability to register indirectly connected devices.
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 *
 * @memberOf iotcs.device.util
 * @alias GatewayDevice
 * @class
 * @extends iotcs.device.util.DirectlyConnectedDevice
 */
lib.device.util.GatewayDevice = function (taStoreFile, taStorePassword) {
    lib.device.util.DirectlyConnectedDevice.call(this, taStoreFile, taStorePassword, true);
};

lib.device.util.GatewayDevice.prototype = Object.create(lib.device.util.DirectlyConnectedDevice.prototype);
lib.device.util.GatewayDevice.constructor = lib.device.util.GatewayDevice;

/** @inheritdoc */
lib.device.util.GatewayDevice.prototype.activate = function (deviceModelUrns, callback) {

    if (this.isActivated()) {
        lib.error('cannot activate an already activated device');
        return;
    }

    _mandatoryArg(deviceModelUrns, 'array');
    _mandatoryArg(callback, 'function');

    deviceModelUrns.forEach(function (urn) {
        _mandatoryArg(urn, 'string');
    });

    var deviceModels = deviceModelUrns;
    deviceModels.push('urn:oracle:iot:dcd:capability:direct_activation');
    deviceModels.push('urn:oracle:iot:dcd:capability:indirect_activation');
    var self = this;
    this._.internalDev.activate(deviceModels, function(activeDev, error) {
        if (!activeDev || error) {
            callback(null, error);
            return;
        }
        callback(self);
    });
};

/**
 * Register an indirectly-connected device with the cloud
 * service. An indirectly-connected device only needs to be
 * registered once. After registering the indirectly-connected
 * device, the caller is responsible for keeping track of what
 * devices have been registered, the metadata, and for
 * persisting the endpoint id. On subsequent boots, the same
 * endpoint id is to be used for the indirectly-connected
 * device. Registering an indirectly-connected device that has
 * already been registered will result in an error given by the
 * server.
 * <p>
 * The hardwareId is a unique identifier within the Cloud
 * Service instance. The metadata argument should typically contain all the standard
 * metadata (the constants documented in This object) along
 * with any other vendor defined metadata.
 *
 * @param {string} hardwareid - an identifier unique within
 * the Cloud Service instance
 * @param {Object} metadata - the metadata of the device
 * @param {string[]} deviceModelUrns - array of device model
 * URNs supported by the indirectly connected device
 * @param {function(Object)} callback - the callback function. This
 * function is called with the following argument: the endpoint id
 * of the indirectly-connected device is the registration was successful
 * or null and an error object as the second parameter: callback(id, error).
 * The reason can be retrieved from error.message and it represents
 * the actual response from the server or any other network or framework
 * error that can appear.
 *
 * @memberof iotcs.device.util.GatewayDevice.prototype
 * @function registerDevice
 */
lib.device.util.GatewayDevice.prototype.registerDevice = function (hardwareId, metaData, deviceModelUrns, callback) {

    if (!this.isActivated()) {
        lib.error('device not activated yet');
        return;
    }

    _mandatoryArg(hardwareId, 'string');
    _mandatoryArg(metaData, 'object');
    _mandatoryArg(callback, 'function');

    deviceModelUrns.forEach(function (urn) {
        _mandatoryArg(urn, 'string');
    });

    var payload = metaData;
    payload.hardwareId = hardwareId;
    payload.deviceModels = deviceModelUrns;

    var self = this;

    var indirect_request;

    indirect_request = function () {
        var options = {
            path: $impl.reqroot + '/activation/indirect/device'
                    + (lib.oracle.iot.client.device.allowDraftDeviceModels ? '' : '?createDraft=false'),
            method: 'POST',
            headers: {
                'Authorization': self._.internalDev._.bearer,
                'X-EndpointId': self._.internalDev._.tam.getEndpointId()
            },
            tam: self._.internalDev._.tam
        };
        $impl.protocolReq(options, JSON.stringify(payload), function (response_body, error) {

            if (!response_body || error || !response_body.endpointState) {
                callback(null, lib.createError('invalid response on indirect registration', error));
                return;
            }

            if(response_body.endpointState !== 'ACTIVATED') {
                callback(null, lib.createError('endpoint not activated: '+JSON.stringify(response_body)));
                return;
            }

            callback(response_body.endpointId);

        },indirect_request, self._.internalDev);
    };

    indirect_request();

};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceModelFactory.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**@ignore*/
$impl.DeviceModelFactory = function () {

    if ($impl.DeviceModelFactory.prototype._singletonInstance) {
        return $impl.DeviceModelFactory.prototype._singletonInstance;
    }
    $impl.DeviceModelFactory.prototype._singletonInstance = this;

    this.cache = this.cache || {};
    this.cache.deviceModels = {};
};

/**@ignore*/
$impl.DeviceModelFactory.prototype.getDeviceModel = function (dcd, deviceModelUrn, callback) {

    _mandatoryArg(dcd, lib.device.util.DirectlyConnectedDevice);

    if (!dcd.isActivated()) {
        lib.error('device not activated yet');
        return;
    }

    _mandatoryArg(deviceModelUrn, 'string');
    _mandatoryArg(callback, 'function');

    var deviceModel = this.cache.deviceModels[deviceModelUrn];
    if (deviceModel) {
        callback(deviceModel);
        return;
    }

    var options = {
        path: $impl.reqroot + '/deviceModels/' + deviceModelUrn,
        method: 'GET',
        headers: {
            'Authorization': dcd._.internalDev._.bearer,
            'X-EndpointId': dcd._.internalDev._.tam.getEndpointId()
        },
        tam: dcd._.internalDev._.tam
    };

    var self = this;
    $impl.protocolReq(options, '', function (response, error) {
        if(!response || !(response.urn) || error){
            callback(null, lib.createError('invalid response on get device model',error));
            return;
        }
        var deviceModel = response;

        if(!lib.oracle.iot.client.device.allowDraftDeviceModels && deviceModel.draft) {
            callback(null, lib.createError('draft device model and library is not configured for draft models'));
            return;
        }

        Object.freeze(deviceModel);
        self.cache.deviceModels[deviceModelUrn] = deviceModel;
        callback(deviceModel);
    }, function () {
        self.getDeviceModel(dcd, deviceModelUrn, callback);
    }, dcd._.internalDev);
};

//////////////////////////////////////////////////////////////////////////////
// file: library/device/TestConnectivity.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**@ignore*/
$impl.TestConnectivity = function (messageDispatcher) {
    this.count = 0;
    this.currentCount = 0;
    this.size = 0;
    this.interval = 0;

    this.messageDispatcher = messageDispatcher;
    this.startPooling = null;

    var self = this;

    this.monitor = new $impl.Monitor( function () {
        var currentTime = Date.now();
        if (currentTime >= (self.startPooling + self.interval)) {

            if (messageDispatcher._.dcd.isActivated()) {

                var message = new lib.message.Message();
                message
                    .type(lib.message.Message.Type.DATA)
                    .source(messageDispatcher._.dcd.getEndpointId())
                    .format("urn:oracle:iot:dcd:capability:diagnostics:test_message")
                    .dataItem("count", self.currentCount)
                    .dataItem("payload", _strRepeat('*', self.size))
                    .priority(lib.message.Message.Priority.LOWEST);

                self.messageDispatcher.queue(message);
                self.currentCount = self.currentCount + 1;

            }

            self.startPooling = currentTime;

            if (self.currentCount === self.count) {
                self.monitor.stop();
                self.count = 0;
                self.currentCount = 0;
                self.size = 0;
                self.interval = 0;
            }
        }
    });

};

/**@ignore*/
$impl.TestConnectivity.prototype.startHandler = function (requestMessage) {
    var method = _getMethodForRequestMessage(requestMessage);
    if (!method || (method !== 'PUT')) {
        return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
    }
    var data = null;
    try {
        data = JSON.parse($port.util.atob(requestMessage.payload.body));
    } catch (e) {
        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
    }
    if (!data || !data.interval || !data.size || !data.count
        || (typeof data.interval !== 'number') || (data.interval % 1 !== 0)
        || (typeof data.size !== 'number') || (data.size < 0) || (data.size % 1 !== 0)
        || (typeof data.count !== 'number') || (data.count < 0) || (data.count % 1 !== 0)) {
        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
    }
    if (this.monitor.running) {
        return lib.message.Message.buildResponseMessage(requestMessage, 409, {}, 'Conflict', '');
    }
    this.size = data.size;
    this.interval = (data.interval < lib.oracle.iot.client.monitor.pollingInterval ? lib.oracle.iot.client.monitor.pollingInterval : data.interval);
    this.count = data.count;
    this.currentCount = 0;
    this.startPooling = Date.now();
    this.monitor.start();
    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
};

/**@ignore*/
$impl.TestConnectivity.prototype.stopHandler = function (requestMessage) {
    var method = _getMethodForRequestMessage(requestMessage);
    if (!method || (method !== 'PUT')) {
        return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
    }
    this.monitor.stop();
    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
};

/**@ignore*/
$impl.TestConnectivity.prototype.testHandler = function (requestMessage) {
    var method = _getMethodForRequestMessage(requestMessage);
    if (!method || (method !== 'GET')) {
        return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
    }
    var obj = {
        active: this.monitor.running,
        count: this.count,
        currentCount: this.currentCount,
        interval: this.interval,
        size: this.size
    };
    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, JSON.stringify(obj), '');
};

function _strRepeat(str, qty) {
    if (qty < 1) return '';
    var result = '';
    while (qty > 0) {
        if (qty & 1) {
            result += str;
        }
        qty >>= 1;
        str = str + str;
    }
    return result;
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/MessageDispatcher.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This object is used for store and forward messages
 * to the cloud by using a priority queue and handling the
 * priority attribute of messages. It is also used for
 * monitoring received messages and any errors that can
 * arise when sending messages.
 * <p>
 * There can be only one MessageDispatcher instance per
 * DirectlyConnectedDevice at a time and it is created
 * at first use. To close an instance of a MessageDispatcher
 * the DirectlyConnectedDevice.close method must be used.
 * <p>
 * The message dispatcher uses the RequestDispatcher
 * for dispatching automatically request messages that
 * come from the server and generate response messages
 * to the server.
 * <p>
 * The onDelivery and onError attributes can be used to
 * set handlers that are called when messages are successfully
 * delivered or an error occurs:<br>
 * <code>messageDispatcher.onDelivery = function (messages);</code><br>
 * <code>messageDispatcher.onError = function (messages, error);</code><br>
 * Where messages is an array of the iotcs.message.Message object
 * representing the messages that were sent or not and error is
 * an Error object.
 * <p>
 * Also the MessageDispatcher implements the message dispatcher,
 * diagnostics and connectivity test capabilities.
 *
 * @see {@link iotcs.message.Message}
 * @see {@link iotcs.message.Message.Priority}
 * @see {@link iotcs.device.util.RequestDispatcher}
 * @see {@link iotcs.device.util.DirectlyConnectedDevice#close}
 * @memberOf iotcs.device.util
 * @alias MessageDispatcher
 * @class
 *
 * @param {iotcs.device.util.DirectlyConnectedDevice} dcd - The directly
 * connected device (low level API) associated with this message dispatcher
 */
lib.device.util.MessageDispatcher = function (dcd) {

    _mandatoryArg(dcd, lib.device.util.DirectlyConnectedDevice);

    if (dcd.dispatcher) {
        return dcd.dispatcher;
    }

    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this._, 'dcd', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: dcd
    });

    Object.defineProperty(this, 'onDelivery', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.onDelivery;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onDelivery that is not a function!');
                return;
            }
            this._.onDelivery = newValue;
        }
    });

    this._.onDelivery = function (arg) {};

    Object.defineProperty(this, 'onError', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.onError;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onDelivery that is not a function!');
                return;
            }
            this._.onError = newValue;
        }
    });

    this._.onError = function (arg1, arg2) {};

    var queue = new $impl.PriorityQueue(lib.oracle.iot.client.device.maximumMessagesToQueue);
    var client = dcd;

    Object.defineProperty(this._, 'push', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (message) {
            queue.push(message);
        }
    });

    var poolingInterval = lib.oracle.iot.client.device.defaultMessagePoolingInterval;
    var startPooling = null;
    var startTime = dcd._.internalDev._.getCurrentServerTime();

    var totalMessagesSent = 0;
    var totalMessagesReceived = 0;
    var totalMessagesRetried = 0;
    var totalBytesSent = 0;
    var totalBytesReceived = 0;
    var totalProtocolErrors = 0;

    var connectivityTestObj = new $impl.TestConnectivity(this);

    var handlers = {
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/counters": function (requestMessage) {
                var method = _getMethodForRequestMessage(requestMessage);
                if (!method || method !== 'GET') {
                    return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
                }
                var counterObj = {
                    totalMessagesSent: totalMessagesSent,
                    totalMessagesReceived: totalMessagesReceived,
                    totalMessagesRetried: totalMessagesRetried,
                    totalBytesSent: totalBytesSent,
                    totalBytesReceived: totalBytesReceived,
                    totalProtocolErrors: totalProtocolErrors
                };
                return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, JSON.stringify(counterObj), '');
            },
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/reset": function (requestMessage) {
                var method = _getMethodForRequestMessage(requestMessage);
                if (!method || (method !== 'PUT')) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
                }
                totalMessagesSent = 0;
                totalMessagesReceived = 0;
                totalMessagesRetried = 0;
                totalBytesSent = 0;
                totalBytesReceived = 0;
                totalProtocolErrors = 0;
                return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
            },
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/pollingInterval": function (requestMessage) {
                var method = _getMethodForRequestMessage(requestMessage);
                if (!method || ((method !== 'PUT') && (method !== 'GET'))) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
                }
                if (method === 'GET') {
                    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, JSON.stringify({pollingInterval: poolingInterval}), '');
                } else {
                    var data = null;
                    try {
                        data = JSON.parse($port.util.atob(requestMessage.payload.body));
                    } catch (e) {
                        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                    }
                    if (!data || (typeof data.pollingInterval !== 'number') || (data.pollingInterval % 1 !== 0)) {
                        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                    }
                    poolingInterval = (data.pollingInterval < lib.oracle.iot.client.monitor.pollingInterval ? lib.oracle.iot.client.monitor.pollingInterval : data.pollingInterval);
                    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
                }
            },
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/info": function (requestMessage) {
            var method = _getMethodForRequestMessage(requestMessage);
            if (!method || method !== 'GET') {
                return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
            }
            var obj = {
                freeDiskSpace: 'Unknown',
                ipAddress: 'Unknown',
                macAddress: 'Unknown',
                totalDiskSpace: 'Unknown',
                version: 'Unknown'
            };
            if ($port.util.diagnostics) {
                obj = $port.util.diagnostics();
            }
            obj.startTime = startTime;
            return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, JSON.stringify(obj), '');
        },
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/testConnectivity": function (requestMessage) {
            var method = _getMethodForRequestMessage(requestMessage);
            var data = null;
            try {
                data = JSON.parse($port.util.atob(requestMessage.payload.body));
            } catch (e) {
                return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
            }
            if (!data || ((method === 'PUT') && (typeof data.active !== 'boolean'))) {
                return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
            }
            if (method === 'PUT') {
                if (data.active) {
                    return connectivityTestObj.startHandler(requestMessage);
                } else {
                    return connectivityTestObj.stopHandler(requestMessage);
                }
            } else {
                return connectivityTestObj.testHandler(requestMessage);
            }
        }
    };

    var handlerMethods = {
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/counters": 'GET',
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/reset": 'PUT',
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/pollingInterval": 'GET,PUT',
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/info": 'GET',
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/testConnectivity": 'GET,PUT'
    };


    var self = this;

    var deliveryCallback = function (messages) {
        totalMessagesSent = totalMessagesSent + messages.length;
        messages.forEach(function (message) {
            totalBytesSent = totalBytesSent + _getUtf8BytesLength(JSON.stringify(message));
        });
        self.onDelivery(messages);
    };

    var errorCallback = function (messages, error) {
        totalProtocolErrors = totalProtocolErrors + 1;
        self.onError(messages, error);
    };

    var handleReceivedMessages = function (messages, error) {
        try {
            if (error) {
                errorCallback(messages, error);
            } else {
                deliveryCallback(messages);
            }
        } catch (e) {

        }
        var message = client._.get_received_message();
        while (message) {
            totalMessagesReceived = totalMessagesReceived + 1;
            totalBytesReceived = totalBytesReceived + _getUtf8BytesLength(JSON.stringify(message));
            if (message.type === lib.message.Message.Type.REQUEST) {
                self.queue(self.getRequestDispatcher().dispatch(message));
            }
            message = client._.get_received_message();
        }
    };

    var longPollingStarted = false;

    var sendMonitor = new $impl.Monitor(function () {
        var currentTime = Date.now();
        if (currentTime >= (startPooling + poolingInterval)) {
            if (!dcd.isActivated() || dcd._.internalDev._.activating || dcd._.internalDev._.refreshing) {
                startPooling = currentTime;
                return;
            }
            var sent = false;
            var message = queue.pop();
            while (message !== null) {
                sent = true;
                var index = 0;
                var messageArr = [];
                while ((index < lib.oracle.iot.client.device.maximumMessagesPerConnection) && (message !== null)) {
                    messageArr.push(message);
                    message = queue.pop();
                }
                client._.send_receive_messages(messageArr, handleReceivedMessages, handleReceivedMessages);
                message = queue.pop();
            }
            if (!sent && !client._.receiver && lib.oracle.iot.client.device.disableLongPolling) {
                client._.send_receive_messages([], handleReceivedMessages, handleReceivedMessages);
            }
            if (!client._.receiver && !lib.oracle.iot.client.device.disableLongPolling) {
                var longPollCallback = null;
                longPollCallback = function (messages, error) {
                    if (!error) {
                        client._.send_receive_messages([], longPollCallback, longPollCallback, true);
                    } else {
                        longPollingStarted = false;
                    }
                    handleReceivedMessages(messages, error);
                };
                if (!longPollingStarted) {
                    client._.send_receive_messages([], longPollCallback, longPollCallback, true);
                    longPollingStarted = true;
                }
            }
            startPooling = currentTime;
        }
    });

    if (client._.receiver) {
        var oldReceiver = client._.receiver;
        client._.receiver = function (messages, error) {
            oldReceiver(messages, error);
            var message = client._.get_received_message();
            while (message) {
                totalMessagesReceived = totalMessagesReceived + 1;
                totalBytesReceived = totalBytesReceived + _getUtf8BytesLength(JSON.stringify(message));
                if (message.type === lib.message.Message.Type.REQUEST) {
                    self.queue(self.getRequestDispatcher().dispatch(message));
                }
                message = client._.get_received_message();
            }
        };
    }

    var resourceMessageMonitor = null;

    resourceMessageMonitor = new $impl.Monitor(function () {

        if (!dcd.isActivated()) {
            return;
        }

        if (resourceMessageMonitor) {
            resourceMessageMonitor.stop();
        }

        for (var path in handlers) {
            self.getRequestDispatcher().registerRequestHandler(dcd.getEndpointId(), path, handlers[path]);
        }
        var resources = [];
        for (var path1 in handlerMethods) {
            resources.push(lib.message.Message.ResourceMessage.Resource.buildResource(path1, path1, handlerMethods[path1], lib.message.Message.ResourceMessage.Resource.Status.ADDED));
        }
        var message = lib.message.Message.ResourceMessage.buildResourceMessage(resources, dcd.getEndpointId(), lib.message.Message.ResourceMessage.Type.UPDATE, lib.message.Message.ResourceMessage.getMD5ofList(Object.keys(handlerMethods)))
            .source(dcd.getEndpointId())
            .priority(lib.message.Message.Priority.HIGHEST);
        self.queue(message);
    });

    resourceMessageMonitor.start();

    Object.defineProperty(this._, 'stop', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            sendMonitor.stop();
            if (resourceMessageMonitor) {
                resourceMessageMonitor.stop();
            }
        }
    });

    Object.defineProperty(dcd, 'dispatcher', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: this
    });

    startPooling = Date.now();
    sendMonitor.start();
    startTime = dcd._.internalDev._.getCurrentServerTime();

};

/**
 * This method returns the RequestDispatcher used by this
 * MessageDispatcher for dispatching messages.
 *
 * @returns {iotcs.device.util.RequestDispatcher} The RequestDispatcher
 * instance
 *
 * @memberOf iotcs.device.util.MessageDispatcher.prototype
 * @function getRequestDispatcher
 */
lib.device.util.MessageDispatcher.prototype.getRequestDispatcher = function () {
    return new lib.device.util.RequestDispatcher();
};

/**
 * This method adds a message to the queue of this MessageDispatcher
 * to be sent to the cloud.
 *
 * @param {iotcs.message.Message} message - the message to be sent
 *
 * @memberOf iotcs.device.util.MessageDispatcher.prototype
 * @function queue
 */
lib.device.util.MessageDispatcher.prototype.queue = function (message) {

    _mandatoryArg(message, lib.message.Message);

    this._.push(message);
};

function _getMethodForRequestMessage(requestMessage){
    var method = null;
    if (requestMessage.payload && requestMessage.payload.method) {
        method = requestMessage.payload.method.toUpperCase();
    }
    if (requestMessage.payload.headers && Array.isArray(requestMessage.payload.headers['x-http-method-override']) && (requestMessage.payload.headers['x-http-method-override'].length > 0)) {
        method = requestMessage.payload.headers['x-http-method-override'][0].toUpperCase();
    }
    return method;
}







//////////////////////////////////////////////////////////////////////////////
// file: library/device/RequestDispatcher.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This object is used for request messages dispatch.
 * You can register handlers to an instance of this
 * object that will handle request messages that come
 * from the cloud and will return a response message
 * associated for that request message.
 * <p>
 * There can be only one instance of This object (singleton)
 * generated at first use.
 *
 * @memberOf iotcs.device.util
 * @alias RequestDispatcher
 * @class
 */
lib.device.util.RequestDispatcher = function () {

    if (lib.device.util.RequestDispatcher.prototype._singletonInstance) {
        return lib.device.util.RequestDispatcher.prototype._singletonInstance;
    }
    lib.device.util.RequestDispatcher.prototype._singletonInstance = this;

    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this._, 'requestHandlers', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    Object.defineProperty(this._, 'defaultHandler', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (requestMessage) {
            return lib.message.Message.buildResponseMessage(requestMessage, 404, {}, 'Not Found', '');
        }
    });



};

/**
 * This is main function of the RequestDispatcher that
 * dispatches a request message to the appropriate handler,
 * if one is found and the handler is called so the
 * appropriate response message is returned. If no handler
 * is found, the RequestDispatcher implements a default request
 * message dispatcher that would just return a
 * 404 (Not Found) response message. This method will never
 * return null.
 *
 * @param {object} requestMessage - the request message to dispatch
 *
 * @returns {iotcs.message.Message} The response message associated
 * with the request.
 *
 * @memberOf iotcs.device.util.RequestDispatcher.prototype
 * @function dispatch
 */
lib.device.util.RequestDispatcher.prototype.dispatch = function (requestMessage) {
    if (!requestMessage || !requestMessage.type
        || (requestMessage.type !== lib.message.Message.Type.REQUEST)
        || !requestMessage.destination
        || !requestMessage.payload
        || !requestMessage.payload.url
        || !this._.requestHandlers[requestMessage.destination]
        || !this._.requestHandlers[requestMessage.destination][requestMessage.payload.url]) {
        return this._.defaultHandler(requestMessage);
    }
    var message = this._.requestHandlers[requestMessage.destination][requestMessage.payload.url](requestMessage);
    if (!message || !(message instanceof lib.message.Message)
        || (message.getJSONObject().type !== lib.message.Message.Type.RESPONSE)) {
        return this._.defaultHandler(requestMessage);
    }
    return message;
};

/**
 * This method registers a handler to the RequestDispatcher.
 * The handler is a function that must have the form:<br>
 * <code>handler = function (requestMessage) { ... return responseMessage};</code><br>
 * Where requestMessage if a JSON representing the exact message
 * received from the cloud that has the type REQUEST and
 * responseMessage is an instance of iotcs.message.Message that has type RESPONSE.
 * If neither of the conditions are satisfied the RequestDispatcher
 * will use the default handler.
 * <p>
 * It is advisable to use the iotcs.message.Message.buildResponseMessage
 * method for generating response messages.
 *
 * @param {string} endpointId - the endpointId that is the destination
 * of the request message
 * @param {string} path - the path that is the "address" (resource definition)
 * of the request message
 * @param {function} handler - tha actual handler to be registered
 *
 * @see {@link iotcs.message.Message.Type}
 * @see {@link iotcs.message.Message.buildResponseMessage}
 * @memberOf iotcs.device.util.RequestDispatcher.prototype
 * @function registerRequestHandler
 */
lib.device.util.RequestDispatcher.prototype.registerRequestHandler = function (endpointId, path, handler) {

    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(path, 'string');
    _mandatoryArg(handler, 'function');

    if (!this._.requestHandlers[endpointId]) {
        this._.requestHandlers[endpointId] = {};
    }
    this._.requestHandlers[endpointId][path] = handler;
};

/**
 * Returns a registered request handler, if it is registered,
 * otherwise null.
 *
 * @param {string} endpointId - the endpoint id that the handler
 * was registered with
 * @param {string} path - the path that the handler was registered
 * with
 *
 * @returns {function} The actual handler or null
 *
 * @memberOf iotcs.device.util.RequestDispatcher.prototype
 * @function getRequestHandler
 */
lib.device.util.RequestDispatcher.prototype.getRequestHandler = function (endpointId, path) {

    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(path, 'string');

    if (!this._.requestHandlers[endpointId] || !this._.requestHandlers[endpointId][path]) {
        return null;
    }
    return this._.requestHandlers[endpointId][path];
};

/**
 * This method removed a handler from the registered handlers
 * list of the RequestDispatcher. If handler is present as parameter,
 * then endpointId and path parameters are ignored.
 *
 * @param {function} handler - the reference to the handler to
 * be removed
 * @param {string} endpointId - he endpoint id that the handler
 * was registered with
 * @param {string} path - the path that the handler was registered
 * with
 *
 * @memberOf iotcs.device.util.RequestDispatcher.prototype
 * @function unregisterRequestHandler
 */
lib.device.util.RequestDispatcher.prototype.unregisterRequestHandler = function (handler, endpointId, path) {

    if (handler && (typeof handler === 'string')) {
        endpointId = handler;
        path = endpointId;
        handler = null;
    }

    if (handler && (typeof handler === 'function')) {
        Object.keys(this._.requestHandlers).forEach(function (endpointId){
            Object.keys(this._.requestHandlers[endpointId]).forEach(function (path) {
                delete this._.requestHandlers[endpointId][path];
                if (Object.keys(this._.requestHandlers[endpointId]).length === 0) {
                    delete this._.requestHandlers[endpointId];
                }
            });
        });
        return;
    } else {
        _mandatoryArg(endpointId, 'string');
        _mandatoryArg(path, 'string');
    }

    if (!this._.requestHandlers[endpointId] || !this._.requestHandlers[endpointId][path]) {
        return;
    }
    delete this._.requestHandlers[endpointId][path];
    if (Object.keys(this._.requestHandlers[endpointId]).length === 0) {
        delete this._.requestHandlers[endpointId];
    }
};

//////////////////////////////////////////////////////////////////////////////
// file: library/device/Attribute.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: missing jsdoc

/**
 * @class
 */
/** @ignore */
$impl.Attribute = function (attributeSpec) {
    _mandatoryArg(attributeSpec, 'object');

    if ((!attributeSpec.name) || (!attributeSpec.type)) {
        lib.error('attribute specification in device model is incomplete');
        return;
    }

    var spec = {
        name: attributeSpec.name,
        description: (attributeSpec.description || ''),
        type: attributeSpec.type,
        writable: (attributeSpec.writable || false),
        alias: (attributeSpec.alias || null)
    };

    if (attributeSpec.range) {
        spec.range = _parseRange(spec.type, attributeSpec.range);
    }

    /** @private */
    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });
    this._.value = null;
    this._.lastKnownValue = null;
    this._.lastUpdate = null;

    var self = this;

    //@TODO: see comment in AbstractVirtualDevice; this is not clean especially it is supposed to be a private function and yet used in 4 other objects ...etc...; this looks like a required ((semi-)public) API ... or an $impl.XXX or a function ()...

    /** @private */
    Object.defineProperty(this._, 'remoteUpdate', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (newValue, onlyValidation) {

            try {
                newValue = _checkAndGetNewValue(newValue, spec);
            } catch (e) {
                lib.createError('invalid value', e);
                return false;
            }

            if (!spec.writable) {
                lib.createError('trying to set a read only value');
                return false;
            }

            if (typeof newValue === 'undefined') {
                lib.createError('trying to set an invalid value');
                return false;
            }

            if (spec.range && ((newValue < spec.range.low) || (newValue > spec.range.high))) {
                lib.createError('trying to set a value out of range [' + spec.range.low + ' - ' + spec.range.high + ']');
                return false;
            }

            if (!onlyValidation) {

                self._.lastUpdate = Date.now();

                if (_equal(newValue, self._.lastKnownValue, spec)) {
                    return true;
                }

                self._.lastKnownValue = newValue;

                lib.log('updating attribute "' + spec.name + '" of type "' + spec.type + '" from ' + self._.value + ' to ' + newValue);
                self._.value = newValue;

            }
            return true;
        }
    });

    /** @private */
    Object.defineProperty(this._, 'onUpdateResponse', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (error) {
            if (error) {
                lib.log('updating attribute "' + spec.name + '" of type "' + spec.type + '" from ' + self._.value + ' to ' + self._.lastKnownValue);
                self._.value = self._.lastKnownValue;
            } else {
                self._.lastKnownValue = self._.value;
            }
            self._.lastUpdate = new Date().getTime();
        }
    });

    /** @private */
    Object.defineProperty(this._, 'localUpdate', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (newValue, nosync) {

            newValue = _checkAndGetNewValue(newValue, spec);

            if (typeof newValue === 'undefined') {
                lib.error('trying to set an invalid value');
                return;
            }

            if (spec.range && ((newValue < spec.range.low) || (newValue > spec.range.high))) {
                lib.error('trying to set a value out of range [' + spec.range.low + ' - ' + spec.range.high + ']');
                return;
            }

            if (_equal(newValue, self._.value, spec)) {
                return;
            }

            lib.log('updating attribute "' + spec.name + '" of type "' + spec.type + '" from ' + self._.value + ' to ' + newValue);
            self._.value = newValue;

            if (!nosync) {
                var attributes = {};
                attributes[spec.name] = newValue;
                if (!self.device || !(self.device instanceof lib.device.VirtualDevice)) {
                    return;
                }
                self.device._.updateAttributes(attributes);
            }
        }
    });


    // public properties

    /**
     * @memberof iotcs.Attribute
     * @member {string} id - the unique/reproducible
     * id for this attribute (usually its name)
     */
    Object.defineProperty(this, 'id', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.name
    });

    /**
     * @memberof iotcs.Attribute
     * @member {string} description - the description
     * of this attribute
     */
    Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.description
    });

    /**
     * @memberof iotcs.Attribute
     * @member {string} type - one of <code>INTEGER</code>,
     * <code>NUMBER</code>, <code>STRING</code>, <code>BOOLEAN</code>,
     * <code>DATETIME</code>
     */
    Object.defineProperty(this, 'type', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.type
    });

    /**
     * @ignore
     * @memberof iotcs.Attribute
     * @member {boolean} writable - expressing whether
     * this attribute is writable or not
     */
    Object.defineProperty(this, 'writable', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.writable
    });

    /**
     * @memberof iotcs.Attribute
     * @member {function(Object)} onChange - function called
     * back when value as changed on the server side. Callback
     * signature is <code>function (e) {}</code>, where <code>e</code>
     * is <code>{'attribute':this, 'newValue':, 'oldValue':}</code>
     */
    Object.defineProperty(this, 'onChange', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.onChange;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set to onChange something that is not a function!');
                return;
            }
            this._.onChange = newValue;
        }
    });

    /**
     * @memberof iotcs.Attribute
     * @member {function(Object)} onError - function called
     * back when value could not be changed. Callback signature is
     * <code>function (e) {}</code>, where <code>e</code> is
     * <code>{'attribute':this, 'newValue':, 'tryValue':}</code>
     */
    Object.defineProperty(this, 'onError', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.onError;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set to onError something that is not a function!');
                return;
            }
            this._.onError = newValue;
        }
    });

    /**
     * @memberof iotcs.Attribute
     * @member {(number|string|boolean|Date)} value - used for setting or
     * getting the current value of this attribute (subject to whether it is writable
     * or not).
     */
    Object.defineProperty(this, 'value', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.value;
        },
        set: function (newValue) {
            this._.localUpdate(newValue, false);
        }
    });

    /**
     * @memberof iotcs.Attribute
     * @member {(number|string|boolean|Date)} lastKnownValue -
     * used for getting the current value of this attribute
     */
    Object.defineProperty(this, 'lastKnownValue', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.lastKnownValue;
        },
        set: function (newValue) {
            return;
        }
    });

    /**
     * @memberof iotcs.Attribute
     * @member {Date} lastUpdate - the date of the last value update
     */
    Object.defineProperty(this, 'lastUpdate', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.lastUpdate;
        },
        set: function (newValue) {
            return;
        }
    });
};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
function _parseRange(type, rangeStr) {
    _mandatoryArg(type, 'string');
    _mandatoryArg(rangeStr, 'string');
    if ((type !== 'NUMBER') && (type !== 'INTEGER')) {
        lib.error('device model specification is invalid');
        return;
    }
    var rangeLimits = rangeStr.split(',');
    if (rangeLimits.length != 2) {
        lib.error('device model specification is invalid');
        return;
    }
    var first = parseFloat(rangeLimits[0]);
    var second = parseFloat(rangeLimits[1]);
    return { low:Math.min(first,second), high:Math.max(first,second) };
}

/** @ignore */
function _matchType(reqType, value) {
    _mandatoryArg(reqType, 'string');
    switch(reqType) {
        case 'INTEGER':
            return ((typeof value === 'number') && (value % 1 === 0));
        case 'NUMBER':
            return (typeof value === 'number');
        case 'STRING':
            return (typeof value === 'string');
        case 'BOOLEAN':
            return (typeof value === 'boolean');
        case 'DATETIME':
            return (value instanceof Date);
        default:
            lib.error('illegal state');
            return;
    }
}

/** @ignore */
function _checkAndGetNewValue(newValue, spec) {
    if (spec.type === 'DATETIME') {
        if (typeof newValue === 'number') {
            var str = '' + newValue;
            if (str.match(/^[-+]?[1-9]\.[0-9]+e[-]?[1-9][0-9]*$/)) {
                newValue = newValue.toFixed();
            }
        }
        newValue = new Date(newValue);
        if (isNaN(newValue.getTime())) {
            lib.error('invalid date in date time parameter');
            return;
        }
    }
    if (!_matchType(spec.type, newValue)) {
        lib.error('type mismatch; attribute "' + spec.name + '" has type [' + spec.type + ']');
        return;
    }
    return newValue;
}

/** @ignore */
function _equal(newValue, oldValue, spec) {
    if (spec.type === 'DATETIME'
        && (newValue instanceof Date)
        && (oldValue instanceof Date)) {
        return (newValue.getTime() === oldValue.getTime());
    } else {
        return (newValue === oldValue);
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Action.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: missing JSDOC

/**
 * @class
 */
/** @ignore */
$impl.Action = function (actionSpec) {
    _mandatoryArg(actionSpec, 'object');

    if (!actionSpec.name) {
        lib.error('attribute specification in device model is incomplete');
        return;
    }

    var spec = {
        name: actionSpec.name,
        description: (actionSpec.description || ''),
        argType: (actionSpec.argType || null),
        alias: (actionSpec.alias || null)
    };

    if (actionSpec.range) {
        spec.range = _parseRange(spec.argType, actionSpec.range);
    }

    /** @private */
    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    // public members

    /**
     * @memberof iotcs.Action
     * @member {string} name - the name of this action
     */
    Object.defineProperty(this, 'name', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.name
    });

    /**
     * @memberof iotcs.Action
     * @member {string} description - the description of this action
     */
    Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.description
    });

    /**
     * @memberof iotcs.Action
     * @member {function(Object)} onExecute - the action to perform when the an execute() is
     * received from the other party
     */
    Object.defineProperty(this, 'onExecute', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.onExecute;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onExecute that is not a function!');
                return;
            }
            this._.onExecute = newValue;
        }
    });
    this._.onExecute = null;

    /** @private */
    this.checkVarArg = function (arg) {
        if (!spec.argType) {
            if (typeof arg !== 'undefined') {
                lib.createError('invalid number of arguments');
                return false;
            }
        } else {
            if (typeof arg === 'undefined') {
                lib.createError('invalid number of arguments');
                return false;
            }
            if (!_matchType(spec.argType, arg)) {
                lib.createError('type mismatch; action "'+spec.name+'" requires arg type [' + spec.argType + ']');
                return false;
            }
            if (spec.range && ((arg<spec.range.low) || (arg>spec.range.high))) {
                lib.createError('trying to use an argument which is out of range ['+spec.range.low+' - '+spec.range.high+']');
                return false;
            }
        }
        return true;
    };
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Alert.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The Alert is an object that represents an alert type message format
 * define din the formats section of the device model. Alerts can be used
 * to send alert messages to the server.
 * <p>
 * The Alert API is specific to the device client library and the alerts
 * can be created by the VirtualDevice objects or using them.
 * For setting the fields of the alert as defined in the model, the fields
 * property of the alert will be used e.g.:<br>
 * <code>alert.fields.temp = 50;</code>
 * <p>
 * The constructor of the Alert should not be used directly but the
 * {@link iotcs.device.VirtualDevice#createAlert} method should be used
 * for creating alert objects.
 *
 * @memberOf iotcs.device
 * @alias Alert
 * @class
 *
 * @param {iotcs.device.VirtualDevice} virtualDevice - the virtual device that has
 * in it's device model the alert specification
 * @param {string} formatUrn - the urn format of the alert spec
 *
 * @see {@link iotcs.device.VirtualDevice#createAlert}
 */
lib.device.Alert = function (virtualDevice, formatUrn) {
    _mandatoryArg(virtualDevice, lib.device.VirtualDevice);
    _mandatoryArg(formatUrn, 'string');

    var alertSpec = virtualDevice[formatUrn];

    if (!alertSpec.urn || (alertSpec.type !== 'ALERT')) {
        lib.error('alert specification in device model is invalid');
        return;
    }

    this.device = virtualDevice;

    var spec = {
        urn: alertSpec.urn,
        description: (alertSpec.description || ''),
        name: (alertSpec.name || null)
    };


    if (alertSpec.value && alertSpec.value.fields && Array.isArray(alertSpec.value.fields)) {

        Object.defineProperty(this, 'fields', {
            enumerable: true,
            configurable: false,
            writable: false,
            value: {}
        });

        Object.defineProperty(this, '_', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
        });

        var self = this;

        alertSpec.value.fields.forEach(function (field) {

            self._[field.name] = {};
            self._[field.name].type = field.type.toUpperCase();
            self._[field.name].optional = field.optional;
            self._[field.name].name = field.name;
            self._[field.name].value = null;
            Object.defineProperty(self.fields, field.name, {
                enumerable: false,
                configurable: false,
                get: function () {
                    return self._[field.name].value;
                },
                set: function (newValue) {

                    if (!self._[field.name].optional && ((typeof newValue === 'undefined') || (newValue === null))) {
                        lib.error('trying to unset a mandatory field in the alert');
                        return;
                    }

                    newValue = _checkAndGetNewValue(newValue, self._[field.name]);

                    if (typeof newValue === 'undefined') {
                        lib.error('trying to set an invalid type of field in the alert');
                        return;
                    }

                    self._[field.name].value = newValue;
                }
            });

        });
    }

    // public members

    Object.defineProperty(this, 'urn', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.urn
    });

    Object.defineProperty(this, 'name', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.name
    });

    Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.description
    });

};

/**
 * This method is used to actually send the alert message to the server.
 * The default severity for the alert sent is SIGNIFICANT.
 * All mandatory fields (according to the device model definition)
 * must be set before sending, otherwise an error will be thrown.
 * Any error that can arise while sending will be handled by the
 * VirtualDevice.onError handler, if set.
 * <p>
 * After a successful raise all the values are reset so to raise
 * again the values must be first set.
 *
 * @see {@link iotcs.device.VirtualDevice}
 * @memberOf iotcs.device.Alert.prototype
 * @function raise
 */
lib.device.Alert.prototype.raise = function () {
    var message = lib.message.Message.AlertMessage.buildAlertMessage(this.urn, this.description, lib.message.Message.AlertMessage.Severity.SIGNIFICANT);
    message.source(this.device.getEndpointId());
    for (var key in this._) {
        var field = this._[key];
        if (!field.optional && ((typeof field.value === 'undefined') || (field.value === null))) {
            lib.error('all mandatory fields not set');
            return;
        }
        if ((typeof field.value !== 'undefined') && (field.value !== null)) {
            message.dataItem(key, field.value);
        }
    }
    new lib.device.util.MessageDispatcher(this.device.client._.internalDev).queue(message);
    for (var key1 in this._) {
        this._[key1].value = null;
    }
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Data.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The Data is an object that represents a set of custom data fields (key/value pairs)
 * defined in the formats section of the device model. Data can be used
 * to send these fields to the server.
 * <p>
 * The Data API is specific to the device client library and the data fields
 * can be created by the VirtualDevice objects or using them.
 * For setting the fields of the data object as defined in the model, the fields
 * property of the data object will be used e.g.:<br>
 * <code>data.fields.temp = 50;</code>
 * <p>
 * The constructor of the Data object should not be used directly but the
 * {@link iotcs.device.VirtualDevice#createData} method should be used
 * for creating data objects.
 *
 * @memberOf iotcs.device
 * @alias Data
 * @class
 *
 * @param {iotcs.device.VirtualDevice} virtualDevice - the virtual device that has
 * in it's device model the custom format specification
 * @param {string} formatUrn - the urn format of the custom data fields spec
 *
 * @see {@link iotcs.device.VirtualDevice#createData}
 */
lib.device.Data = function (virtualDevice, formatUrn) {
    _mandatoryArg(virtualDevice, lib.device.VirtualDevice);
    _mandatoryArg(formatUrn, 'string');

    var dataSpec = virtualDevice[formatUrn];

    if (!dataSpec.urn || (dataSpec.type !== 'DATA')) {
        lib.error('data specification in device model is invalid');
        return;
    }

    this.device = virtualDevice;

    var spec = {
        urn: dataSpec.urn,
        description: (dataSpec.description || ''),
        name: (dataSpec.name || null)
    };


    if (dataSpec.value && dataSpec.value.fields && Array.isArray(dataSpec.value.fields)) {

        Object.defineProperty(this, 'fields', {
            enumerable: true,
            configurable: false,
            writable: false,
            value: {}
        });

        Object.defineProperty(this, '_', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
        });

        var self = this;

        dataSpec.value.fields.forEach(function (field) {

            self._[field.name] = {};
            self._[field.name].type = field.type.toUpperCase();
            self._[field.name].optional = field.optional;
            self._[field.name].name = field.name;
            self._[field.name].value = null;
            Object.defineProperty(self.fields, field.name, {
                enumerable: false,
                configurable: false,
                get: function () {
                    return self._[field.name].value;
                },
                set: function (newValue) {

                    if (!self._[field.name].optional && ((typeof newValue === 'undefined') || (newValue === null))) {
                        lib.error('trying to unset a mandatory field in the data object');
                        return;
                    }

                    newValue = _checkAndGetNewValue(newValue, self._[field.name]);

                    if (typeof newValue === 'undefined') {
                        lib.error('trying to set an invalid type of field in the data object');
                        return;
                    }

                    self._[field.name].value = newValue;
                }
            });

        });
    }

    // public members

    Object.defineProperty(this, 'urn', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.urn
    });

    Object.defineProperty(this, 'name', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.name
    });

    Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.description
    });

};

/**
 * This method is used to actually send the custom data fields to the server.
 * All mandatory fields (according to the device model definition)
 * must be set before sending, otherwise an error will be thrown.
 * Any error that can arise while sending will be handled by the
 * VirtualDevice.onError handler, if set.
 * <p>
 * After a successful send all the values are reset so to send
 * again the values must be first set.
 *
 * @see {@link iotcs.device.VirtualDevice}
 * @memberOf iotcs.device.Data.prototype
 * @function submit
 */
lib.device.Data.prototype.submit = function () {

    var message = new lib.message.Message();
    message
        .type(lib.message.Message.Type.DATA)
        .source(this.device.getEndpointId())
        .format(this.urn);

    for (var key in this._) {
        var field = this._[key];
        if (!field.optional && ((typeof field.value === 'undefined') || (field.value === null))) {
            lib.error('all mandatory fields not set');
            return;
        }
        if ((typeof field.value !== 'undefined') && (field.value !== null)) {
            message.dataItem(key, field.value);
        }
    }

    new lib.device.util.MessageDispatcher(this.device.client._.internalDev).queue(message);
    for (var key1 in this._) {
        this._[key1].value = null;
    }

};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DirectlyConnectedDevice.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * A directly-connected device is able to send messages to,
 * and receive messages from, the IoT server. When the
 * directly-connected device is activated on the server, the
 * server assigns a logical-endpoint identifier. This
 * logical-endpoint identifier is required for sending
 * messages to, and receiving messages from, the server.
 * <p>
 * The directly-connected device is able to activate itself using
 * the direct activation capability. The data required for activation
 * and authentication is retrieved from a TrustedAssetsStore generated
 * using the TrustedAssetsProvisioner tool using the Default TrustedAssetsManager.
 * <p>
 * This object represents the high level API for the directly-connected device
 * and uses the MessageDispatcher for sending/receiving messages.
 * Also it implements the message dispatcher, diagnostics and connectivity test
 * capabilities. Also it can be used for creating virtual devices.
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 *
 * @see {@link iotcs.device.util.MessageDispatcher}
 * @memberOf iotcs.device
 * @alias DirectlyConnectedDevice
 * @class
 * @extends iotcs.Client
 */
lib.device.DirectlyConnectedDevice = function (taStoreFile, taStorePassword, gateway) {
    lib.Client.call(this);

    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    Object.defineProperty(this._, 'internalDev',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: (gateway ? new lib.device.util.GatewayDevice(taStoreFile, taStorePassword) : new lib.device.util.DirectlyConnectedDevice(taStoreFile, taStorePassword))
    });

    Object.defineProperty(this._, 'virtualDevices',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    var self = this;

    Object.defineProperty(this._, 'removeVirtualDevice',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(device) {
            if (self._.virtualDevices[device.getEndpointId()]) {
                if (self._.virtualDevices[device.getEndpointId()][device.getDeviceModel().urn]) {
                    delete self._.virtualDevices[device.getEndpointId()][device.getDeviceModel().urn];
                }
                if (Object.keys(self._.virtualDevices[device.getEndpointId()]).length === 0) {
                    delete self._.virtualDevices[device.getEndpointId()];
                }
            }
        }
    });

    Object.defineProperty(this._, 'addVirtualDevice',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(device){
            self._.removeVirtualDevice(device);
            if (!self._.virtualDevices[device.getEndpointId()]) {
                self._.virtualDevices[device.getEndpointId()] = {};
            }
            self._.virtualDevices[device.getEndpointId()][device.getDeviceModel().urn] = device;
        }
    });

    var messageResponseHandler = function (messages, exception) {

        var deviceMap = {};

        messages.forEach(function (messageObj) {
            var message = messageObj.getJSONObject();
            if ((message.type === lib.message.Message.Type.DATA) && message.payload.data
                && message.payload.format && (message.payload.format.indexOf(':attributes') > -1)) {
                var model = message.payload.format.substring(0, message.payload.format.indexOf(':attributes'));
                var devId = message.source;
                if (!(devId in deviceMap)) {
                    deviceMap[devId] = {};
                }
                if (!(model in deviceMap)) {
                    deviceMap[devId][model] = {};
                }
                for (var key in message.payload.data) {
                    deviceMap[devId][model][key] = message.payload.data[key];
                }
            } else if (((message.type === lib.message.Message.Type.ALERT) || (message.type === lib.message.Message.Type.DATA))
                && message.payload.format) {
                var devId1 = message.source;
                if (!(devId1 in deviceMap)) {
                    deviceMap[devId1] = {};
                }
                var format = message.payload.format;
                if (devId1 in self._.virtualDevices) {
                    for (var model1 in self._.virtualDevices[devId1]) {
                        if (format in self._.virtualDevices[devId1][model1]) {
                            if (!(model1 in deviceMap)) {
                                deviceMap[devId1][model1] = {};
                            }
                            deviceMap[devId1][model1][format] = message.payload.data;
                        }
                    }
                }
            }
        });

        for (var deviceId in deviceMap) {
            for (var deviceModel in deviceMap[deviceId]) {
                if ((deviceId in self._.virtualDevices) && (deviceModel in self._.virtualDevices[deviceId])) {
                    var device = self._.virtualDevices[deviceId][deviceModel];
                    var attributeNameValuePairs = deviceMap[deviceId][deviceModel];
                    var attrObj = {};
                    var newValObj = {};
                    var tryValObj = {};
                    for (var attributeName in attributeNameValuePairs) {
                        var attribute = device[attributeName];
                        if (attribute && (attribute instanceof $impl.Attribute)) {
                            attribute._.onUpdateResponse(exception);
                            attrObj[attribute.id] = attribute;
                            newValObj[attribute.id] = attribute.value;
                            tryValObj[attribute.id] = attributeNameValuePairs[attributeName];
                            if (exception && attribute.onError) {
                                var onAttributeErrorTuple = {
                                    attribute: attribute,
                                    newValue: attribute.value,
                                    tryValue: attributeNameValuePairs[attributeName],
                                    errorResponse: exception
                                };
                                attribute.onError(onAttributeErrorTuple);
                            }
                        }
                        else if (attribute && (attribute.type === 'ALERT')) {
                            attrObj[attribute.urn] = new lib.device.Alert(device, attribute.urn);
                            var data = attributeNameValuePairs[attributeName];
                            for(var key in data) {
                                attrObj[attribute.urn].fields[key] = data[key];
                            }
                        }
                        else if (attribute && (attribute.type === 'DATA')) {
                            attrObj[attribute.urn] = new lib.device.Data(device, attribute.urn);
                            var data1 = attributeNameValuePairs[attributeName];
                            for(var key1 in data1) {
                                attrObj[attribute.urn].fields[key1] = data1[key1];
                            }
                        }
                    }
                    if (exception && device.onError) {
                        var onDeviceErrorTuple = {
                            attributes: attrObj,
                            newValues: newValObj,
                            tryValues: tryValObj,
                            errorResponse: exception
                        };
                        device.onError(onDeviceErrorTuple);
                    }
                }
            }
        }

    };

    new lib.device.util.MessageDispatcher(this._.internalDev).onError = messageResponseHandler;
    new lib.device.util.MessageDispatcher(this._.internalDev).onDelivery = messageResponseHandler;


};

lib.device.DirectlyConnectedDevice.prototype = Object.create(lib.Client.prototype);
lib.device.DirectlyConnectedDevice.constructor = lib.device.DirectlyConnectedDevice;

/**
 * Activate the device. The device will be activated on the
 * server if necessary. When the device is activated on the
 * server. The activation would tell the server the models that
 * the device implements. Also the activation can generate
 * additional authorization information that will be stored in
 * the TrustedAssetsStore and used for future authentication
 * requests. This can be a time/resource consuming operation for
 * some platforms.
 * <p>
 * If the device is already activated, this method will throw
 * an exception. The user should call the isActivated() method
 * prior to calling activate.
 *
 * @param {string[]} deviceModelUrns - an array of deviceModel
 * URNs implemented by this directly connected device
 * @param {function} callback - the callback function. This
 * function is called with this object but in the activated
 * state. If the activation is not successful then the object
 * will be null and an error object is passed in the form
 * callback(device, error) and the reason can be taken from
 * error.message
 *
 * @memberOf iotcs.device.DirectlyConnectedDevice.prototype
 * @function activate
 */
lib.device.DirectlyConnectedDevice.prototype.activate = function (deviceModelUrns, callback) {

    if (this.isActivated()) {
        lib.error('cannot activate an already activated device');
        return;
    }

    _mandatoryArg(deviceModelUrns, 'array');
    _mandatoryArg(callback, 'function');

    deviceModelUrns.forEach(function (urn) {
        _mandatoryArg(urn, 'string');
    });

    var deviceModels = deviceModelUrns;
    deviceModels.push('urn:oracle:iot:dcd:capability:diagnostics');
    deviceModels.push('urn:oracle:iot:dcd:capability:message_dispatcher');
    var self = this;
    this._.internalDev.activate(deviceModels, function(activeDev, error) {
        if (!activeDev || error) {
            callback(null, error);
            return;
        }
        callback(self);
    });
};

/**
 * This will return the directly connected device state.
 *
 * @returns {boolean} whether the device is activated.
 *
 * @memberof iotcs.device.DirectlyConnectedDevice.prototype
 * @function isActivated
 */
lib.device.DirectlyConnectedDevice.prototype.isActivated = function () {
    return this._.internalDev.isActivated();
};

/**
 * Return the logical-endpoint identifier of this
 * directly-connected device. The logical-endpoint identifier
 * is assigned by the server as part of the activation
 * process.
 *
 * @returns {string} the logical-endpoint identifier of this
 * directly-connected device.
 *
 * @memberof iotcs.device.DirectlyConnectedDevice.prototype
 * @function getEndpointId
 */
lib.device.DirectlyConnectedDevice.prototype.getEndpointId = function () {
    return this._.internalDev.getEndpointId();
};

/**@inheritdoc*/
lib.device.DirectlyConnectedDevice.prototype.getDeviceModel = function (deviceModelUrn, callback) {
    return this._.internalDev.getDeviceModel(deviceModelUrn, callback);
};

/**
 * Create a VirtualDevice instance with the given device model
 * for the given device identifier. This method creates a new
 * VirtualDevice instance for the given parameters. The client
 * library does not cache previously created VirtualDevice
 * objects.
 * <p>
 * A device model can be obtained by it's afferent urn with the
 * DirectlyConnectedDevice if it is registered on the cloud.
 *
 * @param {string} endpointId - The endpoint identifier of the
 * device being modeled.
 * @param {object} deviceModel - The device model object
 * holding the full description of that device model that this
 * device implements.
 * @returns {iotcs.device.VirtualDevice} The newly created virtual device
 *
 * @see {@link iotcs.device.DirectlyConnectedDevice#getDeviceModel}
 * @memberof lib.device.DirectlyConnectedDevice.prototype
 * @function createVirtualDevice
 */
lib.device.DirectlyConnectedDevice.prototype.createVirtualDevice = function (endpointId, deviceModel) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(deviceModel, 'object');
    return new lib.device.VirtualDevice(endpointId, deviceModel, this);
};

/**
 * This method will close this directly connected device (client) and
 * all it's resources. All monitors required by the message dispatcher
 * associated with this client will be stopped and all created virtual
 * devices will be removed.
 *
 * @memberof iotcs.device.DirectlyConnectedDevice.prototype
 * @function close
 */
lib.device.DirectlyConnectedDevice.prototype.close = function () {
    this._.internalDev.close();
    for (var key in this._.virtualDevices) {
        for (var key1 in this._.virtualDevices[key]) {
            this._.virtualDevices[key][key1].close();
        }
    }
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/GatewayDevice.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This represents a GatewayDevice in the high level API.
 * It has the exact same specifications and capabilities as
 * a directly connected device from the high level API and additionally
 * it has the capability to register indirectly connected devices.
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 *
 * @memberOf iotcs.device
 * @alias GatewayDevice
 * @class
 * @extends iotcs.device.DirectlyConnectedDevice
 */
lib.device.GatewayDevice = function (taStoreFile, taStorePassword) {
    lib.device.DirectlyConnectedDevice.call(this, (taStoreFile ? taStoreFile : null), (taStorePassword ? taStorePassword : null), true);
};

lib.device.GatewayDevice.prototype = Object.create(lib.device.DirectlyConnectedDevice.prototype);
lib.device.GatewayDevice.constructor = lib.device.GatewayDevice.prototype;

/**
 * Enumeration of the standard properties that can
 * be used in the metadata object given as parameter
 * on indirect registration
 *
 * @memberOf iotcs.device.GatewayDevice
 * @alias DeviceMetadata
 * @class
 * @readonly
 * @enum {string}
 * @see {@link iotcs.device.GatewayDevice#registerDevice}
 */
lib.device.GatewayDevice.DeviceMetadata = {
    MANUFACTURER: 'manufacturer',
    MODEL_NUMBER: 'modelNumber',
    SERIAL_NUMBER: 'serialNumber',
    DEVICE_CLASS: 'deviceClass',
    PROTOCOL: 'protocol',
    PROTOCOL_DEVICE_CLASS: 'protocolDeviceClass',
    PROTOCOL_DEVICE_ID: 'protocolDeviceId'
};

/**
 * Register an indirectly-connected device with the cloud
 * service. An indirectly-connected device only needs to be
 * registered once. After registering the indirectly-connected
 * device, the caller is responsible for keeping track of what
 * devices have been registered, the metadata, and for
 * persisting the endpoint id. On subsequent boots, the same
 * endpoint id is to be used for the indirectly-connected
 * device. Registering an indirectly-connected device that has
 * already been registered will result in an error given by the
 * server.
 * <p>
 * The hardwareId is a unique identifier within the Cloud
 * Service instance. The metadata argument should typically contain all the standard
 * metadata (the constants documented in This object) along
 * with any other vendor defined metadata.
 * <p>
 * Standard metadata properties can be taken from the
 * DeviceMetadata enumeration, part of this object.
 *
 * @param {string} hardwareid - an identifier unique within
 * the Cloud Service instance 
 * @param {Object} metadata - the metadata of the device
 * @param {string[]} deviceModelUrns - array of device model
 * URNs supported by the indirectly connected device
 * @param {function(Object)} callback - the callback function. This
 * function is called with the following argument: the endpoint id
 * of the indirectly-connected device is the registration was successful
 * or null and an error object as the second parameter: callback(id, error).
 * The reason can be retrieved from error.message and it represents
 * the actual response from the server or any other network or framework
 * error that can appear.
 *
 * @see {@link iotcs.device.GatewayDevice.DeviceMetadata}
 * @memberof iotcs.device.GatewayDevice.prototype
 * @function registerDevice
 */
lib.device.GatewayDevice.prototype.registerDevice = function (hardwareid, metadata, deviceModelUrns, callback) {
    this._.internalDev.registerDevice(hardwareid, metadata, deviceModelUrns, callback);
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/VirtualDevice.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * VirtualDevice is a representation of a device model
 * implemented by an endpoint. A device model is a
 * specification of the attributes, formats, and resources
 * available on the endpoint.
 * <p>
 * This VirtualDevice API is specific to the device
 * client. This implements the alerts defined in the
 * device model and can be used for raising alerts to
 * be sent to the server for the device. Also it has
 * action handlers for actions that come as requests
 * from the server side.
 * <p>
 * A device model can be obtained by it's afferent urn with the
 * DirectlyConnectedDevice if it is registered on the cloud.
 * <p>
 * The VirtualDevice has the attributes, actions and alerts of the device
 * model as properties and it provides functionality to the device
 * model in the following ways:
 * <p>
 * <b>Get the value of an attribute:</b><br>
 * <code>var value = device.temperature.value;</code><br>
 * <p>
 * <b>Get the last known value of an attribute:</b><br>
 * <code>var lastValue = device.temperature.lastKnownValue;</code><br>
 * <p>
 * <b>Set the value of an attribute (with update on cloud and error callback handling):</b><br>
 * <code>device.temperature.onError = function (errorTuple);</code><br>
 * <code>device.temperature.value = 27;</code><br>
 * where errorTuple is an object of the form
 * <code>{attribute: ... , newValue: ... , tryValue: ... , errorResponse: ...}</code>.
 * The library will throw an error in the value to update is invalid
 * according to the device model.
 * <p>
 * <b>Monitor a specific attribute for any value change (that comes from the cloud):</b><br>
 * <code>device.maxThreshold.onChange = function (changeTuple);</code><br>
 * where changeTuple is an object of the form
 * <code>{attribute: ... , newValue: ... , oldValue: ...}</code>.
 * To tell the cloud that the attribute update has failed
 * an exception must be thrown in the onChange function, otherwise the
 * library will send an OK response message to the cloud.
 * <p>
 * <b>Monitor a specific action that was requested from the server:</b><br>
 * <code>device.reset.onExecute = function (value);</code><br>
 * where value is an optional parameter given if the action has parameters
 * defined in the device model. To tell the cloud that an action has failed
 * an exception must be thrown in the onExecute function, otherwise the
 * library will send an OK response message to the cloud.
 * <p>
 * <b>Monitor all attributes for any value change (that comes from the cloud):</b><br>
 * <code>device.onChange = function (changeTuple);</code><br>
 * where changeTuple is an object with array type properties of the form
 * <code>[{attribute: ... , newValue: ... , oldValue: ...}]</code>.
 * To tell the cloud that the attribute update has failed
 * an exception must be thrown in the onChange function, otherwise the
 * library will send an OK response message to the cloud.
 * <p>
 * <b>Monitor all update errors:</b><br>
 * <code>device.onError = function (errorTuple);</code><br>
 * where errorTuple is an object with array type properties (besides errorResponse) of the form
 * <code>{attributes: ... , newValues: ... , tryValues: ... , errorResponse: ...}</code>.
 * <p>
 * <b>Raising alerts:</b><br>
 * <code>var alert = device.createAlert('urn:com:oracle:iot:device:temperature_sensor:too_hot');</code><br>
 * <code>alert.fields.temp = 100;</code><br>
 * <code>alert.fields.maxThreshold = 90;</code><br>
 * <code>alert.raise();</code><br>
 * If an alert was not sent the error is handled by the device.onError handler where errorTuple has
 * the following structure:<br>
 * <code>{attributes: ... , errorResponse: ...}</code><br>
 * where attributes are the alerts that failed with fields already set, so the alert can be retried
 * only by raising them.
 * <p>
 * <b>Sending custom data fields:</b><br>
 * <code>var data = device.createData('urn:com:oracle:iot:device:motion_sensor:rfid_detected');</code><br>
 * <code>data.fields.detecting_motion = true;</code><br>
 * <code>data.submit();</code><br>
 * If the custom data fields were not sent, the error is handled by the device.onError handler where errorTuple has
 * the following structure:<br>
 * <code>{attributes: ... , errorResponse: ...}</code><br>
 * where attributes are the Data objects that failed to be sent with fields already set, so the Data objects can be retried
 * only by sending them.
 * <p>
 * A VirtualDevice can also be created with the appropriate
 * parameters from the DirectlyConnectedDevice.
 *
 * @param {string} endpointId - The endpoint id of this device
 * @param {object} deviceModel - The device model object
 * holding the full description of that device model that this
 * device implements.
 * @param {iotcs.device.DirectlyConnectedDevice} client - The device client
 * used as message dispatcher for this virtual device.
 *
 * @see {@link iotcs.device.DirectlyConnectedDevice#getDeviceModel}
 * @see {@link iotcs.device.DirectlyConnectedDevice#createVirtualDevice}
 * @class
 * @memberOf iotcs.device
 * @alias VirtualDevice
 * @extends iotcs.AbstractVirtualDevice
 */
lib.device.VirtualDevice = function (endpointId, deviceModel, client) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(deviceModel, 'object');
    _mandatoryArg(client, lib.device.DirectlyConnectedDevice);

    lib.AbstractVirtualDevice.call(this, endpointId, deviceModel);

    this.client = client;

    var messageDispatcher = new lib.device.util.MessageDispatcher(this.client._.internalDev);

    var self = this;

    this.attributes = this;

    var attributeHandler = function (requestMessage) {
        var method = _getMethodForRequestMessage(requestMessage);
        if (!method || (method !== 'PUT')) {
            return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
        }
        var urlAttribute = requestMessage.payload.url.substring(requestMessage.payload.url.lastIndexOf('/') + 1);
        if ((urlAttribute in self.attributes)
            && (self.attributes[urlAttribute] instanceof $impl.Attribute)) {
            try {
                var attribute = self.attributes[urlAttribute];
                var data = null;
                try {
                    data = JSON.parse($port.util.atob(requestMessage.payload.body));
                } catch (e) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }
                var oldValue = attribute.value;
                if (!data || (typeof data.value === 'undefined') || !attribute._.remoteUpdate(data.value, true)) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }
                var onChangeTuple = {
                    attribute: attribute,
                    newValue: data.value,
                    oldValue: oldValue
                };
                if (attribute.onChange) {
                    attribute.onChange(onChangeTuple);
                }
                if (self.onChange) {
                    self.onChange([onChangeTuple]);
                }
                var message = new lib.message.Message();
                message
                    .type(lib.message.Message.Type.DATA)
                    .source(self.getEndpointId())
                    .format(self.model.urn+":attributes");
                attribute._.remoteUpdate(data.value, false);
                message.dataItem(urlAttribute, data.value);
                messageDispatcher.queue(message);
                return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', '');
            } catch (e) {
                return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
            }
        } else {
            return lib.message.Message.buildResponseMessage(requestMessage, 404, {}, 'Not Found', '');
        }
    };

    var attributes = this.model.attributes;
    for (var indexAttr in attributes) {
        var attribute = new $impl.Attribute(attributes[indexAttr]);
        if (attributes[indexAttr].alias) {
            _link(attributes[indexAttr].alias, this, attribute);
            messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.model.urn+'/attributes/'+attributes[indexAttr].alias, attributeHandler);
        }
        _link(attributes[indexAttr].name, this, attribute);
        messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.model.urn+'/attributes/'+attributes[indexAttr].name, attributeHandler);
    }

    this.actions = this;

    var actionHandler = function (requestMessage) {
        var method = _getMethodForRequestMessage(requestMessage);
        var urlAction = requestMessage.payload.url.substring(requestMessage.payload.url.lastIndexOf('/') + 1);
        if (!method || (method !== 'POST')) {
            return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
        }
        if ((urlAction in self.actions)
            && (self.actions[urlAction] instanceof $impl.Action)
            && self.actions[urlAction].onExecute) {
            try {
                var action = self.actions[urlAction];
                var data = null;
                try {
                    data = JSON.parse($port.util.atob(requestMessage.payload.body));
                } catch (e) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }
                if (!data || !action.checkVarArg(data.value)) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }
                action.onExecute(data.value);
                return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', '');
            } catch (e) {
                return lib.message.Message.buildResponseMessage(requestMessage, 500, {}, 'Internal Server Error', '');
            }
        } else {
            return lib.message.Message.buildResponseMessage(requestMessage, 404, {}, 'Not Found', '');
        }
    };

    var actions = this.model.actions;
    for (var indexAction in actions) {
        var action = new $impl.Action(actions[indexAction]);
        if (actions[indexAction].alias) {
            _link(actions[indexAction].alias, this.actions, action);
            messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.model.urn+'/actions/'+actions[indexAction].alias, actionHandler);
        }
        _link(actions[indexAction].name, this.actions, action);
        messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.model.urn+'/actions/'+actions[indexAction].name, actionHandler);
    }

    if (this.model.formats) {

        this.alerts = this;
        this.dataFormats = this;
        this.model.formats.forEach(function (format) {
            if (format.type && format.urn) {
                if (format.type === 'ALERT') {
                    self.alerts[format.urn] = format;
                }
                if (format.type === 'DATA') {
                    self.dataFormats[format.urn] = format;
                }
            }
        });

    }

    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });


    Object.defineProperty(this._, 'updateAttributes', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (attributes) {
            var message = new lib.message.Message();
            message
                .type(lib.message.Message.Type.DATA)
                .source(self.getEndpointId())
                .format(self.model.urn+":attributes");

            for (var attribute in attributes) {
                var value = attributes[attribute];
                if (attribute in self.attributes) {
                    message.dataItem(attribute,value);
                } else {
                    lib.error('unknown attribute "'+attribute+'"');
                    return;
                }
            }

            messageDispatcher.queue(message);
        }
    });

    messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.model.urn+'/attributes', function (requestMessage) {
        var method = _getMethodForRequestMessage(requestMessage);
        if (!method || (method !== 'PATCH')) {
            return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
        }
        if (self.onChange){
            try {
                var data = null;
                try {
                    data = JSON.parse($port.util.atob(requestMessage.payload.body));
                } catch (e) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }
                if (!data) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }
                var tupleArray = [];
                for (var attributeName in data) {
                    var attribute = self.attributes[attributeName];
                    if (!attribute) {
                        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                    }
                    var oldValue = attribute.value;
                    if (!attribute._.remoteUpdate(data[attributeName], true)) {
                        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                    }
                    var onChangeTuple = {
                        attribute: attribute,
                        newValue: data[attributeName],
                        oldValue: oldValue
                    };
                    if (attribute.onChange) {
                        attribute.onChange(onChangeTuple);
                    }
                    tupleArray.push(onChangeTuple);
                }
                self.onChange(tupleArray);
                var message = new lib.message.Message();
                message
                    .type(lib.message.Message.Type.DATA)
                    .source(self.getEndpointId())
                    .format(self.model.urn+":attributes");
                for (var attributeName1 in data) {
                    var attribute1 = self.attributes[attributeName1];
                    attribute1._.remoteUpdate(data[attributeName1], false);
                    message.dataItem(attributeName1, data[attributeName1]);
                }
                messageDispatcher.queue(message);
                return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', '');
            } catch (e) {
                return lib.message.Message.buildResponseMessage(requestMessage, 500, {}, 'Internal Server Error', '');
            }
        } else {
            return lib.message.Message.buildResponseMessage(requestMessage, 404, {}, 'Not Found', '');
        }
    });

    // seal object
    Object.preventExtensions(this);

    this.client._.addVirtualDevice(this);

};

lib.device.VirtualDevice.prototype = Object.create(lib.AbstractVirtualDevice.prototype);
lib.device.VirtualDevice.constructor = lib.device.VirtualDevice;

/**
 * This method returns an Alert object created based on the
 * format given as parameter. An Alert object can be used to
 * send alerts to the server by calling the raise method,
 * after all mandatory fields of the alert are set.
 *
 * @param {string} formatUrn - the urn format of the alert spec
 * as defined in the device model that this virtual device represents
 *
 * @returns {iotcs.device.Alert} The Alert instance
 *
 * @memberOf iotcs.device.VirtualDevice.prototype
 * @function createAlert
 */
lib.device.VirtualDevice.prototype.createAlert = function (formatUrn) {
    return new lib.device.Alert(this, formatUrn);
};

/**
 * This method returns a Data object created based on the
 * format given as parameter. A Data object can be used to
 * send custom data fields to the server by calling the submit method,
 * after all mandatory fields of the data object are set.
 *
 * @param {string} formatUrn - the urn format of the custom data spec
 * as defined in the device model that this virtual device represents
 *
 * @returns {iotcs.device.Data} The Data instance
 *
 * @memberOf iotcs.device.VirtualDevice.prototype
 * @function createData
 */
lib.device.VirtualDevice.prototype.createData = function (formatUrn) {
    return new lib.device.Data(this, formatUrn);
};

/**@inheritdoc */
lib.device.VirtualDevice.prototype.update = function (attributes) {
    _mandatoryArg(attributes, 'object');
    if (Object.keys(attributes).length === 0) {
        return;
    }
    for (var attribute in attributes) {
        var value = attributes[attribute];
        if (attribute in this.attributes) {
            this.attributes[attribute]._.localUpdate(value, true); //XXX not clean
        } else {
            lib.error('unknown attribute "'+attribute+'"');
            return;
        }
    }
    this._.updateAttributes(attributes);
};

/**@inheritdoc */
lib.device.VirtualDevice.prototype.close = function () {
    if (this.client) {
        this.client._.removeVirtualDevice(this);
    }
    this.endpointId = null;
    this.onChange = function (arg) {};
    this.onError = function (arg) {};
};



//END/////////////////////////////////////////////////////////////////////////
    lib.log(lib.description+' v'+ lib.version+' loaded!');
    return lib;
}
//////////////////////////////////////////////////////////////////////////////
// module initialization
if ((typeof module === 'object') && (module.exports)) {
    //((typeof exports !== 'undefined') && (this.exports !== exports))
    // node.js
    module.exports = function iotcs (lib) {
        return init(lib);
    };
    module.exports(module.exports);
}
})();
