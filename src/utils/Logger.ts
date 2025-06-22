import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const ENABLE_CONSOLE_LOGGING = process.env.ENABLE_CONSOLE_LOGGING !== "false";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOGS_DIR = path.join(__dirname, "../../logs");

let isLoggerClosed = false;

function ensureLogsDirectory(): void {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
      console.log(`Created logs directory: ${LOGS_DIR}`);
    }
    fs.accessSync(LOGS_DIR, fs.constants.W_OK);
  } catch (error) {
    console.error(`Failed to create or access logs directory: ${error}`);
    throw new Error(`Erro ao criar ou acessar o diretório de logs: ${error}`);
  }
}

ensureLogsDirectory();

const customFormat = winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
  let log = `${timestamp} ${level}: ${message}`;

  if (stack) {
    log += `\n${stack}`;
  }

  if (meta && Object.keys(meta).length) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }

  return log;
});

const fileFormat = winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.errors({ stack: true }), winston.format.splat(), customFormat);

const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.errors({ stack: true }), winston.format.splat(), customFormat);

const transports: winston.transport[] = [
  new DailyRotateFile({
    filename: path.join(LOGS_DIR, "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    format: fileFormat,
    level: LOG_LEVEL,
    handleExceptions: true,
    handleRejections: true,
  }),
  new DailyRotateFile({
    filename: path.join(LOGS_DIR, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    format: fileFormat,
    level: "error",
    handleExceptions: true,
    handleRejections: true,
  }),
];

if (ENABLE_CONSOLE_LOGGING) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: LOG_LEVEL,
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: fileFormat,
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOGS_DIR, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      format: fileFormat,
    }),
    ...(ENABLE_CONSOLE_LOGGING ? [new winston.transports.Console({ format: consoleFormat })] : []),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOGS_DIR, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      format: fileFormat,
    }),
    ...(ENABLE_CONSOLE_LOGGING ? [new winston.transports.Console({ format: consoleFormat })] : []),
  ],
  exitOnError: false,
});

transports.forEach((transport, index) => {
  transport.on("error", (error) => {
    console.error(`Error in transport ${index} (${transport.constructor.name}): ${error.message}`);
    if (!isLoggerClosed) {
      logger.error(`Transport error`, {
        transport: transport.constructor.name,
        error,
      });
    }
  });
});

logger.info("Logger initialized", {
  consoleLogging: ENABLE_CONSOLE_LOGGING,
  logLevel: LOG_LEVEL,
  transports: transports.length,
});

logger.on("finish", () => {
  isLoggerClosed = true;
});

process.on("beforeExit", (code) => {
  if (!isLoggerClosed) {
    logger.end(() => {
      console.log(`Logger flushed and closed before exit with code: ${code}`);
    });
  }
});

process.on("unhandledRejection", (reason, promise) => {
  if (!isLoggerClosed) {
    logger.error("Unhandled Rejection at:", { promise, reason });
  }
});

process.on("uncaughtException", (error) => {
  if (!isLoggerClosed) {
    logger.error("Uncaught Exception:", { error });
  }
});

export default logger;
