import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../database";
import { INVITE_CODE_LENGTH } from "../config/constants";

// Interface para os atributos do modelo Invite
export interface InviteAttributes {
  id?: number;
  code: string;
  player: string | null;
  userId?: number | null;
}

/**
 * Model for Invite codes
 */
class Invite extends Model<InviteAttributes> implements InviteAttributes {
  public id!: number;
  public code!: string;
  public player!: string | null;
  public userId!: number | null;
}

Invite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(INVITE_CODE_LENGTH),
      unique: true,
      allowNull: false,
      validate: {
        len: [INVITE_CODE_LENGTH, INVITE_CODE_LENGTH],
      },
    },
    player: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Invite",
    tableName: "Invites",
    timestamps: false,
  }
);

export default Invite;
