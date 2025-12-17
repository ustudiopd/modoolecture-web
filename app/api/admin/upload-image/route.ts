import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/admin/upload-image
 * 이미지 업로드 (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 가능)' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 50MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 고유한 파일명 생성
    // 모두의특강(modu) 스키마용 경로 구조 사용
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    // 경로: modu/public/{filename} (모두의특강 질문보드 이미지)
    const filePath = `modu/public/${fileName}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabaseAdmin.storage
      .from('question-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('이미지 업로드 실패:', error);
      return NextResponse.json(
        { error: '이미지 업로드에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from('question-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}



