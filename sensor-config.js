// The config file indicates how your GrovePi sensors are connected,
//    pin   - indicates which socket the sensor is connected to
//    type  - sensor type label, matching with switch() code in mainClient.js
//    attr  - the attribute name in device model that this sensor data is corresponding to
//    val   - the initial value for this attribute
//
// An sample config file looks like below, please take only the sensors that you are using,
// also make sure the attribute name (attr) and initial value (val) are properly set for your case.
// If you have other type of sensor, you can add an entry in this config file, and in mainClient.js
//
/*
var config = [
  {
    "pin": "A0",
    "type": "SoundAnalogSensor"
  },
  {
    "pin": "A1",
    "type": "RotaryAngleAnalogSensor"
  },
  {
    "pin": "A2",
    "type": "LightAnalogSensor"
  },
  {
    "pin": "D4",
    "type": "LEDSocketKit"
  },
  {
    "pin": "D5",
    "type": "TemperatureAndHumiditySensor"
  },
  {
    "pin": "D7",
    "type": "Button"
  },
  {
    "pin": "D8",
    "type": "Buzzer"
  },
  {
    "pin": "D6",
    "type": "UltrasonicRanger"
  }
];
*/

var config = [
  {
    "pin": "A2",
    "type": "RotaryAngleAnalogSensor",
    "attr": "angle",
    "val": 0
  },
  {
    "pin": "A1",
    "type": "LightAnalogSensor",
    "attr": "light",
    "val": 0
  },
  {
    "pin": "D3",
    "type": "Button",
    "attr": "button",
    "val": false
  }
];
module.exports = config;
