-- Storage 버킷 생성 및 정책 설정
-- 모두의특강(modu) 질문 및 답변에 첨부되는 이미지 저장용

-- Storage 버킷 생성 (이미 존재하면 무시)
-- 버킷은 비공개로 설정하되, RLS 정책으로 공개 읽기 허용
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  false, -- 버킷 자체는 비공개 (RLS 정책으로 읽기 제어)
  52428800, -- 50MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = false; -- 기존 버킷이 있으면 비공개로 변경

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "modu_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "modu_public_read" ON storage.objects;
DROP POLICY IF EXISTS "modu_authenticated_delete" ON storage.objects;

-- 모두의특강(modu) 스키마용 정책
-- 인증된 사용자만 업로드 가능 (Admin)
-- 경로 구조: modu/public/{filename} 또는 modu/events/{event_id}/{filename}
CREATE POLICY "modu_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-images' AND
  (
    (storage.foldername(name))[1] = 'modu' AND
    (
      (storage.foldername(name))[2] = 'public' OR
      (storage.foldername(name))[2] = 'events'
    )
  )
);

-- 모든 사용자가 읽기 가능 (비공개 버킷이지만 정책으로 공개 읽기 허용)
-- modu 스키마 하위의 모든 이미지에 대해 공개 읽기 허용
CREATE POLICY "modu_public_read"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'question-images' AND
  (storage.foldername(name))[1] = 'modu'
);

-- 인증된 사용자가 자신이 업로드한 이미지 삭제 가능
-- 또는 modu 관련 이미지인 경우 삭제 가능
CREATE POLICY "modu_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-images' AND
  (storage.foldername(name))[1] = 'modu'
);

-- 기존 정책도 유지 (하위 호환성)
-- 인증된 사용자만 업로드 가능 (Admin)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-images' AND
  (
    (storage.foldername(name))[1] = 'public' OR
    (storage.foldername(name))[1] = 'modu'
  )
);

-- 모든 사용자가 읽기 가능 (비공개 버킷이지만 정책으로 공개 읽기 허용)
CREATE POLICY "Public can read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'question-images');

-- 인증된 사용자가 자신이 업로드한 이미지 삭제 가능
CREATE POLICY "Authenticated users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-images' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    (storage.foldername(name))[1] = 'modu'
  )
);

