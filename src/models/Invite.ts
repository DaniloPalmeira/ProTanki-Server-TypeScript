import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../database";
import { INVITE_CODE_LENGTH } from "../config/constants";

interface InviteAttributes {
  id?: number;
  code: string;
  player: string | null;
}

/**
 * Model for Invite codes
 */
class Invite extends Model<InviteAttributes> implements InviteAttributes {
  public id!: number;
  public code!: string;
  public player!: string | null;
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
  },
  {
    sequelize,
    modelName: "Invite",
    tableName: "Invites",
    timestamps: false,
  }
);

export default Invite;