// 빠른 Rate Limit 테스트 (병렬 요청)

const STAGING_URL = 'https://minu-api-staging.sinclair-account.workers.dev';
const ENDPOINT = '/api/v1/users/me';

const JWT = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsInRlbmFudF9pZCI6InRlbmFudC00NTYiLCJyb2xlIjoibWVtYmVyIiwiaWF0IjoxNzY2ODU0NDU5LCJpc3MiOiJpZGVhb25hY3Rpb24uYWkiLCJleHAiOjE3NjY4NTgwNTl9.WT65lWpBMMK2u4BaOphXNZe2G__9jDpPJigVS8Auiaq8dV1dn9B8peTGJCa1zdBH2w_xJ9q4Oa8BTXtfB2-o4iwQxEmV4Or7B_qToY3dyMT38DrxX4XhkyZBMQcHXTK4P7HOO3JEuEAuorAAqqNlMSD0JTaO5Y6u_Z78Dmih6NmEqQ3bXnsk0DI-jHIVdimcXvSx2lsrGUqPxcLU1rm3_-Gz_LjwA7Lonq6-y2ZoP94PQfySAfBHaFFD-fDK3U_fdBdeSwfibKOmWfJDYCxK2Cz22H7TGwuZOS_4OWAkwauVRNPOgd4l8oFSYl4rWRMxPqlV_wA6tNbw1RFChGBWSA';

async function makeRequest(i) {
  const response = await fetch(`${STAGING_URL}${ENDPOINT}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${JWT}` },
  });
  return {
    index: i,
    status: response.status,
    remaining: response.headers.get('X-RateLimit-Remaining'),
    limit: response.headers.get('X-RateLimit-Limit'),
  };
}

async function main() {
  console.log('=== 병렬 Rate Limit 테스트 (120개 요청 동시 발송) ===\n');

  const startTime = Date.now();

  // 120개 요청을 동시에 발송
  const promises = [];
  for (let i = 1; i <= 120; i++) {
    promises.push(makeRequest(i));
  }

  const results = await Promise.all(promises);
  const elapsed = Date.now() - startTime;

  // 결과 분석
  const successCount = results.filter(r => r.status === 200).length;
  const rateLimitCount = results.filter(r => r.status === 429).length;
  const otherCount = results.filter(r => r.status !== 200 && r.status !== 429).length;

  console.log(`완료 시간: ${elapsed}ms`);
  console.log(`\n결과:`);
  console.log(`  - 성공 (200): ${successCount}회`);
  console.log(`  - Rate Limit (429): ${rateLimitCount}회`);
  console.log(`  - 기타: ${otherCount}회`);

  // 429 응답 샘플 출력
  const rateLimited = results.filter(r => r.status === 429);
  if (rateLimited.length > 0) {
    console.log(`\n✅ Rate limit 작동 확인!`);
    console.log(`첫 번째 429 응답: 요청 #${rateLimited[0].index}`);
  } else {
    console.log(`\n⚠️ Rate limit이 작동하지 않음`);
    // Remaining 헤더 샘플 출력
    console.log('\nX-RateLimit-Remaining 헤더 샘플:');
    results.slice(0, 5).forEach(r => {
      console.log(`  요청 #${r.index}: ${r.remaining}`);
    });
    results.slice(-5).forEach(r => {
      console.log(`  요청 #${r.index}: ${r.remaining}`);
    });
  }
}

main().catch(console.error);
