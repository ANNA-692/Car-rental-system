import { body } from 'express-validator';

export const authValidation = {
  register: [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
  ],
  login: [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  refreshToken: [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  logout: [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  changePassword: [
    body('oldPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  forgotPassword: [
    body('email').isEmail().withMessage('Invalid email address'),
  ],
  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
};
