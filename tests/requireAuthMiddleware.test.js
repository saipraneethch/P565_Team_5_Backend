import { requireAuth } from '../middleware/requireAuth'; 
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model';
import httpMocks from 'node-mocks-http';
import dotenv from 'dotenv';

dotenv.config();

jest.mock('jsonwebtoken');
jest.mock('../models/user.model.js');

describe('requireAuth Middleware', () => {
  let req, res, next;
  const userId = 'someUserId';
  const token = 'Bearer validToken';
  const secret = process.env.SECRET;

  beforeEach(() => {
    req = httpMocks.createRequest({
      headers: {
        authorization: token,
      },
    });
    res = httpMocks.createResponse();
    next = jest.fn();
    jwt.verify.mockClear();
    userModel.findOne.mockClear();
  });

  it('should return 401 if no authorization header is present', async () => {
    req.headers.authorization = '';

    await requireAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: 'Authorization token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token verification fails', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Token verification failed');
    });

    await requireAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: 'Request is not authorized' });
    expect(next).not.toHaveBeenCalled();
  });
});
