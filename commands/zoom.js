const { sleep } = require("../utils");

module.exports = {
  name: "zoom",
  async execute({ device, args }) {
    const direction = args[0].toLowerCase();
    if (direction !== "in" && direction !== "out") {
      // invalid direction
      return;
    }

    await device.ptzMove({
      timeout: 1,
      speed: {
        x: 0.0,
        y: 0.0,
        z: direction === "in" ? 0.5 : -0.5,
      },
    });

    // Sleep for 1 second
    await sleep(1000);

    await device.ptzStop();
  },
};
