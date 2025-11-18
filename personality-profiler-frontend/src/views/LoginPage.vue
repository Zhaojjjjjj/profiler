<template>
  <div class="login-page">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h1 class="logo" @click="goHome">Personality Profiler</h1>
        </div>
      </el-header>
      
      <el-main>
        <div class="login-container">
          <el-card class="login-card">
            <div class="login-header">
              <h2>{{ isRegister ? '注册账号' : '登录账号' }}</h2>
              <p>{{ isRegister ? '创建新账号以保存你的画像记录' : '登录后可查看历史画像记录' }}</p>
            </div>
            
            <el-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-position="top"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="formData.username"
                  placeholder="请输入用户名"
                  prefix-icon="User"
                />
              </el-form-item>
              
              <el-form-item v-if="isRegister" label="邮箱" prop="email">
                <el-input
                  v-model="formData.email"
                  placeholder="请输入邮箱"
                  prefix-icon="Message"
                />
              </el-form-item>
              
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="formData.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              
              <el-form-item v-if="isRegister" label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="formData.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              
              <el-form-item>
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="handleSubmit"
                  style="width: 100%"
                >
                  {{ isRegister ? '注册' : '登录' }}
                </el-button>
              </el-form-item>
              
              <div class="form-footer">
                <span>{{ isRegister ? '已有账号？' : '还没有账号？' }}</span>
                <el-button type="primary" link @click="toggleMode">
                  {{ isRegister ? '去登录' : '去注册' }}
                </el-button>
              </div>
              
              <el-divider>或</el-divider>
              
              <el-button @click="skipLogin" style="width: 100%">
                跳过登录（游客模式）
              </el-button>
            </el-form>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const isRegister = ref(false)
const loading = ref(false)

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== formData.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      let success = false
      
      if (isRegister.value) {
        success = await userStore.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      } else {
        success = await userStore.login({
          username: formData.username,
          password: formData.password
        })
      }
      
      if (success) {
        router.push('/')
      }
    } finally {
      loading.value = false
    }
  })
}

// 切换登录/注册模式
const toggleMode = () => {
  isRegister.value = !isRegister.value
  formRef.value?.resetFields()
}

// 跳过登录
const skipLogin = () => {
  ElMessage.info('以游客身份使用，画像记录仅保存在本地')
  router.push('/')
}

// 返回首页
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo {
  color: white;
  font-size: 24px;
  margin: 0;
  cursor: pointer;
  transition: opacity 0.3s;
}

.logo:hover {
  opacity: 0.8;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 40px 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  animation: fadeInUp 0.8s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
