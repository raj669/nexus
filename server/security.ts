import { createHash, createHmac, randomUUID, timingSafeEqual } from 'crypto';

const JWT_SECRET = process.env.LEARNING_OS_JWT_SECRET ?? 'nexus-learning-os-dev-secret';
const JWT_HEADER = { alg: 'HS256', typ: 'JWT' };
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

const toBase64Url = (value: Buffer) => value.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const fromBase64Url = (value: string) => Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

export const hashPassword = (value: string) => createHash('sha256').update(value).digest('hex');

export const signJwt = (payload: { sub: string; role: string }, ttlMs = TOKEN_TTL_MS) => {
  const iat = Date.now();
  const tokenPayload: JwtPayload = {
    ...payload,
    iat,
    exp: iat + ttlMs,
    jti: randomUUID(),
  };

  const encodedHeader = toBase64Url(Buffer.from(JSON.stringify(JWT_HEADER)));
  const encodedPayload = toBase64Url(Buffer.from(JSON.stringify(tokenPayload)));
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  return {
    token: `${encodedHeader}.${encodedPayload}.${toBase64Url(signature)}`,
    expiresAt: tokenPayload.exp,
    payload: tokenPayload,
  };
};

export const verifyJwt = (token: string): JwtPayload | null => {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const receivedSignature = fromBase64Url(encodedSignature);

  if (expectedSignature.length !== receivedSignature.length || !timingSafeEqual(expectedSignature, receivedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload).toString('utf8')) as JwtPayload;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

export const getJwtSecret = () => JWT_SECRET;
