<template>
  <div class="question-page">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h1 class="logo" @click="goHome">Personality Profiler</h1>
          <div class="progress-info">
            问题 {{ questionStore.currentQuestionIndex + 1 }} / {{ questionStore.totalQuestions }}
          </div>
        </div>
      </el-header>
      
      <el-main>
        <div class="question-container">
          <!-- 进度条 -->
          <div class="progress-section">
            <el-progress
              :percentage="questionStore.progress"
              :stroke-width="10"
              color="#667eea"
            />
          </div>
          
          <!-- 问题卡片 -->
          <el-card v-if="questionStore.currentQuestion" class="question-card">
            <div class="question-content">
              <div class="question-category">
                <el-tag type="info">
                  {{ questionStore.currentQuestion.category }}
                </el-tag>
                <el-tag v-if="questionStore.currentQuestion.is_required" type="danger">
                  必答
                </el-tag>
              </div>
              
              <h2 class="question-text">
                {{ questionStore.currentQuestion.content }}
              </h2>
              
              <div class="answer-section">
                <el-input
                  v-model="currentAnswer"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入你的回答..."
                  maxlength="1000"
                  show-word-limit
                />
              </div>
              
              <div class="tips">
                <el-alert
                  title="回答建议"
                  type="info"
                  :closable="false"
                >
                  请真实、详细地回答问题。你的回答将帮助 AI 更准确地分析你的人格特质。
                </el-alert>
              </div>
            </div>
          </el-card>
          
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              :disabled="questionStore.currentQuestionIndex === 0"
              @click="handlePrevious"
            >
              上一题
            </el-button>
            
            <el-button
              v-if="!questionStore.isLastQuestion"
              type="primary"
              @click="handleNext"
            >
              下一题
            </el-button>
            
            <el-button
              v-else
              type="success"
              :loading="generating"
              @click="handleSubmit"
            >
              生成画像
            </el-button>
            
            <el-button
              @click="handleSave"
            >
              保存进度
            </el-button>
          </div>
          
          <!-- 问题导航 -->
          <div class="question-nav">
            <h3>问题导航</h3>
            <div class="nav-grid">
              <el-button
                v-for="(question, index) in questionStore.questions"
                :key="question.id"
                :type="getButtonType(index)"
                size="small"
                circle
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </el-button>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useQuestionStore } from '../stores/question'
import { profileApi } from '../api'

const router = useRouter()
const questionStore = useQuestionStore()

const currentAnswer = ref('')
const generating = ref(false)

// 监听当前答案变化，自动保存
watch(currentAnswer, (newValue) => {
  if (questionStore.currentQuestion) {
    questionStore.saveAnswer(questionStore.currentQuestion.id, newValue)
  }
})

// 监听当前问题变化，加载已有答案
watch(() => questionStore.currentQuestion, (newQuestion) => {
  if (newQuestion) {
    currentAnswer.value = questionStore.getCurrentAnswer()
  }
})

// 获取按钮类型
const getButtonType = (index: number) => {
  if (index === questionStore.currentQuestionIndex) {
    return 'primary'
  }
  const question = questionStore.questions[index]
  if (question && questionStore.answers.has(question.id)) {
    return 'success'
  }
  return 'default'
}

// 回到首页
const goHome = () => {
  ElMessageBox.confirm(
    '返回首页将丢失当前进度，是否继续？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    router.push('/')
  }).catch(() => {
    // 用户取消
  })
}

// 上一题
const handlePrevious = () => {
  questionStore.previousQuestion()
  currentAnswer.value = questionStore.getCurrentAnswer()
}

// 下一题
const handleNext = () => {
  if (questionStore.currentQuestion?.is_required && !currentAnswer.value.trim()) {
    ElMessage.warning('这是必答题，请填写答案')
    return
  }
  
  questionStore.nextQuestion()
  currentAnswer.value = questionStore.getCurrentAnswer()
}

// 跳转到指定问题
const goToQuestion = (index: number) => {
  questionStore.goToQuestion(index)
  currentAnswer.value = questionStore.getCurrentAnswer()
}

// 保存进度
const handleSave = async () => {
  try {
    const success = await questionStore.saveAllAnswers()
    if (success) {
      ElMessage.success('进度已保存')
    }
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  }
}

// 提交并生成画像
const handleSubmit = async () => {
  // 检查必答题是否都已回答
  if (!questionStore.isAllAnswered) {
    ElMessage.warning('还有必答题未完成，请完成所有必答题')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确认提交所有答案并生成人格画像？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
    
    generating.value = true
    
    // 先保存所有答案
    await questionStore.saveAllAnswers()
    
    // 生成画像
    const formattedAnswers = questionStore.getFormattedAnswers()
    const res = await profileApi.generate({
      session_id: questionStore.sessionId,
      answers: formattedAnswers
    })
    
    ElMessage.success('画像生成成功！')
    
    // 跳转到结果页
    router.push(`/summary/${res.data.id}`)
    
    // 重置问答状态
    questionStore.reset()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('生成画像失败:', error)
      ElMessage.error('生成画像失败，请重试')
    }
  } finally {
    generating.value = false
  }
}

// 初始化
if (questionStore.questions.length === 0) {
  questionStore.loadQuestions().then(() => {
    currentAnswer.value = questionStore.getCurrentAnswer()
  })
} else {
  currentAnswer.value = questionStore.getCurrentAnswer()
}
</script>

<style scoped>
.question-page {
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

.progress-info {
  color: white;
  font-size: 16px;
}

.question-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.progress-section {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
}

.question-card {
  margin-bottom: 30px;
  animation: fadeIn 0.5s ease;
}

.question-content {
  padding: 20px;
}

.question-category {
  margin-bottom: 20px;
}

.question-category .el-tag {
  margin-right: 10px;
}

.question-text {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
  line-height: 1.5;
}

.answer-section {
  margin-bottom: 20px;
}

.tips {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.question-nav {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
}

.question-nav h3 {
  margin-bottom: 15px;
  color: #333;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .question-text {
    font-size: 20px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>
