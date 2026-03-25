import { updateProfile } from '../actions'

export default function EditProfilePage() {
  return (
    <form action={updateProfile} className="flex flex-col gap-4">
      <input 
        name="fullName" 
        placeholder="새로운 이름" 
        className="border p-2"
        required 
      />
      <input 
        name="phoneNumber" 
        placeholder="새로운 전화번호" 
        className="border p-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2">
        개인정보 수정
      </button>
    </form>
  )
}
