import request from '../utils/request'
import type { Question, Answer, Profile } from '../types'

// 问题相关API
export const questionApi = {
  // 获取问题列表
  getList: () => request.get<Question[]>('/questions/list'),
  
  // 获取单个问题
  getById: (id: number) => request.get<Question>(`/questions/${id}`)
}

// 答案相关API
export const answerApi = {
  // 保存答案
  save: (data: {
    session_id: string
    question_id: number
    content: string
  }) => request.post<Answer>('/answer/save', data),
  
  // 批量保存答案
  saveBatch: (data: {
    session_id: string
    answers: Array<{
      question_id: number
      content: string
    }>
  }) => request.post<Answer[]>('/answer/save-batch', data),
  
  // 获取会话的所有答案
  getBySession: (sessionId: string) => 
    request.get<Answer[]>('/answer/session', { session_id: sessionId })
}

// 人格画像相关API
export const profileApi = {
  // 生成人格画像
  generate: (data: {
    session_id: string
    answers: Array<{
      question_id: number
      question: string
      answer: string
    }>
  }) => request.post<Profile>('/profile/generate', data),
  
  // 获取画像详情
  getById: (id: number) => request.get<Profile>(`/profile/${id}`),
  
  // 获取画像列表
  getList: (params?: {
    page?: number
    page_size?: number
    user_id?: number
  }) => request.get<{
    list: Profile[]
    total: number
    page: number
    page_size: number
  }>('/profile/list', params),
  
  // 获取最近的画像
  getRecent: (limit: number = 5) => 
    request.get<Profile[]>('/profile/recent', { limit })
}

// 用户相关API
export const userApi = {
  // 登录
  login: (data: {
    username: string
    password: string
  }) => request.post<{
    token: string
    user: {
      id: number
      username: string
      email: string
    }
  }>('/user/login', data),
  
  // 注册
  register: (data: {
    username: string
    email: string
    password: string
  }) => request.post<{
    token: string
    user: {
      id: number
      username: string
      email: string
    }
  }>('/user/register', data),
  
  // 获取当前用户信息
  getInfo: () => request.get<{
    id: number
    username: string
    email: string
    created_at: string
  }>('/user/info'),
  
  // 退出登录
  logout: () => request.post('/user/logout')
}
