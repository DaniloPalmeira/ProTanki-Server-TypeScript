import { Schema, model, Document } from "mongoose";
import { INVITE_CODE_LENGTH } from "../config/constants";

export interface IInvite extends Document {
  code: string;
  player: string | null;
  userId: Schema.Types.ObjectId | null;
}

const InviteSchema = new Schema<IInvite>({
  code: {
    type: String,
    required: true,
    unique: true,
    length: INVITE_CODE_LENGTH,
  },
  player: {
    type: String,
    default: null,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const Invite = model<IInvite>("Invite", InviteSchema);

export default Invite;
