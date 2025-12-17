import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase Admin 환경 변수가 설정되지 않았습니다.');
}

/**
 * 서버 사이드에서만 사용하는 Supabase Admin 클라이언트
 * RLS를 우회하여 모든 데이터에 접근 가능
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});


