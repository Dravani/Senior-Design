import responseTime from "response-time"
import logger from "./logger.js"
import chalk from "chalk"

function getStatusColor(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return chalk.green
  } else if (statusCode >= 300 && statusCode < 400) {
    return chalk.cyan
  } else if (statusCode >= 400 && statusCode < 500) {
    return chalk.yellow
  } else if (statusCode >= 500) {
    return chalk.red
  } else return chalk.white
}

const requestLogger = responseTime((request, response, time) => {
    const color = getStatusColor(response.statusCode)
    logger.info("Method:", chalk.hex('#FFA500')(request.method))
    logger.info("Path:", chalk.yellow(request.path))
    logger.info("Status code:", color(response.statusCode))
    logger.info("Response time:", chalk.green(`${time.toFixed(3)} ms`))
    logger.info("Body:", request.body)
    logger.info("----")
})

const unknownEndpoint = (request, response) => {
      logger.error("Unknown endpoint, please use a valid url");
      return response
        .status(404)
        .json({ error: "unknown endpoint" });
    };

    const errorHandler = (err, req, res, next) => {
          logger.error(err.stack);
          res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error"
          });
        };

export { requestLogger, unknownEndpoint, errorHandler }