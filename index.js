const onvif = require("node-onvif");
const tmi = require("tmi.js");
const fs = require("fs");

const cameraConfig = JSON.parse(fs.readFileSync("./cameraConfig.json"));
const twitchConfig = JSON.parse(fs.readFileSync("./twitchConfig.json"));

// Create an OnvifDevice object
const device = new onvif.OnvifDevice(cameraConfig);

// Initialize the OnvifDevice object
device
  .init()
  .then(() => {
    // Get the UDP stream URL
    let url = device.getUdpStreamUrl();
    console.log(url);
  })
  .catch((error) => {
    console.error(error);
  });

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [twitchConfig.channelName],
});

client.connect();

client.on("message", (channel, tags, message, self) => {
  console.log(`${tags["display-name"]}: ${message}`);
  let params = {
    speed: {
      x: 1.0, // Speed of pan (in the range of -1.0 to 1.0)
      y: 0.0, // Speed of tilt (in the range of -1.0 to 1.0)
      z: 0.0, // Speed of zoom (in the range of -1.0 to 1.0)
    },
    timeout: 1, // seconds
  };
  // Move the camera
  device
    .ptzMove(params)
    .then(() => {
      console.log("Done!");
    })
    .catch((error) => {
      console.error(error);
    });
});
