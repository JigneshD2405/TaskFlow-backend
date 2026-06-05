import { HTTP_ERRORS } from "#App/HttpResponse/Index.js";
import User from "#Models/User.model.js";
import { generateAccessToken, generateRefreshToken, hashPassword, verifyPassword, verifyRefreshToken } from "#Index";
import { loginSchema, registerSchema } from "#App/Modules/Validators/User.validation.js";
import Node from "#Node"

export const register = async (req) => {

  const { error, value } = registerSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  const existing = await User.findOne({ email: value.email, deleted: false });
  if (existing) throw new HTTP_ERRORS.AlreadyExistError("Email");

  value.password = await hashPassword(value.password);
  value.updatedBy = req?.login_user?._id || new Node.Mongoose.ObjectId()
  value.createdBy = req?.login_user?._id || new Node.Mongoose.ObjectId()
  const user = await User.create(value);
  return { _id: user._id, name: user.name, email: user.email };
};

export const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body || {});
  if (error) throw new HTTP_ERRORS.CustomError(error.details[0].message);

  const user = await User.findOne({ email: value.email, deleted: false });
  if (!user) throw new HTTP_ERRORS.InvalidCredentials();

  const isMatch = await verifyPassword(value.password, user.password);
  if (!isMatch) throw new HTTP_ERRORS.InvalidCredentials();

  const tokenPayload = { _id: user._id, email: user.email, name: user.name };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return {
    accessToken,
    user: { _id: user._id, name: user.name, email: user.email },
  };
};

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new HTTP_ERRORS.CustomError("Refresh token missing");

  const payload = verifyRefreshToken(token);
  if (payload.status === 400) throw new HTTP_ERRORS.TokenExpirationError();

  const user = await User.findOne({ _id: payload.data._id, deleted: false });
  if (!user) throw new HTTP_ERRORS.CustomError("Invalid token");

  if (!user.refreshTokens.includes(token)) {
    user.refreshTokens = [];
    await user.save();
    throw new HTTP_ERRORS.CustomError("Token reuse detected");
  }

  const tokenPayload = { _id: user._id, email: user.email, name: user.name };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken: newAccessToken };
};

export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token && req.login_user) {
    req.login_user.refreshTokens = (req.login_user.refreshTokens || []).filter((t) => t !== token);
    await req.login_user.save();
  }
  res.clearCookie("refreshToken");
};
