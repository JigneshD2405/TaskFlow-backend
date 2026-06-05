import { HTTP_ERRORS } from "#App/HttpResponse/Index.js";
import Board from "#Models/Board.model.js";
import Card from "#Models/Card.model.js";
import Column from "#Models/Column.model.js";
import { cardMoveSchema, cardSchema, cardUpdateSchema } from "#Validators/Card.validation.js";

const keyword = "Card";

const verifyColumnAccess = async (columnId, userId) => {
  const column = await Column.findOne({ _id: columnId, deleted: false });
  if (!column) throw new HTTP_ERRORS.NotFoundError("Column");

  const board = await Board.findOne({
    _id: column.boardId,
    deleted: false,
    $or: [{ ownerId: userId }, { members: userId }],
  });
  if (!board) throw new HTTP_ERRORS.ForbiddenError("Board access");

  return { column, board };
};

export const create = async (req) => {
  const columnId = req.params.id;
  const userId = req.login_user._id;

  const { column, board } = await verifyColumnAccess(columnId, userId);

  const { error, value } = cardSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  if (value.order === undefined) {
    const count = await Card.countDocuments({ columnId, deleted: false });
    value.order = count;
  }

  value.columnId = columnId;
  value.boardId = column.boardId;

  value.createdBy = req.login_user._id;
  value.updatedBy = req.login_user._id;
  const card = await Card.create(value);

  if (req.emitToBoard) {
    req.emitToBoard(board._id.toString(), "card:created", { card });
  }
  return card;
};

export const update = async (req) => {
  const id = req.params.id;
  const userId = req.login_user._id;

  const card = await Card.findOne({ _id: id, deleted: false });
  if (!card) throw new HTTP_ERRORS.NotFoundError(keyword);

  await verifyColumnAccess(card.columnId, userId);

  const { error, value } = cardUpdateSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  const updated = await Card.findOneAndUpdate({ _id: id }, { $set: value }, { new: true });

  if (req.emitToBoard) {
    req.emitToBoard(card.boardId.toString(), "card:updated", { card: updated });
  }
  return updated;
};
export const remove = async (req) => {
  const id = req.params.id;
  const userId = req.login_user._id;

  const card = await Card.findOne({ _id: id, deleted: false });
  if (!card) throw new HTTP_ERRORS.NotFoundError(keyword);

  await verifyColumnAccess(card.columnId, userId);

  const updated = await Card.findOneAndUpdate({ _id: id }, { deleted: true, deletedAt: new Date() }, { new: true });

  if (req.emitToBoard) {
    req.emitToBoard(card.boardId.toString(), "card:deleted", { cardId: id, columnId: card.columnId });
  }

  return updated;
};

export const move = async (req) => {
  const id = req.params.id;
  const userId = req.login_user._id;

  const { error, value } = cardMoveSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  const card = await Card.findOne({ _id: id, deleted: false });
  if (!card) throw new HTTP_ERRORS.NotFoundError(keyword);

  await verifyColumnAccess(card.columnId, userId);

  const targetColumn = await Column.findOne({ _id: value.targetColumnId, deleted: false });
  if (!targetColumn) throw new HTTP_ERRORS.NotFoundError("Target Column");

  if (targetColumn.boardId.toString() !== card.boardId.toString()) {
    throw new HTTP_ERRORS.ForbiddenError("Column belongs to a different board");
  }
  await Card.updateMany(
    {
      columnId: value.targetColumnId,
      order: { $gte: value.order },
      deleted: false,
      _id: { $ne: id },
    },
    { $inc: { order: 1 } },
  );

  const updated = await Card.findOneAndUpdate(
    { _id: id },
    { $set: { columnId: value.targetColumnId, order: value.order } },
    { new: true },
  );

  if (req.emitToBoard) {
    req.emitToBoard(card.boardId.toString(), "card:moved", {
      card: updated,
      fromColumnId: card.columnId,
      toColumnId: value.targetColumnId,
    });
  }

  return updated;
};
