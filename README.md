# IoT Workshop v2.0 - refreshed for Oracle Code 2018

## For documentation and instruction, see: <a href="https://github.com/raymondxie/iotws18/wiki">https://github.com/raymondxie/iotws18/wiki</a> ##

Main script used for Workshop

**1. wio.js**

the JS module provide convenient read, stream, and write to virtualized sensors on Wio board

**2. testWio.js**

the starter NodeJS code for testing your Wio board and sensor setup

**3. sensor-config.js**

the configuration file for your Wio board sensor setup, as well as mapping to device model defined in IoTCS

**4. wio-iotcs-client.js**

the main client code that interacts with Wio board and sensors on one side, and communicates with IoTCS on the other side. 

**5. To run the program**

node wio-iotcs-client.js <provision_file> <provision_file_secret>

then the program will continuously read input data from sensor and feed to IoTCS, as well as listen for commands from IoTCS to control device output.
