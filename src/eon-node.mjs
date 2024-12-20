// connects to mqtt broker and sets NDEATH message
// Subcribes to STATE, NCMD, and DCMD topics

// Publishes NBIRTH on topic

import SparkplugClient from "sparkplug-client";
import { nanoid } from "nanoid";
import {interval} from "rxjs";
// start with connect
const config = {
  serverUrl: "tcp://localhost:1883",
  username: "admin",
  password: "masterkey",
  groupId: "Sparkplug",
  edgeNode: "EDGE",
  clientId: "myclientid",
  version: "spBv1.0",
};

const randomInt = function () {
  return 1 + Math.floor(Math.random() * 10);
};

class EonNode {
  constructor() {}
  interval = 2000;
  scanRate = 1000;
  myBoolean = false;
  currentHardwareVersion = "1.0.0";

  getNodeBirthPayload() {
    return {
      timestamp: new Date().getTime(),
      metrics: [
        {
          name: "Node Control/Reboot",
          type: "boolean",
          value: false,
        },
        {
          name: "Node Control/Rebirth",
          type: "boolean",
          value: false,
        },
        {
          name: "Node Control/Interval",
          type: "int",
          value: this.interval,
        },
        {
          name: "Node Control/Scan rate",
          type: "int",
          value: this.scanRate,
        },
        {
          name: "Node Control/my_bool",
          type: "boolean",
          value: this.myBoolean,
        },
        {
          name: "Properties/hardware_version",
          type: "string",
          value: this.currentHardwareVersion,
        },
      ],
    };
  }

  handleNCMD(payload) {
    var timestamp = payload.timestamp,
      metrics = payload.metrics;

    console.log("ncmd received", metrics);
    if (metrics !== undefined && metrics !== null) {
      for (var i = 0; i < metrics.length; i++) {
        var metric = metrics[i];
        const nodeBirthPayload = this.getNodeBirthPayload();
        if (metric.name == "Node Control/Rebirth" && metric.value) {
          // Publish Node BIRTH certificate
          sparkplugClient.publishNodeBirth(nodeBirthPayload);
          // Publish Device BIRTH certificate
          // sparkplugClient.publishDeviceBirth(deviceId, getDeviceBirthPayload());
        }
        if (metric.name === "Node Control/Interval") {
          this.interval = metric.value;
        }
      }
    }
  }
}

class Device {
  constructor() {}
  deviceId = "my device";
  inputs1 = 0;
  myDouble = Math.random() * 0.123456789;
  myFloat = Math.random() * 0.123;
  myInt = randomInt();
  getDeviceBirthPayload() {
    return {
      timestamp: new Date().getTime(),
      metrics: [
        { name: "output", value: this.myInt, type: "int", timestamp: new Date().getTime() },
        { name: 'my_arr',
          type: 'dataset',
          dataset_value: {
            'number_of_colums': 2,
            "types" : [ "int", "double" ],
            "columns" : [ "t", "y" ],
            "rows" : [
              [ new Date().getTime(), 0.123456789],
              [ new Date().getTime(), 1.123456789 ]
            ]
          },
          value: {
            'numOfColumns': 2,
            "types" : [ "int", "float" ],
            "columns" : [ "t", "y" ],
              "rows" : [ 
                  [ new Date().getTime(), 0.123456789],
                  [ new Date().getTime(), 1.123456789 ]
              ]
          }
        },
      ],
    };
  }

  getDataPayload() {
    // this.inputs1 = randomInt();
    // this.myBool = Math.random() > 0.5
    // this.myDouble = Math.random() * 0.123456789
    // this.myFloat = Math.random() * 0.123
    this.myInt = randomInt();
    const rowCount = randomInt();
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      rows.push([new Date().getTime(), Math.random() * 0.123456789]);
    }

    return {
      timestamp: new Date().getTime(),
      metrics: [
        // { name: "Inputs/1", value: this.inputs1, type: "int" },
        // { name: "my_boolean", value: this.myBool, type: "boolean" },
        // {
        //   name: "my_double",
        //   value: this.myDouble,
        //   type: "double",
        // },
        // { name: "my_float", value: this.myFloat, type: "float" },
        { name: "output", value: this.myInt, type: "int", timestamp: new Date().getTime() },
        {
          name: 'my_arr',
          type: 'dataset',
          value: {
            'numOfColumns': 2,
            "types" : [ "int", "double" ],
            "columns" : [ "t", "y" ],
            "rows" : rows
          },
          timestamp: new Date().getTime()
        },
      ],
    };
  }

  handleDCMD(payload) {
    var timestamp = payload.timestamp;
    const metrics = payload.metrics;
    console.log("dcmd received", metrics);
    // if (metrics !== undefined && metrics !== null) {
    //   for (var i = 0; i < metrics.length; i++) {
    //     var metric = metrics[i];
    //     if (metric.name == "Node Control/Rebirth" && metric.value) {
    //       console.log("Received 'Rebirth' command");
    //       // Publish Node BIRTH certificate
    //       sparkplugClient.publishNodeBirth(device.getNodeBirthPayload());
    //       // Publish Device BIRTH certificate
    //       sparkplugClient.publishDeviceBirth(deviceId, getDeviceBirthPayload());
    //     }
    //     if (metric.name === "Node Control/Emit interval") {
    //       console.log("Received 'Emit interval' command");
    //       // change device emit interval
    //     }
    //   }
    // }
  }
}

const deviceId = "my device";


// Generates a random integer


const hwVersion = "1.0.0";
const swVersion = "1.0.0";

const sparkplugClient = SparkplugClient.newClient(config);
const eonNode = new EonNode();
const device = new Device();

// Create 'birth' handler
sparkplugClient.on("birth", function () {
  // Publish Node BIRTH certificate
  console.log("publishing node birth");
  sparkplugClient.publishNodeBirth(eonNode.getNodeBirthPayload());
  // Publish Device BIRTH certificate
  const deviceBirthPayload = device.getDeviceBirthPayload();
  console.log('device birth', deviceBirthPayload);
  sparkplugClient.publishDeviceBirth(deviceId, deviceBirthPayload);
  
});

sparkplugClient.on("ncmd", function (payload) {
  eonNode.handleNCMD(payload);
  sparkplugClient.publishNodeBirth(eonNode.getNodeBirthPayload());
});

sparkplugClient.on("dcmd", function (payload) {
  device.handleDCMD(payload);
});

interval(5000).subscribe(() => {
  const payload = device.getDataPayload();
  console.log('publishing device data', payload);
  sparkplugClient.publishDeviceData(deviceId, payload);
  // sparkplugClient.publishDeviceBirth(deviceId, device.getDeviceBirthPayload());
})
