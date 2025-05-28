import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(403).json({ message: "Acceso denegado, token requerido" });
  }

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}
