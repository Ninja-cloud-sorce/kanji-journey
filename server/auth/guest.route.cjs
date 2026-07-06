const crypto = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const GUEST_JWT_SECRET = process.env.GUEST_JWT_SECRET ||
  (process.env.NODE_ENV !== 'production' ? 'dev-only-insecure-secret' : null);
if (!GUEST_JWT_SECRET) {
  throw new Error('GUEST_JWT_SECRET must be set in production');
}
const GUEST_COOKIE_NAME = 'guest_session';

function buildGuestUser() {
  return {
    id: `guest_${crypto.randomBytes(8).toString('hex')}`,
    role: 'guest',
    permissions: ['read'],
  };
}

router.post('/auth/guest', (req, res) => {
  const guestUser = buildGuestUser();
  const expiresIn = '8h';
  const token = jwt.sign(guestUser, GUEST_JWT_SECRET, { expiresIn });
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : undefined;

  // Session cookie: no maxAge/expires => browser-session cookie.
  res.cookie(GUEST_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return res.status(201).json({
    token,
    expiresAt,
    user: guestUser,
  });
});

router.post('/auth/guest/logout', (req, res) => {
  res.clearCookie(GUEST_COOKIE_NAME, { path: '/' });
  return res.status(204).send();
});

module.exports = {
  guestAuthRouter: router,
  GUEST_COOKIE_NAME,
  GUEST_JWT_SECRET,
};
