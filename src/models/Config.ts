import { Schema, model, Document } from "mongoose";

export interface IConfig extends Document {
  key: string;
  value: string;
}

const ConfigSchema = new Schema<IConfig>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const Config = model<IConfig>("Config", ConfigSchema);

export default Config;
