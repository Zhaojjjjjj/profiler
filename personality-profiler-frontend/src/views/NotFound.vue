<template>
  <div class="not-found-page">
    <div class="content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-message">抱歉，你访问的页面不存在</p>
      <el-button type="primary" size="large" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  text-align: center;
  animation: fadeInUp 0.8s ease;
}

.error-code {
  font-size: 120px;
  color: white;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 32px;
  color: white;
  margin-bottom: 10px;
}

.error-message {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
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
