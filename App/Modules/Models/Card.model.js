"use strict";
import CommonSchema from "#App/Common/CommonModel.js";
import Node from "#Node";
const Schema = Node.Mongoose.Schema;

const schemaObj = {
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  columnId: { type: Node.Mongoose.Schema.Types.ObjectId, ref: "Column", required: true },
  boardId: { type: Node.Mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  assigneeId: { type: Node.Mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  dueDate: { type: Date, default: null },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    default: "MEDIUM",
  },
  order: { type: Number, default: 0 },
};

const schema = new Schema(schemaObj, { collection: "cards", timestamps: true });
schema.add(CommonSchema);
schema.index({ columnId: 1, deleted: 1, order: 1 });
schema.index({ boardId: 1, deleted: 1 });
schema.index({ assigneeId: 1, deleted: 1 });
schema.plugin(Node.AggregatePagination);

export default Node.Mongoose.model("Card", schema);
