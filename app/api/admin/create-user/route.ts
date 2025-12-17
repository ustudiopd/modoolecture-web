import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  // 환경 변수 확인
  const hasUrl = !!supabaseUrl;
  const hasKey = !!serviceRoleKey;
  const urlLength = supabaseUrl?.length || 0;
  const keyLength = serviceRoleKey?.length || 0;
  
  if (!hasUrl || !hasKey) {
    return NextResponse.json(
      { 
        error: '환경 변수가 설정되지 않았습니다.',
        debug: {
          hasUrl,
          hasKey,
          urlLength,
          keyLength,
        }
      },
      { status: 500 }
    );
  }

  // 서비스 롤 키 형식 확인 (선택적 - 일부 프로젝트는 다른 형식 사용 가능)
  // 주석 처리: 실제 API 호출 시 에러 확인
  // if (!serviceRoleKey.startsWith('eyJ')) {
  //   return NextResponse.json(
  //     { 
  //       error: 'Service Role Key 형식이 올바르지 않습니다.',
  //     },
  //     { status: 500 }
  //   );
  // }

  // 서비스 롤 키를 사용하여 Admin 클라이언트 생성
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호가 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자 생성
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 확인 자동 완료
      user_metadata: {
        role: 'admin',
      },
    });

    if (authError) {
      // 이미 존재하는 사용자인 경우
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        // 기존 사용자 조회
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          return NextResponse.json(
            { error: `사용자 조회 실패: ${listError.message}` },
            { status: 500 }
          );
        }

        const existingUser = existingUsers?.users.find(u => u.email === email);
        
        if (existingUser) {
          // 메타데이터 업데이트
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: { role: 'admin' },
            }
          );
          
          if (updateError) {
            return NextResponse.json(
              { error: `메타데이터 업데이트 실패: ${updateError.message}` },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: '기존 사용자의 메타데이터가 업데이트되었습니다.',
            user: {
              id: existingUser.id,
              email: existingUser.email,
              role: 'admin',
            },
          });
        }
      }

      return NextResponse.json(
        { error: `사용자 생성 실패: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '사용자 데이터가 반환되지 않았습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '어드민 계정이 성공적으로 생성되었습니다!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: authData.user.user_metadata?.role || 'admin',
      },
    });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: `예상치 못한 오류: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

