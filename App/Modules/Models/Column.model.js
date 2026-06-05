"use strict";
import CommonSchema from "#App/Common/CommonModel.js";
import Node from "#Node";
const Schema = Node.Mongoose.Schema;


const schemaObj = {
  title: { type: String, required: true, trim: true },
  boardId: { type: Node.Mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  order: { type: Number, default: 0 },
};

const schema = new Schema(schemaObj, { collection: "columns", timestamps: true });
schema.add(CommonSchema);
schema.index({ boardId: 1, deleted: 1, order: 1 });
schema.plugin(Node.AggregatePagination);

export default Node.Mongoose.model("Column", schema);
