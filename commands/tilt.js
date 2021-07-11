const { sleep } = require("../utils");

module.exports = {
  name: "tilt",
  async execute({ device, args }) {
    const direction = args[0].toLowerCase();
    if (direction !== "up" && direction !== "down") {
      // invalid direction
      return;
    }

    await device.ptzMove({
      timeout: 1,
      speed: {
        x: 0.0,
        y: direction === "up" ? 0.5 : -0.5,
        z: 0.0,
      },
    });

    // Sleep for 1 second
    await sleep(1000);

    await device.ptzStop();
  },
};
