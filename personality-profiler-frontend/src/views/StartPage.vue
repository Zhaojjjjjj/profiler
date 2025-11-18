<template>
  <div class="start-page">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h1 class="logo">Personality Profiler</h1>
          <div class="nav-menu">
            <el-button v-if="!userStore.isLoggedIn" text @click="goToLogin">
              登录
            </el-button>
            <el-button v-if="userStore.isLoggedIn" text @click="handleLogout">
              退出
            </el-button>
            <el-button text @click="goToHistory">
              历史记录
            </el-button>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <div class="hero-section">
          <div class="hero-content">
            <h2 class="hero-title">探索你的人格画像</h2>
            <p class="hero-subtitle">
              通过深度问答，AI 将为你生成独特的人格分析报告
            </p>
            <p class="hero-description">
              回答一系列精心设计的问题，我们的 AI 系统将分析你的回答，
              生成包含性格特质、价值观、动机和行为倾向的完整人格画像。
            </p>
            
            <div class="features">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="8">
                  <div class="feature-card">
                    <el-icon :size="40" color="#409eff">
                      <QuestionFilled />
                    </el-icon>
                    <h3>深度问题</h3>
                    <p>精心设计的问题集，探索内心深处</p>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="8">
                  <div class="feature-card">
                    <el-icon :size="40" color="#67c23a">
                      <TrendCharts />
                    </el-icon>
                    <h3>AI 分析</h3>
                    <p>先进的 AI 技术，生成专业分析报告</p>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="8">
                  <div class="feature-card">
                    <el-icon :size="40" color="#e6a23c">
                      <User />
                    </el-icon>
                    <h3>个性画像</h3>
                    <p>全面了解自己的性格特质和行为模式</p>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large"
                :loading="loading"
                @click="startTest"
              >
                开始测试
              </el-button>
              <el-button 
                v-if="userStore.isLoggedIn"
                size="large"
                @click="goToHistory"
              >
                查看历史
              </el-button>
            </div>
            
            <div class="info-text">
              <p>
                <el-icon><InfoFilled /></el-icon>
                测试大约需要 15-20 分钟，请确保有充足的时间完成
              </p>
            </div>
          </div>
        </div>
        
        <!-- 最近的画像记录 -->
        <div v-if="recentProfiles.length > 0" class="recent-profiles">
          <h3>最近的画像</h3>
          <el-row :gutter="20">
            <el-col 
              v-for="profile in recentProfiles" 
              :key="profile.id"
              :xs="24" 
              :sm="12" 
              :md="8"
            >
              <el-card class="profile-card" @click="viewProfile(profile.id)">
                <div class="profile-summary">
                  <h4>{{ profile.structured_data.summary }}</h4>
                  <p class="profile-date">
                    {{ formatDate(profile.created_at) }}
                  </p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  QuestionFilled, 
  TrendCharts, 
  User, 
  InfoFilled 
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useQuestionStore } from '../stores/question'
import { profileApi } from '../api'
import type { Profile } from '../types'

const router = useRouter()
const userStore = useUserStore()
const questionStore = useQuestionStore()

const loading = ref(false)
const recentProfiles = ref<Profile[]>([])

// 开始测试
const startTest = async () => {
  loading.value = true
  
  try {
    // 初始化会话
    questionStore.initSession()
    
    // 加载问题
    const success = await questionStore.loadQuestions()
    
    if (success) {
      router.push('/question')
    } else {
      ElMessage.error('加载问题失败，请重试')
    }
  } catch (error) {
    console.error('开始测试失败:', error)
    ElMessage.error('系统错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 查看历史
const goToHistory = () => {
  router.push('/history')
}

// 去登录
const goToLogin = () => {
  router.push('/login')
}

// 退出登录
const handleLogout = async () => {
  await userStore.logout()
  router.push('/')
}

// 查看画像
const viewProfile = (id: number) => {
  router.push(`/summary/${id}`)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 加载最近的画像
const loadRecentProfiles = async () => {
  try {
    const res = await profileApi.getRecent(3)
    recentProfiles.value = res.data
  } catch (error) {
    console.error('加载最近画像失败:', error)
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadRecentProfiles()
  }
})
</script>

<style scoped>
.start-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
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
}

.nav-menu {
  display: flex;
  gap: 10px;
}

.nav-menu .el-button {
  color: white;
}

.hero-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
}

.hero-content {
  max-width: 1200px;
  text-align: center;
}

.hero-title {
  font-size: 48px;
  color: white;
  margin-bottom: 20px;
  animation: fadeInUp 0.8s ease;
}

.hero-subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  animation: fadeInUp 1s ease;
}

.hero-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 1.2s ease;
}

.features {
  margin-bottom: 40px;
  animation: fadeInUp 1.4s ease;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-card h3 {
  margin: 15px 0 10px;
  color: #333;
  font-size: 20px;
}

.feature-card p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.action-buttons {
  margin-bottom: 30px;
  animation: fadeInUp 1.6s ease;
}

.action-buttons .el-button {
  margin: 0 10px;
}

.info-text {
  animation: fadeInUp 1.8s ease;
}

.info-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.recent-profiles {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.recent-profiles h3 {
  color: white;
  font-size: 28px;
  margin-bottom: 30px;
  text-align: center;
}

.profile-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 20px;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.profile-summary h4 {
  color: #333;
  margin-bottom: 10px;
  font-size: 16px;
  line-height: 1.4;
}

.profile-date {
  color: #999;
  font-size: 12px;
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

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 20px;
  }
  
  .hero-description {
    font-size: 16px;
  }
}
</style>
