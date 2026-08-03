import dotenv from 'dotenv';
dotenv.config();

const u = process.env.MONGODB_URI || '';
const redacted = u.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');

console.log('URI set:', Boolean(u));
console.log('Redacted:', redacted);
console.log('Starts with mongodb+srv:', u.startsWith('mongodb+srv://'));
console.log('Has quotes around value:', /^['"]/.test(u.trim()) || /['"]$/.test(u.trim()));

try {
  const normalized = u.replace(/^mongodb\+srv:/, 'https:').replace(/^mongodb:/, 'http:');
  const url = new URL(normalized);
  const user = decodeURIComponent(url.username);
  const pass = decodeURIComponent(url.password);
  console.log('User:', user);
  console.log('Host:', url.hostname);
  console.log('DB path:', url.pathname || '(missing)');
  console.log('Password length:', pass.length);
  console.log('Password contains @ # % : / ?', /[@#%:/?]/.test(pass));
  // Check if password appears unencoded in URI (common mistake)
  if (pass && u.includes(`:${pass}@`)) {
    console.log('WARNING: password appears literally unencoded in URI');
  }
} catch (e) {
  console.log('Parse error:', e.message);
}
