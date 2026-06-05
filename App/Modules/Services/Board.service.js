import { HTTP_ERRORS } from "#App/HttpResponse/Index.js";
import Node from "#Node"
import Board from "#Models/Board.model.js";
import { boardSchema, boardUpdateSchema } from "#Validators/Board.validation.js";

const keyword = "Board";

export const getById = async (req) => {
  const id = req.params.id;

  const board = await Board.findOne({ _id: id, deleted: false })
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

  return await Board.create(value);
};

export const list = async (req) => {
  const userId = req.login_user._id;
  const {
    page = 1,
    limit = 20,
    search,
    sort = "createdAt",
    sortType = -1,
  } = req.query;

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

  const board = await Board.findOne({ _id: id, ownerId: userId, deleted: false, });
  if (!board) throw new HTTP_ERRORS.NotFoundError(keyword);

  return await Board.findOneAndUpdate(
    { _id: id },
    { deleted: true, deletedAt: new Date(), deletedBy: userId },
    { new: true }
  );
};
