import Node from "#Node";

export function generateAccessToken(payload) {
  try {
    return Node.Jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
      algorithm: "HS256",
    });
  } catch (error) {
    throw new Error("Error generating access token!");
  }
}

export function generateRefreshToken(payload) {
  try {
    return Node.Jwt.sign(payload, process.env.JWT_SECRET + "_refresh", {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
      algorithm: "HS256",
    });
  } catch (error) {
    throw new Error("Error generating refresh token!");
  }
}

export function verifyAccessToken(token) {
  try {
    const data = Node.Jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    return { status: 200, data };
  } catch (error) {
    return { status: 400, data: error };
  }
}

export function verifyRefreshToken(token) {
  try {
    const data = Node.Jwt.verify(token, process.env.JWT_SECRET + "_refresh", { algorithms: ["HS256"] });
    return { status: 200, data };
  } catch (error) {
    return { status: 400, data: error };
  }
}

export async function hashPassword(password) {
  const salt = await Node.Bcrypt.genSalt(10);
  return await Node.Bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hashedPassword) {
  return await Node.Bcrypt.compare(password, hashedPassword);
}

export const withSocketEmit = (req) => {
  req.emitToBoard = (boardId, event, data) => {
    if (Node.Socket) {
      Node.Socket.to(`board:${boardId}`).emit(event, data);
    }
  };
};
