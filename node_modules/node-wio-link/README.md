# node-wio-link
A node.js client library for using the Wio Link API.

## Table Of Contents

* [Documentation](#documentation)
    * [User Management](#user-management)
    * [Node Management](#node-management)
    * [Grove Driver](#grove-driver)
    * [Boards/Platform](#boardsplatform)
    * [Single Node](#single-node)
    * [Coding on the fly](#coding-on-the-fly)
* [Examples](#examples)
    * [Using Promises (normal functions)](#using-promises-normal-functions)
    * [Using Promises (arrow functions)](#using-promises-arrow-functions)
    * [Using Async/Await](#using-asyncawait)
* [TODO](#todo)

## Documentation
Official Documentation: http://seeed-studio.github.io/Wio_Link/

Built-In Grove APIs: https://github.com/Seeed-Studio/Wio_Link/wiki/Built-in-Grove-APIs

All methods return a promise, which either resolves to the data received, or rejects with an error.

### User Management
```javascript
// Creates a new user account.
Object wioClient.user.create(String email, String password)

// Changes the password of an existing account.
Object wioClient.user.changePassword(String userToken, String newPassword)

// Retrieve the password of an existing account.
Object wioClient.user.retrievePassword(String email)

// Log in to the server with the given credentials.
Object wioClient.user.login(String email, String password)
```

### Node Management
```javascript
// Creates a new node.
Object wioClient.nodeManagement.create(String userToken, String name, optional String boardType)

// List the nodes associated with the user.
Object wioClient.nodeManagement.list(String userToken)

// Rename an existing node.
Object wioClient.nodeManagement.rename(String userToken, String newName, String nodeSN)

// Delete an existing node.
Object wioClient.nodeManagement.delete(String userToken, String nodeSN)
```

### Grove Driver
```javascript
// Retrieve all of the grove drivers' information.
Object wioClient.groveDriver.info(String userToken)

// Retrieve the status of last driver scanning.
Object wioClient.groveDriver.scanStatus(String userToken)
```

### Boards/Platform
```javascript
// List all of the supported boards.
Object wioClient.boards.list(String userToken)
```

### Single Node
```javascript
// Lists all of the available resources on a node.
Object wioClient.node.wellKnown(String nodeToken)

// Read the property of a Grove module.
Object wioClient.node.read(String nodeToken, String groveInstName, String property, String...args)

// Write to a Grove module.
Object wioClient.node.write(String nodeToken, String groveInstName, String PropertyOrMethodOrAction, String...args)

// Put the node to sleep.
Object wioClient.node.sleep(String nodeToken, Number sleepAmount)

// Retrieve the API reference page from the node.
Object wioClient.node.resources(String nodeToken)

// Trigger the OTA process for the node.
Object wioClient.node.otaTrigger(String nodeToken, Object data, optional Number buildPhase)

// Track the OTA status of the node.
Object wioClient.node.otaStatus(String nodeToken)

// Get the configuration of the node.
Object wioClient.node.config(String nodeToken)

// Change the data exchange server for the node.
Object wioClient.node.changeDataExchangeServer(String nodeToken, String address, String dataxurl)
```

### Coding on the fly
```javascript
// Upload a user's logic block to a node.
Object wioClient.cotf.uploadULB(String nodeToken, Object data)

// Download a user's logic block from a node.
Object wioClient.cotf.downloadULB(String nodeToken)

// Get the value of a variable on the node.
Object wioClient.cotf.getVariable(String nodeToken, String varName)

// Set the value of a variable on the node.
Object wioClient.cotf.setVariable(String nodeToken, String varName, String varValue)

// Call a function on the node.
Object wioClient.cotf.callFunction(String nodeToken, String funcName, String arg)
```

## Examples
### Using Promises (normal functions)
```javascript
// serverLocation can be 'us' or 'cn'
var wioClient = require('node-wio-link')(serverLocation)
wioClient.node.read(nodeToken, 'GroveAirqualityA0', 'quality')
  .then(function(data) {
    console.log(data)
  })
  .catch(function(error) {
    console.log(error)
  });
```

### Using Promises (arrow functions)
```javascript
// serverLocation can be 'us' or 'cn'
var wioClient = require('node-wio-link')(serverLocation)
wioClient.node.read(nodeToken, 'GroveAirqualityA0', 'quality')
  .then(data => console.log(data))
  .catch(error => console.log(error));
```

### Using Async/Await
```javascript
// serverLocation can be 'us' or 'cn'
var wioClient = require('node-wio-link')(serverLocation)

(async function() {
  try {
    var airQuality = await wioClient.node.read(nodeToken, 'GroveAirqualityA0', 'quality');
    console.log(airQuality);
  } catch (error) {
    console.log(error);
  }
})();
```

## TODO
* add unit testing
