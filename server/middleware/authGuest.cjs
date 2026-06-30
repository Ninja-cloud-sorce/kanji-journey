const jwt = require('jsonwebtoken');
const { GUEST_COOKIE_NAME, GUEST_JWT_SECRET } = require('../auth/guest.route.cjs');

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length);
}

/**
 * authGuest middleware:
 * - validates guest/user JWT from cookie or Authorization header
 * - blocks write methods for role=guest
 * - allows read browsing for guests
 */
function authGuest() {
  return (req, res, next) => {
    const token = req.cookies?.[GUEST_COOKIE_NAME] || extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const claims = jwt.verify(token, GUEST_JWT_SECRET);
      req.auth = claims;

      if (claims.role === 'guest' && WRITE_METHODS.has(req.method)) {
        return res.status(403).json({
          message: 'Guest accounts are read-only',
          code: 'guest_read_only',
        });
      }

      return next();
    } catch (_err) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }
  };
}

module.exports = { authGuest };
