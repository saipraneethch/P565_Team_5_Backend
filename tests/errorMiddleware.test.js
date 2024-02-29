import { ErrorMiddleware } from '../middleware/error';
import httpMocks from 'node-mocks-http';
import ErrorHandler from '../utils/errorHandler';

describe('ErrorMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
    });

    test('handles CastError for wrong MongoDB ID', () => {
        const err = { name: 'CastError', path: 'user' };
        ErrorMiddleware(err, req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({
            success: false,
            message: 'Resource not found. Invalid: user'
        });
    });

    test('handles duplicate key errors', () => {
        const err = { code: 11000, keyValue: { username: 'testuser' } };
        ErrorMiddleware(err, req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({
            success: false,
            message: 'Duplicate username entered'
        });
    });

    test('handles JsonWebTokenError', () => {
        const err = { name: 'JsonWebTokenError' };
        ErrorMiddleware(err, req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({
            success: false,
            message: 'Json web token is invalid. Try again'
        });
    });

    test('handles TokenExpiredError', () => {
        const err = { name: 'TokenExpiredError' };
        ErrorMiddleware(err, req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({
            success: false,
            message: 'Json web token is expired. Try again'
        });
    });
});
