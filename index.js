const fs = require("fs");
const path = require("path");
const tmi = require("tmi.js");
const onvif = require("node-onvif");

// Get our configurations.
const { cameraConfig, channelName, commandPrefix, validChannelRewardIds } = require("./config.json");

// Create an OnvifDevice object
const device = new onvif.OnvifDevice(cameraConfig);

// Initialize the OnvifDevice object
device
  .init()
  .then(() => {
    // Get the UDP stream URL
    let url = device.getUdpStreamUrl();
    console.log("Device UDP stream url:\n", url);
  })
  .catch((error) => {
    console.error(error);
  });

// Create a TMI Client object
const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [channelName],
});

// Make an anonymous channel connection
client.connect();

const commands = new Map();
const commandsDir = path.resolve(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsDir);

commandFiles.forEach((file) => {
  const commandPath = path.join(commandsDir, file);
  const command = require(commandPath);
  commands.set(command.name, command);
});

// Create a channel point redeem listener
client.on("redeem", async (channel, username, type, tags, message) => {
  const rewardId = tags["custom-reward-id"];

  if (!rewardId || !validChannelRewardIds || !commandPrefix) {
    return;
  }

  if (!validChannelRewardIds.includes(rewardId)) {
    return;
  }

  if (!message.startsWith(commandPrefix)) {
    return;
  }

  const commandString = message.substring(commandPrefix.length);
  const [commandName, ...commandArgs] = commandString.trim().split(/ +/);

  const command = commands.get(commandName.toLowerCase());
  if (!command) {
    return;
  }

  try {
    await command.execute({
      tmi: client,
      device: device,
      args: commandArgs,
      tags: tags,
      message: message,
      userName: username,
    });
  } catch (err) {
    console.log("Error", {
      command,
      error: err,
    });
  }
});
