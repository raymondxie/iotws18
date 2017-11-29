/*
 * This sample changes a message attribute on virtual device and triggers a message 
 * to the Cloud Service with the updated attribute value.
 *
 * The client is a directly connected device using the virtual device API.
 *
 * To configurate IoTCS application to run this program, see documentation at:
 * http://www.oracle.com/webfolder/technetwork/tutorials/obe/cloud/iot/IoT%20Quickstart%20Android/IoTQuickStartAndroid.html
 *
 */

dcl = require("device-library.node");
dcl = dcl({debug: true});

dcl.oracle.iot.tam.store = (process.argv[2]);
dcl.oracle.iot.tam.storePassword = (process.argv[3]);

var myModel;
var virtualDev;

function startVirtualHWDevice(device, id) {
    var virtualDev = device.createVirtualDevice(id, myModel);
    var count = 0;
    var newValues = {
       "message": "Hello World!"
    };

    // Change the attribute message and trigger an update on the vitual device
    var send = function () {
        count += 1;
        newValues.message = "Hello World " + count;
        virtualDev.update(newValues);
        if (count > 5) {
            virtualDev.close();
            clearInterval(timer);
        }
    };

    timer = setInterval(send, 1000);
}
      
// Display the device model
function getHWModel(device){
    device.getDeviceModel('urn:test:js:helloworld', function (response) {
        console.log('-----------------MY DEVICE MODEL----------------------------');
        console.log(JSON.stringify(response,null,4));
        console.log('------------------------------------------------------------');
        myModel = response;
        startVirtualHWDevice(device, device.getEndpointId());
    });
}

// Create a directly connected device and activate it if not already activated
var dcd = new dcl.device.DirectlyConnectedDevice();
if (dcd.isActivated()) {
    getHWModel(dcd);
} else {
    dcd.activate(['urn:test:js:helloworld'], function (device) {
        dcd = device;
        console.log(dcd.isActivated());
        if (dcd.isActivated()) {
            getHWModel(dcd);
        }
    });
}                    