import Node from "#Node";

export function generateToken(payload) {
  try {
    return Node.Jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
  } catch (error) {
    Node.App.HttpResponse.Response.errorResponse(error);
    throw new Error("Error generating token!");
  }
}

export function verifyToken(token) {
  try {
    const payload = Node.Jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return { status: 200, data: payload };
  } catch (error) {
    Node.App.HttpResponse.Response.errorResponse(error);
    return { status: 400, data: error };
  }
}


