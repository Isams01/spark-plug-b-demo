import mqtt from 'mqtt';
import protobuf from 'protobufjs';
import config from 'config';

// Load a .proto file
const root = protobuf.loadSync('/Users/isamuito/Documents/TOKU/sparkplugb/src/sample.proto');

const username = config.get('username');
const password = config.get('password');

const client = mqtt.connect({
  protocol: "tcp",
  host: "localhost",
  port: 1883,
  username: username,
  password: password,
});
client.on("connect", () => {
  client.subscribe("spBv1.0/Sparkplug/#", (err) => {
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
  const messageProto = root.lookupType("Payload");
  const decodedMessage = messageProto.decode(message);
  console.log(decodedMessage.timestamp);
  // client.end();
});