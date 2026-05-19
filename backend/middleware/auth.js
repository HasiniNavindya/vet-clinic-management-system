const jwt = require('jsonwebtoken');
const { normalizeRole } = require('../config/roles');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const canonicalRole = normalizeRole(decoded.role) || decoded.role;
    req.user = { ...decoded, role: canonicalRole };
    next();
  });
}

/** Restrict route to one or more roles (use canonical ids: user, admin, doctor, staff). */
function requireRole(...allowedRoles) {
  const allowed = allowedRoles
    .map((r) => normalizeRole(r))
    .filter(Boolean);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userRole = normalizeRole(req.user.role);
    if (!userRole || !allowed.includes(userRole)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole,
};
