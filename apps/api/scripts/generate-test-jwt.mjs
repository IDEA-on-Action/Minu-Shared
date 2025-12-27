import * as jose from 'jose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const privateKeyPem = readFileSync(join(__dirname, '../../../keys/private.pem'), 'utf-8');

async function generateTestJwt() {
  const privateKey = await jose.importPKCS8(privateKeyPem, 'RS256');

  const payload = {
    sub: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    tenant_id: 'tenant-456',
    role: 'member',
  };

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setIssuer('ideaonaction.ai')
    .setExpirationTime('1h')
    .sign(privateKey);

  console.log(jwt);
}

generateTestJwt();
