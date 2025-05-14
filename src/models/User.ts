import {
  DataTypes,
  Model,
  Sequelize,
  CreateOptions,
  InstanceUpdateOptions,
} from "sequelize";
import sequelize from "../database";
import bcrypt from "bcrypt";

// Interface para os atributos do modelo User
export interface UserAttributes {
  id?: number;
  username: string;
  password: string;
  email?: string | null;
  crystals: number;
  experience: number;
  level: number;
  isActive: boolean;
  createdAt?: Date;
  lastLogin?: Date | null;
}

/**
 * Model for Users
 */
class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public email!: string | null;
  public crystals!: number;
  public experience!: number;
  public level!: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public lastLogin!: Date | null;

  // Método para verificar senha
  public verifyPassword(
    password: string,
    callback: (error: Error | undefined, isMatch?: boolean) => void
  ): void {
    bcrypt.compare(
      password,
      this.password,
      (error: Error | undefined, isMatch: boolean) => {
        if (error) {
          return callback(error);
        }
        callback(undefined, isMatch);
      }
    );
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 50], // Mínimo 3, máximo 50 caracteres
        isAlphanumeric: true, // Apenas letras e números
      },
    },
    password: {
      type: DataTypes.STRING(255), // Para armazenar o hash
      allowNull: false,
      validate: {
        len: [8, 255], // Mínimo 8 caracteres
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true, // Valida formato de e-mail
      },
    },
    crystals: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0, // Não pode ser negativo
      },
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1, // Nível mínimo é 1
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: false,
    hooks: {
      beforeCreate: (user: User, options: CreateOptions<UserAttributes>) => {
        return new Promise<void>((resolve, reject) => {
          bcrypt.hash(
            user.password,
            10,
            (error: Error | undefined, hash: string) => {
              if (error) {
                return reject(error);
              }
              user.password = hash;
              resolve();
            }
          );
        });
      },
      beforeUpdate: (
        user: User,
        options: InstanceUpdateOptions<UserAttributes>
      ) => {
        if (user.changed("password")) {
          return new Promise<void>((resolve, reject) => {
            bcrypt.hash(
              user.password,
              10,
              (error: Error | undefined, hash: string) => {
                if (error) {
                  return reject(error);
                }
                user.password = hash;
                resolve();
              }
            );
          });
        }
      },
    },
  }
);

export default User;
