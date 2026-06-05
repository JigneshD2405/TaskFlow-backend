import { HTTP_ERRORS } from "#App/HttpResponse/Index.js";
import { withTransaction } from "#App/Utils/Index.js";
import Board from "#Models/Board.model.js";
import Card from "#Models/Card.model.js";
import Column from "#Models/Column.model.js";
import Node from "#Node";
import { boardSchema, boardUpdateSchema } from "#Validators/Board.validation.js";
const keyword = "Board";

export const getById = async (req) => {
  const id = req.params.id;
  const userId = req.login_user._id;

  const [board] = await Board.aggregate([
    {
      $match: {
        _id: new Node.Mongoose.Types.ObjectId(id),
        deleted: false,
        $or: [{ ownerId: userId }, { members: userId }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1, email: 1 } }],
        as: "members",
      },
    },
    {
      $lookup: {
        from: "columns",
        let: { boardId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$boardId", "$$boardId"] }, { $eq: ["$deleted", false] }],
              },
            },
          },
          { $sort: { order: 1 } },
          {
            $lookup: {
              from: "cards",
              let: { columnId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$columnId", "$$columnId"] }, { $eq: ["$deleted", false] }],
                    },
                  },
                },
                { $sort: { order: 1 } },
              ],
              as: "cards",
            },
          },
        ],
        as: "columns",
      },
    },
  ]);

  if (!board) throw new HTTP_ERRORS.NotFoundError(keyword);
  return board;
};

export const create = async (req) => {
  const { error, value } = boardSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  value.ownerId = req.login_user._id;
  if (!value.members) value.members = [];

  const ownerStr = req.login_user._id.toString();
  if (!value.members.map(String).includes(ownerStr)) {
    value.members.push(req.login_user._id);
  }
  value.createdBy = req.login_user._id;
  value.updatedBy = req.login_user._id;
  return await Board.create(value);
};

export const list = async (req) => {
  const userId = req.login_user._id;
  const { page = 1, limit = 20, search, sort = "createdAt", sortType = -1 } = req.query;

  const matchStage = {
    deleted: false,
    $or: [{ ownerId: userId }, { members: userId }],
  };

  if (search) {
    matchStage.title = { $regex: search, $options: "i" };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "ownerId",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1, email: 1 } }],
        as: "owner",
      },
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        description: 1,
        owner: 1,
        members: 1,
        createdAt: 1,
      },
    },
    { $sort: { [sort]: Number(sortType) } },
  ];

  return await Board.aggregatePaginate(Board.aggregate(pipeline), {
    page: Number(page),
    limit: Number(limit),
  });
};

export const update = async (req) => {
  const id = req.params.id;
  const userId = req.login_user._id;

  const { error, value } = boardUpdateSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  const board = await Board.findOne({ _id: id, ownerId: userId, deleted: false });
  if (!board) throw new HTTP_ERRORS.NotFoundError(keyword);

  return await Board.findOneAndUpdate({ _id: id }, { $set: value }, { new: true });
};

export const remove = async (req) => {
  const id = req.params.id;
  const userId = req.login_user._id;

  const board = await Board.findOne({ _id: id, ownerId: userId, deleted: false });
  if (!board) throw new HTTP_ERRORS.NotFoundError(keyword);

  const now = new Date();

  return await withTransaction(async (session) => {
    await Card.updateMany(
      { boardId: id, deleted: false },
      { deleted: true, deletedAt: now, deletedBy: req.login_user._id },
      { session },
    );

    await Column.updateMany(
      { boardId: id, deleted: false },
      { deleted: true, deletedAt: now, deletedBy: req.login_user._id },
      { session },
    );

    return await Board.findOneAndUpdate(
      { _id: id },
      { deleted: true, deletedAt: now, deletedBy: req.login_user._id },
      { new: true, session },
    );
  });
};
