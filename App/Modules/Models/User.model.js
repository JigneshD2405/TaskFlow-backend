"use strict";
import Node from "#Node";
import CommonSchema from "#App/Common/CommonModel.js";
const Schema = Node.Mongoose.Schema;

const schemaObj = {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  refreshTokens: { type: [String], default: [] },
  status: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
};

const schema = new Schema(schemaObj, { collection: "users", timestamps: true });
schema.index({ email: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
schema.plugin(Node.AggregatePagination);

export default Node.Mongoose.model("User", schema);
