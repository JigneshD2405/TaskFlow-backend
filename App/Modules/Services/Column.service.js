import { HTTP_ERRORS } from "#App/HttpResponse/Index.js";
import Board from "#Models/Board.model.js";
import Column from "#Models/Column.model.js";
import { columnSchema, columnUpdateSchema } from "#Validators/Column.validation.js";
const keyword = "Column";

const verifyBoardAccess = async (boardId, userId) => {
  const board = await Board.findOne({
    _id: boardId,
    deleted: false,
    $or: [{ ownerId: userId }, { members: userId }],
  });
  if (!board) throw new HTTP_ERRORS.NotFoundError("Board");
  return board;
};

export const create = async (req) => {
  const boardId = req.params.id;
  const userId = req.login_user._id;

  await verifyBoardAccess(boardId, userId);

  const { error, value } = columnSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  if (value.order === undefined) {
    const count = await Column.countDocuments({ boardId, deleted: false });
    value.order = count;
  }

  value.boardId = boardId;
  value.createdBy = req.login_user._id;
  value.updatedBy = req.login_user._id;
  const column = await Column.create(value);

  if (req.emitToBoard) {
    req.emitToBoard(boardId.toString(), "column:created", { column });
  }

  return column;
};

export const update = async (req) => {
  const id = req.params.id;
  const userId = req.login_user._id;

  const column = await Column.findOne({ _id: id, deleted: false });
  if (!column) throw new HTTP_ERRORS.NotFoundError(keyword);

  await verifyBoardAccess(column.boardId, userId);

  const { error, value } = columnUpdateSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  const updated = await Column.findOneAndUpdate({ _id: id }, { $set: value }, { new: true });

  if (req.emitToBoard) {
    req.emitToBoard(column.boardId.toString(), "column:updated", { column: updated });
  }

  return updated;
};

export const remove = async (req) => {
  const id = req.params.id;
  const userId = req.login_user._id;

  const column = await Column.findOne({ _id: id, deleted: false });
  if (!column) throw new HTTP_ERRORS.NotFoundError(keyword);

  await verifyBoardAccess(column.boardId, userId);

  const updated = await Column.findOneAndUpdate(
    { _id: id },
    { deleted: true, deletedAt: new Date(), deletedBy: req.login_user._id },
    { new: true },
  );

  if (req.emitToBoard) {
    req.emitToBoard(column.boardId.toString(), "column:deleted", { columnId: id });
  }
  return updated;
};
