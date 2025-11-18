<template>
  <div class="summary-page">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h1 class="logo" @click="goHome">Personality Profiler</h1>
          <div class="nav-menu">
            <el-button text @click="goHome">
              <el-icon><HomeFilled /></el-icon>
              首页
            </el-button>
            <el-button text @click="startNewTest">
              <el-icon><RefreshRight /></el-icon>
              重新测试
            </el-button>
            <el-button text @click="goToHistory">
              <el-icon><Clock /></el-icon>
              历史记录
            </el-button>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>
        
        <div v-else-if="profile" class="profile-container">
          <!-- 主标题 -->
          <div class="profile-header">
            <h2 class="profile-title">你的人格画像</h2>
            <p class="profile-date">
              生成时间：{{ formatDate(profile.created_at) }}
            </p>
          </div>
          
          <!-- 总结卡片 -->
          <el-card class="summary-card">
            <template #header>
              <div class="card-header">
                <el-icon :size="24" color="#409eff"><Document /></el-icon>
                <span>画像总结</span>
              </div>
            </template>
            <div class="summary-content">
              {{ profile.structured_data.summary }}
            </div>
          </el-card>
          
          <!-- 详细分析 -->
          <el-row :gutter="20">
            <!-- 性格特质 -->
            <el-col :xs="24" :sm="12">
              <el-card class="trait-card">
                <template #header>
                  <div class="card-header">
                    <el-icon :size="20" color="#67c23a"><User /></el-icon>
                    <span>性格特质</span>
                  </div>
                </template>
                <div class="trait-list">
                  <el-tag
                    v-for="trait in profile.structured_data.personality_traits"
                    :key="trait"
                    class="trait-tag"
                    type="success"
                    effect="plain"
                  >
                    {{ trait }}
                  </el-tag>
                </div>
              </el-card>
            </el-col>
            
            <!-- 核心价值观 -->
            <el-col :xs="24" :sm="12">
              <el-card class="trait-card">
                <template #header>
                  <div class="card-header">
                    <el-icon :size="20" color="#e6a23c"><Star /></el-icon>
                    <span>核心价值观</span>
                  </div>
                </template>
                <div class="trait-list">
                  <el-tag
                    v-for="value in profile.structured_data.values"
                    :key="value"
                    class="trait-tag"
                    type="warning"
                    effect="plain"
                  >
                    {{ value }}
                  </el-tag>
                </div>
              </el-card>
            </el-col>
            
            <!-- 内在动机 -->
            <el-col :xs="24" :sm="12">
              <el-card class="trait-card">
                <template #header>
                  <div class="card-header">
                    <el-icon :size="20" color="#f56c6c"><Aim /></el-icon>
                    <span>内在动机</span>
                  </div>
                </template>
                <div class="trait-list">
                  <el-tag
                    v-for="motivation in profile.structured_data.motivations"
                    :key="motivation"
                    class="trait-tag"
                    type="danger"
                    effect="plain"
                  >
                    {{ motivation }}
                  </el-tag>
                </div>
              </el-card>
            </el-col>
            
            <!-- 行为倾向 -->
            <el-col :xs="24" :sm="12">
              <el-card class="trait-card">
                <template #header>
                  <div class="card-header">
                    <el-icon :size="20" color="#909399"><TrendCharts /></el-icon>
                    <span>行为倾向</span>
                  </div>
                </template>
                <div class="trait-list">
                  <el-tag
                    v-for="tendency in profile.structured_data.behavioral_tendencies"
                    :key="tendency"
                    class="trait-tag"
                    type="info"
                    effect="plain"
                  >
                    {{ tendency }}
                  </el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <!-- 完整分析报告 -->
          <el-card class="analysis-card">
            <template #header>
              <div class="card-header">
                <el-icon :size="24" color="#409eff"><Reading /></el-icon>
                <span>完整分析报告</span>
              </div>
            </template>
            <div class="analysis-content" v-html="formatAnalysis(profile.ai_analysis)">
            </div>
          </el-card>
          
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="downloadReport">
              <el-icon><Download /></el-icon>
              下载报告
            </el-button>
            <el-button @click="shareReport">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
            <el-button @click="startNewTest">
              <el-icon><RefreshRight /></el-icon>
              重新测试
            </el-button>
          </div>
        </div>
        
        <div v-else class="error-container">
          <el-empty description="画像不存在或加载失败">
            <el-button type="primary" @click="goHome">返回首页</el-button>
          </el-empty>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  RefreshRight,
  Clock,
  Document,
  User,
  Star,
  Aim,
  TrendCharts,
  Reading,
  Download,
  Share
} from '@element-plus/icons-vue'
import { profileApi } from '../api'
import type { Profile } from '../types'
import { useQuestionStore } from '../stores/question'

const router = useRouter()
const route = useRoute()
const questionStore = useQuestionStore()

const profile = ref<Profile | null>(null)
const loading = ref(true)

// 加载画像
const loadProfile = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    if (!id) {
      throw new Error('无效的画像ID')
    }
    
    const res = await profileApi.getById(id)
    profile.value = res.data
  } catch (error) {
    console.error('加载画像失败:', error)
    ElMessage.error('加载画像失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化分析内容
const formatAnalysis = (analysis: string) => {
  // 将换行转换为段落
  return analysis
    .split('\n\n')
    .map(para => `<p>${para}</p>`)
    .join('')
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 查看历史
const goToHistory = () => {
  router.push('/history')
}

// 开始新测试
const startNewTest = async () => {
  questionStore.initSession()
  await questionStore.loadQuestions()
  router.push('/question')
}

// 下载报告
const downloadReport = () => {
  if (!profile.value) return
  
  // 生成报告文本
  const reportText = `
人格画像报告
================

生成时间：${formatDate(profile.value.created_at)}

画像总结
--------
${profile.value.structured_data.summary}

性格特质
--------
${profile.value.structured_data.personality_traits.join('、')}

核心价值观
----------
${profile.value.structured_data.values.join('、')}

内在动机
--------
${profile.value.structured_data.motivations.join('、')}

行为倾向
--------
${profile.value.structured_data.behavioral_tendencies.join('、')}

完整分析
--------
${profile.value.ai_analysis}
`
  
  // 创建下载链接
  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `人格画像报告_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('报告已下载')
}

// 分享报告
const shareReport = () => {
  if (!profile.value) return
  
  const url = window.location.href
  
  // 尝试使用 Web Share API
  if (navigator.share) {
    navigator.share({
      title: '我的人格画像',
      text: profile.value.structured_data.summary,
      url: url
    }).catch(() => {
      // 用户取消分享
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.summary-page {
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
  cursor: pointer;
  transition: opacity 0.3s;
}

.logo:hover {
  opacity: 0.8;
}

.nav-menu {
  display: flex;
  gap: 10px;
}

.nav-menu .el-button {
  color: white;
}

.loading-container,
.error-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 40px;
  background: white;
  border-radius: 10px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease;
}

.profile-title {
  font-size: 36px;
  color: white;
  margin-bottom: 10px;
}

.profile-date {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.summary-card {
  margin-bottom: 30px;
  animation: fadeInUp 0.8s ease;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.summary-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.trait-card {
  margin-bottom: 20px;
  animation: fadeInUp 1s ease;
}

.trait-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.trait-tag {
  font-size: 14px;
}

.analysis-card {
  margin: 30px 0;
  animation: fadeInUp 1.2s ease;
}

.analysis-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

.analysis-content p {
  margin-bottom: 15px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 40px 0;
  animation: fadeInUp 1.4s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .profile-title {
    font-size: 28px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>
