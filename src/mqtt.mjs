import mqtt from 'mqtt';
import protobuf from 'protobufjs';

// Load a .proto file
const root = protobuf.loadSync('/Users/isamuito/Documents/TOKU/sparkplugb/src/sample.proto');

const client = mqtt.connect('mqtt://localhost:1883');
client.on("connect", () => {
  client.subscribe("#", (err) => {
    if (!err) {
      // client.publish("presence/test/test", "Hello mqtt");
      console.log("#");
    }
  });
});

client.on("message", (topic, message) => {
  // message is Buffer
  console.log(topic.toString());
  // process message protobuf
  // const messageProto = root.lookupType("Payload");
  // const decodedMessage = messageProto.decode(message);
  // console.log(decodedMessage);
  // client.end();
});