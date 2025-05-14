import { DataTypes, Model } from "sequelize";
import sequelize from "../database";

// Interface para os atributos do modelo Config
export interface ConfigAttributes {
  key: string;
  value: string;
}

/**
 * Model for Configuration key-value pairs
 */
class Config extends Model<ConfigAttributes> implements ConfigAttributes {
  public key!: string;
  public value!: string;
}

Config.init(
  {
    key: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    value: {
      type: DataTypes.TEXT, // Alterado para TEXT para suportar valores maiores
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Config",
    tableName: "Configs",
    timestamps: false,
  }
);

export default Config;