import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../database"; // Ajuste o caminho

interface InviteAttributes {
  id?: number;
  code: string;
  player: string | null; // Alterado para aceitar null
}

class Invite extends Model<InviteAttributes> implements InviteAttributes {
  public id!: number;
  public code!: string;
  public player!: string | null; // Alterado para aceitar null
}

Invite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
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
