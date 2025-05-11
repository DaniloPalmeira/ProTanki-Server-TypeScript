import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const ENABLE_CONSOLE_LOGGING = process.env.ENABLE_CONSOLE_LOGGING !== "false";
const LOGS_DIR = path.join(__dirname, "../../logs");

// Estado para rastrear se o logger está fechado
let isLoggerClosed = false;

// Cria o diretório de logs se não existir
function ensureLogsDirectory(): void {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
      console.log(`Created logs directory: ${LOGS_DIR}`);
    }
    // Verifica permissões de escrita
    fs.accessSync(LOGS_DIR, fs.constants.W_OK);
  } catch (error) {
    console.error(`Failed to create or access logs directory: ${error}`);
    throw new Error(`Erro ao criar ou acessar o diretório de logs: ${error}`);
  }
}

// Formato simplificado e mais limpo para o console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.align(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` | ${JSON.stringify(meta, null, 2).replace(/\n/g, " ")}`
      : "";
    return `${timestamp} ${level}: ${message}${metaString}`;
  })
);

// Formato para arquivos (JSON com timestamp)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // Captura stack traces
  winston.format.json()
);

// Garante que o diretório de logs exista antes de configurar os transportes
ensureLogsDirectory();

// Configuração dos transports
const transports: winston.transport[] = [
  // Logs gerais
  new DailyRotateFile({
    filename: path.join(LOGS_DIR, "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    format: fileFormat,
    level: "debug",
    handleExceptions: true,
    handleRejections: true,
  }),
  // Logs de erro
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

// Adiciona console transport se habilitado
if (ENABLE_CONSOLE_LOGGING) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

// Criação do logger
const logger = winston.createLogger({
  level: "debug", // Garante que todos os níveis de log sejam capturados
  format: fileFormat,
  transports,
  // Configuração explícita para capturar erros não tratados
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOGS_DIR, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      format: fileFormat,
    }),
    ...(ENABLE_CONSOLE_LOGGING
      ? [new winston.transports.Console({ format: consoleFormat })]
      : []),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOGS_DIR, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      format: fileFormat,
    }),
    ...(ENABLE_CONSOLE_LOGGING
      ? [new winston.transports.Console({ format: consoleFormat })]
      : []),
  ],
  // Garante que o processo não termine imediatamente ao capturar erros
  exitOnError: false,
});

// Adiciona manipulador de erro para transportes
transports.forEach((transport, index) => {
  transport.on("error", (error) => {
    console.error(`Error in transport ${index} (${transport.constructor.name}): ${error.message}`);
    if (!isLoggerClosed) {
      logger.error(`Transport error`, { transport: transport.constructor.name, error });
    }
  });
});

// Log de inicialização
logger.info("Logger initialized", {
  consoleLogging: ENABLE_CONSOLE_LOGGING,
  transports: transports.length,
});

// Garante que os logs sejam flushados antes de encerrar
logger.on("finish", () => {
  isLoggerClosed = true;
});

process.on("beforeExit", (code) => {
  console.log(`Process exiting with code: ${code}`);
  if (!isLoggerClosed) {
    logger.end(() => {
      console.log("Logger flushed and closed");
    });
  }
});

// Intercepta erros não capturados globalmente
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