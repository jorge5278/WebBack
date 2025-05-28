// src/test/authMiddleware.test.js
import { authenticateToken } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

describe('authenticateToken middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { header: jest.fn() };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'testsecret';
  });

  it('debe responder 403 si no se proporciona token', () => {
    req.header.mockReturnValue(undefined);
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Acceso denegado, token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe responder 401 si el token es inválido', () => {
    req.header.mockReturnValue('Bearer tokenErróneo');
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar next y poblar req.user si el token es válido', () => {
    const payload = { id: 42, email: 'user@test.com' };
    const validToken = jwt.sign(payload, process.env.JWT_SECRET);
    req.header.mockReturnValue(`Bearer ${validToken}`);
    authenticateToken(req, res, next);
    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalled();
  });
});
