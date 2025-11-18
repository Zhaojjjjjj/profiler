import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question } from '../types'
import { questionApi, answerApi } from '../api'
import { v4 as uuidv4 } from 'uuid'

export const useQuestionStore = defineStore('question', () => {
  // 状态
  const questions = ref<Question[]>([])
  const answers = ref<Map<number, string>>(new Map())
  const currentQuestionIndex = ref(0)
  const sessionId = ref<string>(sessionStorage.getItem('session_id') || '')
  const isLoading = ref(false)
  
  // 计算属性
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
  const totalQuestions = computed(() => questions.value.length)
  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((currentQuestionIndex.value + 1) / totalQuestions.value * 100)
  })
  const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)
  const answeredCount = computed(() => answers.value.size)
  const isAllAnswered = computed(() => {
    const requiredQuestions = questions.value.filter(q => q.is_required)
    return requiredQuestions.every(q => answers.value.has(q.id))
  })
  
  // 方法
  const initSession = () => {
    const newSessionId = uuidv4()
    sessionId.value = newSessionId
    sessionStorage.setItem('session_id', newSessionId)
    answers.value.clear()
    currentQuestionIndex.value = 0
  }
  
  const loadQuestions = async () => {
    isLoading.value = true
    try {
      const res = await questionApi.getList()
      questions.value = res.data.sort((a, b) => a.order_num - b.order_num)
      return true
    } catch (error) {
      console.error('加载问题失败:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  const saveAnswer = (questionId: number, answer: string) => {
    answers.value.set(questionId, answer)
  }
  
  const nextQuestion = () => {
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      currentQuestionIndex.value++
      return true
    }
    return false
  }
  
  const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
      return true
    }
    return false
  }
  
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions.value) {
      currentQuestionIndex.value = index
      return true
    }
    return false
  }
  
  const getCurrentAnswer = () => {
    if (!currentQuestion.value) return ''
    return answers.value.get(currentQuestion.value.id) || ''
  }
  
  const saveAllAnswers = async () => {
    const answersArray = Array.from(answers.value.entries()).map(([questionId, content]) => ({
      question_id: questionId,
      content
    }))
    
    try {
      await answerApi.saveBatch({
        session_id: sessionId.value,
        answers: answersArray
      })
      return true
    } catch (error) {
      console.error('保存答案失败:', error)
      return false
    }
  }
  
  const getFormattedAnswers = () => {
    return questions.value
      .filter(q => answers.value.has(q.id))
      .map(q => ({
        question_id: q.id,
        question: q.content,
        answer: answers.value.get(q.id) || ''
      }))
  }
  
  const reset = () => {
    answers.value.clear()
    currentQuestionIndex.value = 0
    initSession()
  }
  
  return {
    questions,
    answers,
    currentQuestionIndex,
    sessionId,
    isLoading,
    currentQuestion,
    totalQuestions,
    progress,
    isLastQuestion,
    answeredCount,
    isAllAnswered,
    initSession,
    loadQuestions,
    saveAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    getCurrentAnswer,
    saveAllAnswers,
    getFormattedAnswers,
    reset
  }
})
