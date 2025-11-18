import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import { userApi } from '../api'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<User | null>(null)
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '游客')
  
  // 方法
  const login = async (loginData: { username: string; password: string }) => {
    try {
      const res = await userApi.login(loginData)
      token.value = res.data.token
      userInfo.value = res.data.user as User
      localStorage.setItem('token', res.data.token)
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }
  
  const register = async (registerData: {
    username: string
    email: string
    password: string
  }) => {
    try {
      const res = await userApi.register(registerData)
      token.value = res.data.token
      userInfo.value = res.data.user as User
      localStorage.setItem('token', res.data.token)
      ElMessage.success('注册成功')
      return true
    } catch (error) {
      console.error('注册失败:', error)
      return false
    }
  }
  
  const logout = async () => {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      ElMessage.success('已退出登录')
    }
  }
  
  const getUserInfo = async () => {
    if (!token.value) return
    
    try {
      const res = await userApi.getInfo()
      userInfo.value = res.data as User
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // Token可能已过期，清除登录状态
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
    }
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    login,
    register,
    logout,
    getUserInfo
  }
})
