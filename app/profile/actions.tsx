'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  // 1. 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 2. 클라이언트에서 넘어온 데이터 추출
  const newFullName = formData.get('fullName') as string
  const newPhoneNumber = formData.get('phoneNumber') as string

  // 3. 데이터 업데이트 (RLS 적용됨)
  // 악의적인 유저가 다른 사람의 id로 조작해서 요청하더라도 
  // RLS (update 정책: auth.uid() = id) 에 의해 업데이트가 거부됩니다.
  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: newFullName,
      phone_number: newPhoneNumber 
    })
    .eq('id', user.id)

  if (error) {
    console.error('업데이트 실패:', error)
    throw new Error('프로필 업데이트에 실패했습니다.')
  }

  // 4. 캐시 무효화로 업데이트된 데이터를 화면에 반영
  revalidatePath('/profile')
}
