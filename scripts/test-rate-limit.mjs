// Rate Limit 테스트 스크립트

const STAGING_URL = 'https://minu-api-staging.sinclair-account.workers.dev';
const AUTH_ENDPOINT = '/api/v1/auth/verify';
const PROTECTED_ENDPOINT = '/api/v1/users/me';

const JWT = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsInRlbmFudF9pZCI6InRlbmFudC00NTYiLCJyb2xlIjoibWVtYmVyIiwiaWF0IjoxNzY2ODU0NDU5LCJpc3MiOiJpZGVhb25hY3Rpb24uYWkiLCJleHAiOjE3NjY4NTgwNTl9.WT65lWpBMMK2u4BaOphXNZe2G__9jDpPJigVS8Auiaq8dV1dn9B8peTGJCa1zdBH2w_xJ9q4Oa8BTXtfB2-o4iwQxEmV4Or7B_qToY3dyMT38DrxX4XhkyZBMQcHXTK4P7HOO3JEuEAuorAAqqNlMSD0JTaO5Y6u_Z78Dmih6NmEqQ3bXnsk0DI-jHIVdimcXvSx2lsrGUqPxcLU1rm3_-Gz_LjwA7Lonq6-y2ZoP94PQfySAfBHaFFD-fDK3U_fdBdeSwfibKOmWfJDYCxK2Cz22H7TGwuZOS_4OWAkwauVRNPOgd4l8oFSYl4rWRMxPqlV_wA6tNbw1RFChGBWSA';

async function testRateLimit(endpoint, options, limit, description) {
  console.log(`\n=== ${description} (${limit}회/분 제한) ===`);

  let rateLimitHit = false;
  let successCount = 0;
  let rateLimitCount = 0;

  const requests = limit + 10; // 제한보다 10개 더 요청

  for (let i = 1; i <= requests; i++) {
    try {
      const response = await fetch(`${STAGING_URL}${endpoint}`, options);
      const status = response.status;

      if (status === 429) {
        rateLimitCount++;
        if (!rateLimitHit) {
          rateLimitHit = true;
          const body = await response.json();
          console.log(`요청 ${i}: HTTP 429 - Rate limit 도달!`);
          console.log(`  응답: ${JSON.stringify(body)}`);
          console.log(`  헤더: X-RateLimit-Remaining = ${response.headers.get('X-RateLimit-Remaining')}`);
          console.log(`  헤더: X-RateLimit-Reset = ${response.headers.get('X-RateLimit-Reset')}`);
        }
      } else {
        successCount++;
        if (i <= 3 || i === limit || i === limit + 1) {
          console.log(`요청 ${i}: HTTP ${status}`);
        } else if (i === 4) {
          console.log('...');
        }
      }
    } catch (error) {
      console.log(`요청 ${i}: 에러 - ${error.message}`);
    }
  }

  console.log(`\n결과: 성공 ${successCount}회, Rate Limit ${rateLimitCount}회`);
  return { successCount, rateLimitCount, rateLimitHit };
}

async function main() {
  console.log('Rate Limit 테스트 시작\n');
  console.log('==========================================');

  // 1. Auth 엔드포인트 테스트 (20회/분)
  const authResult = await testRateLimit(
    AUTH_ENDPOINT,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'test.jwt.token' }),
    },
    20,
    'Auth 엔드포인트 (/api/v1/auth/verify)'
  );

  // 잠시 대기
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. 보호된 엔드포인트 테스트 (100회/분) - 일부만 테스트
  console.log('\n==========================================');
  const protectedResult = await testRateLimit(
    PROTECTED_ENDPOINT,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${JWT}` },
    },
    100,
    '보호된 엔드포인트 (/api/v1/users/me)'
  );

  console.log('\n==========================================');
  console.log('테스트 완료!');
  console.log(`Auth 엔드포인트: ${authResult.rateLimitHit ? '✅ Rate limit 정상 작동' : '❌ Rate limit 미작동'}`);
  console.log(`보호된 엔드포인트: ${protectedResult.rateLimitHit ? '✅ Rate limit 정상 작동' : '❌ Rate limit 미작동'}`);
}

main().catch(console.error);
