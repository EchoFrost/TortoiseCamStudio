const { sleep } = require("../utils");

module.exports = {
  name: "pan",
  async execute({ device, args }) {
    const direction = args[0].toLowerCase();
    if (direction !== "left" && direction !== "right") {
      // invalid direction
      return;
    }

    await device.ptzMove({
      timeout: 1,
      speed: {
        x: direction === "left" ? 0.5 : -0.5,
        y: 0.0,
        z: 0.0,
      },
    });

    // Sleep for 1 second
    await sleep(1000);

    await device.ptzStop();
  },
};
