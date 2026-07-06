'use strict';
const jwt = require('jsonwebtoken');

// Verifies the Supabase JWT sent as Authorization: Bearer <token>.
// Sets req.userId = decoded.sub (Supabase auth.users.id = user_id in profiles).
//
// In dev mode without SUPABASE_JWT_SECRET the token is decoded but not verified —
// this lets local development work without the secret configured.
function authSupabase() {
  return (req, res, next) => {
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = header.slice(7);
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'Server misconfiguration: SUPABASE_JWT_SECRET not set' });
      }
      // Dev-only fallback: decode without verification
      try {
        const decoded = jwt.decode(token);
        if (!decoded?.sub) return res.status(401).json({ error: 'Invalid token' });
        req.userId = decoded.sub;
        return next();
      } catch {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    try {
      const decoded = jwt.verify(token, secret);
      req.userId = decoded.sub;
      next();
    } catch {
      return res.status(401).json({ error: 'Expired or invalid token' });
    }
  };
}

module.exports = { authSupabase };
