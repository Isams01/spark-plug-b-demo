// connects to mqtt broker and sets NDEATH message
// Subcribes to STATE, NCMD, and DCMD topics

// Publishes NBIRTH on topic

import SparkplugClient from "sparkplug-client";
import { nanoid } from "nanoid";
// start with connect
const config = {
  serverUrl: "tcp://localhost:1883",
  username: "admin",
  password: "masterkey",
  groupId: "Sparkplug Devices",
  edgeNode: "my edge node",
  clientId: "myclientid",
  version: "spBv1.0",
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

const deviceId = 'my device';

//   timestamp: new Date().getTime(),
//   metrics: [
//     {
//       name: "Node Control/Reboot",
//       type: "boolean",
//       value: false,
//     },
//     {
//       name: "Node Control/Rebirth",
//       type: "boolean",
//       value: false,
//     },
//     {
//       name: "Node Control/Interval",
//       type: "int",
//       value: 2000,
//     },
//     {
//       name: "Node Control/Scan rate",
//       type: "boolean",
//       value: true,
//     },
//     {
//       name: "Node Control/my_bool",
//       type: "boolean",
//       value: false,
//     },
//     {
//       name: "Properties/hardware_version",
//       type: "string",
//       value: "test-hardware-version",
//     },
//   ],
// };


// Generates a random integer
const randomInt = function () {
  return 1 + Math.floor(Math.random() * 10);
};

const hwVersion = "1.0.0";
const swVersion = "1.0.0";

const deviceBirthPayload = {
  timestamp: new Date().getTime(),
  metrics: [
    { name: "my_boolean", value: Math.random() > 0.5, type: "boolean" },
    { name: "my_double", value: Math.random() * 0.123456789, type: "double" },
    { name: "my_float", value: Math.random() * 0.123, type: "float" },
    { name: "my_int", value: randomInt(), type: "int" },
    { name: "my_long", value: randomInt() * 214748364700, type: "long" },
    { name: "Inputs/0", value: true, type: "boolean" },
    { name: "Inputs/1", value: 0, type: "int" },
    { name: "Inputs/2", value: 1.23, type: "float" },
    { name: "Outputs/0", value: true, type: "boolean" },
    { name: "Outputs/1", value: 0, type: "int" },
    { name: "Outputs/2", value: 1.23, type: "float" },
    { name: "Properties/hw_version", value: hwVersion, type: "string" },
    { name: "Properties/sw_version", value: swVersion, type: "string" },
    {
      "name": "Device Control/Reboot",
      "type": "boolean",
      "value": false,
    },
    {
      "name": "Device Control/Rebirth",
      "type": "boolean",
      "value": false,
    },
    {
      name: "Device Control/Scan rate",
      type: "int",
      value: 3000,
    },
    {
      name: "my_dataset",
      type: "dataset",
      value: {
        numOfColumns: 2,
        types: ["string", "string"],
        columns: ["str1", "str2"],
        rows: [
          ["x", "a"],
          ["y", "b"],
        ],
      },
    },
    {
      name: "TemplateInstance1",
      type: "template",
      value: {
        templateRef: "Template1",
        isDefinition: false,
        metrics: [
          { name: "myBool", value: true, type: "boolean" },
          { name: "myInt", value: 100, type: "int" },
        ],
        parameters: [
          {
            name: "param1",
            type: "string",
            value: "value2",
          },
        ],
      },
    },
  ],
};

const sparkplugClient = SparkplugClient.newClient(config);
const eonNode = new EonNode();

// Create 'birth' handler
sparkplugClient.on("birth", function () {
  // Publish Node BIRTH certificate
  console.log("publishing node birth");
  sparkplugClient.publishNodeBirth(eonNode.getNodeBirthPayload());
  // Publish Device BIRTH certificate
  sparkplugClient.publishDeviceBirth(deviceId, deviceBirthPayload);
});

sparkplugClient.on("ncmd", function (payload) {
  eonNode.handleNCMD(payload);
  sparkplugClient.publishNodeBirth(eonNode.getNodeBirthPayload());
});

sparkplugClient.on("dcmd", function (payload) {
  const metrics = payload.metrics;
  console.log("dcmd received", metrics);
  if (metrics !== undefined && metrics !== null) {
    for (var i = 0; i < metrics.length; i++) {
      var metric = metrics[i];
      if (metric.name == "Node Control/Rebirth" && metric.value) {
        console.log("Received 'Rebirth' command");
        // Publish Node BIRTH certificate
        sparkplugClient.publishNodeBirth(getNodeBirthPayload());
        // Publish Device BIRTH certificate
        sparkplugClient.publishDeviceBirth(deviceId, getDeviceBirthPayload());
      }
      if (metric.name === "Node Control/Emit interval") {
        console.log("Received 'Emit interval' command");
        // change device emit interval
      }
    }
  }
});
