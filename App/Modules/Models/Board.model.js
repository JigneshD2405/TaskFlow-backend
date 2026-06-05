"use strict";
import CommonSchema from "#App/Common/CommonModel.js";

import Node from "#Node";
const Schema = Node.Mongoose.Schema;

const schemaObj = {
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
};

const schema = new Schema(schemaObj, { collection: "boards", timestamps: true });
schema.add(CommonSchema);
schema.index({ ownerId: 1, deleted: 1 });
schema.index({ members: 1, deleted: 1 });
schema.plugin(Node.AggregatePagination);

export default Node.Mongoose.model("Board", schema);
