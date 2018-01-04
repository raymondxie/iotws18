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

// TODO: please supply the device model associated with your device
// For example:  const DEVICE_MODEL_URN = 'urn:com:oracle:iot:wionode:mydevicemodel';
const DEVICE_MODEL_URN = '[TODO-REPLACE-WITH-YOUR-DEVICE-MODEL_URN]';


// Setup IoT Device Client Lib
// IoTCS device library in NodeJS
var iotClient = require("device-library.node");
iotClient = iotClient({debug: true});
iotClient.oracle.iot.tam.store = (process.argv[2]);
iotClient.oracle.iot.tam.storePassword = (process.argv[3]);

// Wio Node board 
const WioNode = require("./wio.js");
const wioConfig = require("./sensor-config.js").wio_iot;

// Load Wio Node / Wio Link Sensor Config
const sensorConfig = require('./sensor-config.js').wio_node;
console.log('sensorConfig = ', sensorConfig);

const log = require('npmlog');


// Current Sensor Values - collected from "sensor-config.js" file and populated at run-time
var currentData = {};
currentData['operator'] = "YOUR_NAME";  // replace with your own name, so we can see whose sensor data coming in.

/*
For example, after population of sensors:
var currentData = {
    button: false,
    sound: 0,
    angle: 0,
    lightLevel: 0,
    range: 0,
    temperature: 0,
    humidity: 0,
    heatIndex: 0,
    buzzer: false,
    led: false
};
*/

const device = new iotClient.device.DirectlyConnectedDevice();

// Virtual Device toward IoTCS side
var virtualDev;

//
// Main entry point of execution
// Setup device and board and initialize them
activateDeviceIfNeeded(device)
    .then((device) => {
        log.info( 'device: ', device);
        return getModelWioNodeDeviceModel(device);
    })
    .then((deviceModel) => {
        log.info( 'device model: ', deviceModel);
        virtualDev = device.createVirtualDevice(device.getEndpointId(), deviceModel);
        return createWioBoard(virtualDev);
    })
    .then((board) => {
        return setupSensors();
    })
    .catch(err => {
        log.error('err = ', err);
    });

/**
 * Create Grove Pi Board and initialize it
 *
 * @returns {Promise} that completes when the board has been initialized
 */
function createWioBoard() {
    return new Promise((resolve, reject) => {
        // construct a Wio board
        var board = new WioNode({
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

    virtualDev.onChange = tupples => {
        tupples.forEach(tupple => {
            var show = {
                name: tupple.attribute.id,
                lastUpdate: tupple.attribute.lastUpdate,
                oldValue: tupple.oldValue,
                newValue: tupple.newValue
            };
            log.debug('------------------ON VIRTUAL DEVICE CHANGE ---------------------');
            log.debug(JSON.stringify(show, null, 4));
            log.debug('----------------------------------------------------------------');

            if (writableSensors[tupple.attribute.id]) {
                // writableSensors[tupple.attribute.id].write(tupple.newValue);
                var sensor = writableSensors[tupple.attribute.id];

                board.write((data, error)=>{
                    if (data) log.info(data);
                    if (error) log.warn(error);
                }, 
                sensor.pin, 
                sensor.property, 
                tupple.newValue);
            }
        });
    };

    // process sensor-config.js file, and start sensor reading and prepare for control commands
    sensorConfig.forEach(sensor => {
        // initialize sensor data
        if( sensor.attr !== null ) {
            currentData[sensor.attr] = sensor.val;
        }

        switch (sensor.type) {
            case 'INPUT':
                board.stream(sensor.pin, sensor.property, 1000, (data, error) => {
                    if (error) {
                        log.error("can not read " + sensor.property);
                    }
                    if (data && Math.abs(data - currentData[sensor.attr]) > 1) {
                        currentData[sensor.attr] = data;
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
}


// function dataChange() {
//     console.log('updateChange() - currentData = ', currentData);
//     virtualDev.update(currentData);
// }


function getModelWioNodeDeviceModel(device){
    return new Promise((resolve, reject) => {
        device.getDeviceModel(DEVICE_MODEL_URN, function (response) {
            resolve(response);
        });
    });
}

function activateDeviceIfNeeded(device) {
    return new Promise((resolve, reject) => {
        if (device.isActivated()) {
            resolve(device);
        } else {
            device.activate([DEVICE_MODEL_URN], () => {
                log.info('Activated device ',device.getEndpointId(),device.isActivated());
                if (device.isActivated()) {
                    resolve(device);
                } else {
                    reject('Failed to activate device')
                }
            });
        }
    });
}
