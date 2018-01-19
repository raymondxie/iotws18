// working on it
//
// 1. create async polling of sensor data from Wio-* boards
// 2. Map sensor data/actuactor control signal to Device Model in IoTCS
// 3. Sync data/control signal with IoTCS
//


/**
 * This NodeJS client acts as the main loop for Wio Node or Wio Link board with Grove sensors.
 * Using a sensor-config.js file to setup the type of sensors and corresponding PIN of 
 * your device project, this code runs in loop by itself to detect sensor value changes 
 * and push to IoTCS.
 *
 * This client is a directly connected device using IoTCS csl virtual device API.
 *
 * 12/26/2017  yuhua.xie@oracle.com
 */

"use strict";

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// TODO: please supply the device model associated with your device
// For example:  const DEVICE_MODEL_URN = 'urn:com:oracle:iot:wionode:mydevicemodel';
// const DEVICE_MODEL_URN = '[TODO-REPLACE-WITH-YOUR-DEVICE-MODEL_URN]';
const DEVICE_MODEL_URN = 'urn:com:oracle:iot:workshop:mdc';


// Setup IoT Device Client Lib
// IoTCS device library in NodeJS
var dcl = require("./device-client-lib/device-library.node");
dcl = dcl({debug: true});
// dcl.oracle.iot.tam.store = (process.argv[2]);
// dcl.oracle.iot.tam.storePassword = (process.argv[3]);
var storeFile = (process.argv[2]);
var storePassword = (process.argv[3]);


// Wio Node board 
const WioNode = require("./wio.js");
const wioConfig = require("./sensor-config.js").wio_iot;

// Load Wio Node / Wio Link Sensor Config
const sensorConfig = require('./sensor-config.js').wio_node;
console.log('sensorConfig = ', sensorConfig);

// const log = require('npmlog');

// Current Sensor Values - collected from "sensor-config.js" file and populated at run-time
var currentData = {};
currentData['name'] = "RXIE";  // TODO: replace with your own name, so we can see whose sensor data coming in.

/*
For example, after population of sensors:
var currentData = {
    temperature: 68.5,
    humidity: 12.4,
    light: 345,
    soundfreq: 0,
    lightlevel: 0
};
*/

// const device = new dcl.device.DirectlyConnectedDevice();
var device = new dcl.device.DirectlyConnectedDevice(storeFile, storePassword);

// Virtual Device toward IoTCS side
var virtualDev;

// Wio board
var board;

//
// Main entry point of execution
// Setup device and board and initialize them
activateDeviceIfNeeded(device)
    .then((device) => {
        console.log( 'device: ', device);
        return getModelWioNodeDeviceModel(device);
    })
    .then((deviceModel) => {
        console.log( 'device model: ', deviceModel);
        console.log( 'endpointId: ', device.getEndpointId() );
        virtualDev = device.createVirtualDevice(device.getEndpointId(), deviceModel);
        return createWioBoard(virtualDev);
    })
    .then((board) => {
        return setupSensors();
    })
    .catch(err => {
        console.log('err = ', err);
    });


// callback when action to device
var deviceCB = function(data, error) {
    if( data != null )
        console.log("data->", data);
    if( error != null)
        console.log("error->", error);
}

/**
 * Create Wio Board and initialize it
 *
 * @returns {Promise} that completes when the board has been initialized
 */
function createWioBoard(virtualDev) {
    return new Promise((resolve, reject) => {
        // construct a Wio board
        board = new WioNode({
            "debug": true,
            "token": wioConfig.token,
            "location": wioConfig.location
        });

        resolve(board);
    });
}

function setupSensors() {
    // for handling control signal from IoTCS
    let writableSensors = {};

    //
    // To trigger buzzer sound, the IoTCS backend needs to pass a param in the format of
    // "frequency/duration", such as "443/1000", meaning frequency of 443Hz for 1000 ms
    //
    virtualDev.buzzer.onExecute = function(param) {
        console.log('---------------ON EXECUTE Buzzer -----------------');
        console.log(JSON.stringify({value: param},null,4));
        console.log('------------------------------------------------');        

        // buzzer config
        var bc = writableSensors["soundfreq"];
        var args = param.split('/');

        board.write(deviceCB, bc.pin, bc.property, args[0], args[1]);
    };

    //
    // To light up LED bar, the IoTCS backend needs to pass an integer number representing the bits
    // For example, "13", which is "0000001101", which will light up bar 1, 3, 4 
    //
    virtualDev.ledbar.onExecute = function(param) {
        console.log('---------------ON EXECUTE LED Bar --------------');
        console.log(JSON.stringify({value: param},null,4));
        console.log('------------------------------------------------');        

        // buzzer config
        var bc = writableSensors["lightlevel"];

        board.write(deviceCB, bc.pin, bc.property, param);
    };

    // 
    // any writeable attribute change callback from IoTCS
    //
    virtualDev.onChange = tupples => {
        tupples.forEach(tupple => {
            var show = {
                name: tupple.attribute.id,
                lastUpdate: tupple.attribute.lastUpdate,
                oldValue: tupple.oldValue,
                newValue: tupple.newValue
            };
            console.log('------------------ON VIRTUAL DEVICE CHANGE ---------------------');
            console.log(JSON.stringify(show, null, 4));
            console.log('----------------------------------------------------------------');
        });
    };

    virtualDev.onError = function (tupple) {
        var show = {
            newValues: tupple.newValues,
            tryValues: tupple.tryValues,
            errorResponse: tupple.errorResponse
        };
        console.log('------------------ON ERROR from VirtualDev -------------');
        console.log(JSON.stringify(show,null,4));
        console.log('--------------------------------------------------------');
        for (var key in tupple.newValues) {
            sensor[key] = tupple.newValues[key];
        }
    };

    // process sensor-config.js file, and start sensor reading and prepare for control commands
    sensorConfig.forEach(sensor => {
        switch (sensor.type) {
            case 'INPUT':
                // initialize sensor data
                if( sensor.attr !== null ) {
                    currentData[sensor.attr] = sensor.val;
                }

                // virtualDev.update(currentData);

                board.stream(sensor.pin, sensor.property, 1000, (data, error) => {
                    if (error) {
                        console.log("can not read " + sensor.property);
                    }
                    console.log("got data: ", data);

                    if (data && Math.abs(data[sensor.property] - currentData[sensor.attr]) > 1) {
                        currentData[sensor.attr] = data[sensor.property];

                        console.log("feed sensor data to IoTCS: ", currentData);

                        // push to IoTCS
                        virtualDev.update(currentData);
                    }
                });

                break;

            case 'OUTPUT':
                writableSensors[sensor.attr] = sensor;
                break;
        }
    });

    /*
    //
    // TODO: remove later 
    // Temperally code for trouble-shooting this error message:
    // [iotcs:error] SSL host name verification failed
    //

    // as we can tell by this, it is fine to update sensor data to IoTCS instance
    var intervalId = setInterval(function(){    
        console.log("sending data to IoTCS");
        virtualDev.update(currentData);
    }, 1000);

    setTimeout(function(){
        console.log("stop sending to IoTCS");
        clearInterval(intervalId);
    },3000);

    // but
    // after 20 seconds, we make one call to read Wio sensor data (which is a REST end call)
    // That would trigger the break of IoTCS connection with error message:
    // [iotcs:error] SSL host name verification failed
    //
    setTimeout(function(){
        board.read(function(data, error) {
            console.log("RXIE data: ", data, error);                   
        }, 'GroveTempHumD1', 'temperature');       
    }, 10000);    
    // 
    // TODO: remove later
    // End of temporary code.
    */

}


// function dataChange() {
//     console.log('updateChange() - currentData = ', currentData);
//     virtualDev.update(currentData);
// }


function getModelWioNodeDeviceModel(device){
    return new Promise((resolve, reject) => {
        device.getDeviceModel(DEVICE_MODEL_URN, function (response, error) {
            if (error) {
                console.log('-------------ERROR ON GET HUMIDITY DEVICE MODEL-------------');
                console.log(error.message);
                console.log('------------------------------------------------------------');
                return;
            }

            console.log('----------------- DEVICE MODEL----------------------');
            console.log(JSON.stringify(response,null,4));
            console.log('----------------------------------------------------');

            resolve(response);
        });
    });
}

function activateDeviceIfNeeded(device) {
    return new Promise((resolve, reject) => {
        if (device.isActivated()) {
            resolve(device);
        } else {
            device.activate([DEVICE_MODEL_URN], (dev, error) => {
                if( error ) {
                    console.log('-----------------ERROR ON ACTIVATION------------------------');
                    console.log(error.message);
                    console.log('------------------------------------------------------------');
                    return;                                
                }

                device = dev;

                // log.info('Activated device ',device.getEndpointId(),device.isActivated());
                if (device.isActivated()) {
                    resolve(device);
                } else {
                    reject('Failed to activate device')
                }
            });
        }
    });
}
