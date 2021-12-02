const winston = require("winston");
const controller = {};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { date: Date() },
  transports: [
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

controller.info = (msg) => {
  logger.info(msg);
};

controller.error = (msg) => {
  logger.error(msg);
};

controller.log = (logObject) => {
  logger.log(logObject);
};

module.exports = controller;
