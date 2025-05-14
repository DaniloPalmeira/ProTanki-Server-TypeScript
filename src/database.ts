import { Sequelize, Dialect } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configures and initializes the Sequelize instance based on the database dialect.
 * @returns {Sequelize} The configured Sequelize instance.
 * @throws {Error} If required environment variables are missing for the chosen dialect.
 */
function initializeDatabase(): Sequelize {
  const dialect = (process.env.DB_DIALECT || "sqlite") as Dialect;
  const isProduction = process.env.NODE_ENV === "production";

  if (dialect === "postgres") {
    const requiredEnvVars = [
      "DB_HOST",
      "DB_PORT",
      "DB_USER",
      "DB_PASSWORD",
      "DB_NAME",
    ];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(
          `Missing required environment variable for PostgreSQL: ${envVar}`
        );
      }
    }

    return new Sequelize({
      dialect: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: isProduction ? false : console.log,
      pool: {
        max: 10,
        min: 2,
        acquire: 3000,
        idle: 10000,
      },
    });
  } else if (dialect === "sqlite") {
    return new Sequelize({
      dialect: "sqlite",
      storage: process.env.DB_STORAGE || "database.sqlite",
      logging: isProduction ? false : false,
      pool: {
        max: 5,
        min: 1,
        acquire: 3000,
        idle: 10000,
      },
    });
  } else {
    throw new Error(`Unsupported database dialect: ${dialect}`);
  }
}

const sequelize = initializeDatabase();

export default sequelize;
