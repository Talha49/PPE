import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

// Utility to extract companyId from request header or cookie
export async function getAuthContext(req) {
    const token = req.cookies.get('auth_token')?.value || req.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    return await verifyToken(token);
}
