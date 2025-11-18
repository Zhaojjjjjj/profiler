// 用户类型
export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

// 问题类型
export interface Question {
  id: number
  category: string
  content: string
  order_num: number
  is_required: boolean
  created_at: string
}

// 答案类型
export interface Answer {
  id: number
  user_id?: number
  session_id: string
  question_id: number
  content: string
  created_at: string
}

// 人格画像类型
export interface Profile {
  id: number
  user_id?: number
  session_id: string
  ai_analysis: string
  structured_data: ProfileData
  created_at: string
}

// 结构化的画像数据
export interface ProfileData {
  personality_traits: string[]
  motivations: string[]
  values: string[]
  behavioral_tendencies: string[]
  summary: string
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
