const bcrypt = require('bcryptjs');

// Read fallback settings from env
const ENABLE_FALLBACK = process.env.FALLBACK_AUTH === '1' || false;
const FALLBACK_EMAIL = process.env.FALLBACK_USER_EMAIL || 'flr2188098@gmail.com';
const FALLBACK_USERNAME = process.env.FALLBACK_USER_USERNAME || 'flr2188098';
const FALLBACK_PLAINTEXT = process.env.FALLBACK_USER_PASSWORD || '123123';

let seededUser = null;

if (ENABLE_FALLBACK) {
  // Seed a fallback user (hashed password) to be used when DB is unreachable
  const hashed = bcrypt.hashSync(FALLBACK_PLAINTEXT, 10);
  seededUser = {
    id: 0,
    email: FALLBACK_EMAIL,
    username: FALLBACK_USERNAME,
    password: hashed,
    role: 'user'
  };
  console.log('Fallback auth enabled. Fallback user:', FALLBACK_EMAIL);
} else {
  console.log('Fallback auth disabled. To enable, set FALLBACK_AUTH=1 and provide FALLBACK_USER_* env vars.');
}

async function attemptFallbackLogin(identifier, password) {
  if (!ENABLE_FALLBACK || !seededUser) return null;
  const idMatch = (identifier === seededUser.email || identifier === seededUser.username);
  if (!idMatch) return null;
  const ok = await bcrypt.compare(password, seededUser.password);
  if (!ok) return null;
  // return a copy without password
  const { password: _, ...user } = seededUser;
  return user;
}

module.exports = { attemptFallbackLogin, ENABLE_FALLBACK };
