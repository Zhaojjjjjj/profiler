import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '../types'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 从sessionStorage获取session_id
    const sessionId = sessionStorage.getItem('session_id')
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    
    // 如果code不是200，则判断为错误
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      
      // 401 未授权
      if (res.code === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return response
  },
  (error) => {
    console.error('响应错误:', error)
    
    let message = '网络错误，请稍后重试'
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '登录已过期，请重新登录'
          localStorage.removeItem('token')
          break
        case 403:
          message = '没有权限访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 429:
          message = '请求过于频繁，请稍后再试'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = error.response.data?.message || message
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 导出封装的请求方法
export default {
  async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await service.get(url, { params, ...config })
    return response.data
  },
  
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await service.post(url, data, config)
    return response.data
  },
  
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await service.put(url, data, config)
    return response.data
  },
  
  async delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await service.delete(url, { params, ...config })
    return response.data
  }
}

export { service }
