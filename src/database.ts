import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "@Danilo123", // Senha com @ diretamente
  database: "tanki",
  logging: false,
});

export default sequelize;
