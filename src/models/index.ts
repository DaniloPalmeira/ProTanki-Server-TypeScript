import sequelize from "../database";
import User from "./User";
import Invite from "./Invite";
import Config from "./Config";

// Definir associações entre modelos
User.hasOne(Invite, { foreignKey: "userId", as: "invite" });
Invite.belongsTo(User, { foreignKey: "userId", as: "user" });

export { User, Invite, Config };