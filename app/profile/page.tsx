import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const statusMap = {
  PENDING: { label: '승인 대기 중', color: 'text-yellow-600' },
  APPROVED: { label: '승인 완료', color: 'text-green-600' },
  REJECTED: { label: '승인 거절됨', color: 'text-red-600' },
  SUSPENDED: { label: '사용 중지됨', color: 'text-gray-600' },
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // 1. 현재 로그인한 사용자 정보 가져오기
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login') // 비로그인 유저는 로그인 페이지로
  }

  // 2. profiles 테이블 조회 (RLS가 자동 적용됨)
  // 이전 단계에서 만든 클라이언트는 유저의 쿠키(세션)를 포함하므로
  // RLS 정책 (auth.uid() = id) 을 통과하여 본인 데이터만 가져옵니다.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return <div>프로필을 불러오는 데 실패했습니다.</div>
  }

  const status = statusMap[profile.approval_status as keyof typeof statusMap]

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 프로필 정보</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-4 border">
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-500">계정 상태</span>
          <span className={`font-bold ${status.color}`}>{status.label}</span>
        </div>
        {profile.approval_status === 'REJECTED' && (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
            <strong>거절 사유:</strong> {profile.rejection_reason || '사유가 입력되지 않았습니다.'}
          </div>
        )}
        <p><strong>이름:</strong> {profile.name}</p>
        <p><strong>이메일:</strong> {profile.email}</p>
        <p><strong>소속 조직:</strong> {profile.organization_code}</p>
        <p><strong>담당 업무:</strong> {profile.task}</p>
      </div>
    </main>
  )
}
