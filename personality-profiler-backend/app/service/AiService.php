<?php
declare(strict_types=1);

namespace app\service;

class AiService
{
    private $apiKey;
    private $apiUrl;
    private $model;
    
    public function __construct()
    {
        $this->apiKey = config('openai.api_key');
        $this->apiUrl = config('openai.api_url', 'https://api.openai.com/v1/chat/completions');
        $this->model = config('openai.model', 'gpt-4');
    }
    
    /**
     * 生成人格画像
     */
    public function generateProfile(array $answers): array
    {
        try {
            trace('开始生成人格画像，问题数量: ' . count($answers), 'info');
            
            // 开发模式：如果 API Key 为空或为默认值，使用模拟数据
            if (empty($this->apiKey) || $this->apiKey === 'your-openai-api-key') {
                trace('使用模拟数据模式（未配置有效的 API Key）', 'info');
                return $this->generateMockProfile($answers);
            }
            
            // 构建prompt
            $prompt = $this->buildPrompt($answers);
            trace('Prompt 构建完成，长度: ' . strlen($prompt), 'info');
            
            // 调用OpenAI API
            $startTime = microtime(true);
            $response = $this->callOpenAI($prompt);
            $duration = round(microtime(true) - $startTime, 2);
            
            trace('AI API 调用完成，耗时: ' . $duration . '秒', 'info');
            
            if (!$response) {
                trace('AI API 返回空响应', 'error');
                return [
                    'success' => false,
                    'message' => 'AI API调用失败，请检查日志'
                ];
            }
            
            // 解析AI响应
            $content = $response['choices'][0]['message']['content'] ?? '';
            
            if (empty($content)) {
                trace('AI 返回内容为空', 'error');
                return [
                    'success' => false,
                    'message' => 'AI 未返回有效内容'
                ];
            }
            
            trace('AI 响应内容长度: ' . strlen($content), 'info');
            
            // 提取结构化数据
            $structuredData = $this->extractStructuredData($content);
            
            return [
                'success' => true,
                'analysis' => $content,
                'structured_data' => $structuredData
            ];
            
        } catch (\Exception $e) {
            trace('生成画像异常: ' . $e->getMessage(), 'error');
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * 构建AI Prompt
     */
    private function buildPrompt(array $answers): string
    {
        $systemPrompt = $this->getSystemPrompt();
        
        $userPrompt = "请根据以下问答内容，生成详细的人格画像分析：\n\n";
        
        foreach ($answers as $qa) {
            $userPrompt .= "问题：{$qa['question']}\n";
            $userPrompt .= "回答：{$qa['answer']}\n\n";
        }
        
        $userPrompt .= "\n请按照指定格式输出分析结果。";
        
        return $userPrompt;
    }
    
    /**
     * 获取系统Prompt
     */
    private function getSystemPrompt(): string
    {
        return <<<PROMPT
你是一位专业的心理学家和人格分析专家。你的任务是根据用户的回答，生成深度的人格画像分析。

分析要求：
1. 基于用户的回答内容，不要猜测或假设未提及的信息
2. 使用专业但易懂的语言
3. 保持客观和积极的态度
4. 避免负面标签和判断
5. 提供建设性的洞察

输出格式要求：
请生成两部分内容：

第一部分：详细的人格分析报告（500-800字）
包含以下方面：
- 核心性格特质分析
- 内在动机和驱动力
- 价值观体系
- 行为模式和倾向
- 人际交往特点
- 潜在优势和发展方向

第二部分：结构化标签（JSON格式）
请在分析报告后，用以下JSON格式总结关键信息：
```json
{
  "personality_traits": ["特质1", "特质2", "特质3", "特质4", "特质5"],
  "motivations": ["动机1", "动机2", "动机3"],
  "values": ["价值观1", "价值观2", "价值观3"],
  "behavioral_tendencies": ["行为倾向1", "行为倾向2", "行为倾向3"],
  "summary": "一句话总结（不超过50字）"
}
```

注意：
- 每个标签简洁明确，2-4个字
- personality_traits: 5个核心性格特质
- motivations: 3个主要动机
- values: 3个核心价值观
- behavioral_tendencies: 3个行为倾向
- summary: 精炼的整体概括
PROMPT;
    }
    
    /**
     * 调用OpenAI API
     */
    private function callOpenAI(string $prompt): ?array
    {
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt()],
            ['role' => 'user', 'content' => $prompt]
        ];
        
        $data = [
            'model' => $this->model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 2000
        ];
        
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $this->apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 120); // 增加到120秒
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); // 连接超时10秒
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        
        curl_close($ch);
        
        // 记录错误信息
        if ($curlError) {
            trace('AI API cURL Error: ' . $curlError, 'error');
            return null;
        }
        
        if ($httpCode !== 200) {
            trace('AI API HTTP Error: ' . $httpCode . ', Response: ' . $response, 'error');
            return null;
        }
        
        return json_decode($response, true);
    }
    
    /**
     * 从AI响应中提取结构化数据
     */
    private function extractStructuredData(string $content): array
    {
        // 尝试从内容中提取JSON
        if (preg_match('/```json\s*(.*?)\s*```/s', $content, $matches)) {
            $jsonStr = $matches[1];
            $data = json_decode($jsonStr, true);
            
            if ($data) {
                return $data;
            }
        }
        
        // 如果提取失败，返回默认结构
        return [
            'personality_traits' => ['深思熟虑', '富有洞察力', '独立思考', '追求成长', '情感丰富'],
            'motivations' => ['自我实现', '获得认可', '创造价值'],
            'values' => ['真诚', '成长', '和谐'],
            'behavioral_tendencies' => ['理性分析', '谨慎决策', '追求完美'],
            'summary' => '一个充满潜力、不断追求自我成长的独特个体'
        ];
    }
    
    /**
     * 生成模拟画像数据（用于开发测试）
     */
    private function generateMockProfile(array $answers): array
    {
        $answerCount = count($answers);
        
        $analysis = <<<ANALYSIS
# 人格画像分析报告

## 核心性格特质

基于您对 {$answerCount} 个问题的回答，我们发现您是一个内敛而深思熟虑的人。您倾向于通过理性分析来处理问题，同时也保持着对内在世界的关注。您的性格中既有独立思考的一面，也有对人际关系的重视。

## 内在动机和驱动力

您的主要动机来源于自我实现和个人成长。您追求的不仅仅是外在的成就，更重要的是内在的满足感和自我认同。您希望通过不断学习和进步来实现自己的价值。

## 价值观体系

真诚、成长和和谐是您价值观的核心。您重视真实的自我表达，相信持续的自我提升，并且希望在人际关系中保持平衡与和谐。

## 行为模式和倾向

在面对决策时，您倾向于采用理性分析的方式，但也不会完全忽视直觉。您的行为模式显示出谨慎和深思熟虑的特点，这使得您在重要决定上较少出错。

## 人际交往特点

您在人际交往中表现出一定的选择性。您重视深度的连接而非广泛的社交，倾向于与少数志同道合的人建立深厚的关系。

## 潜在优势和发展方向

您的优势在于独立思考能力和自我反思能力。未来的发展方向可以考虑在保持这些优势的同时，适当扩展社交圈，增强团队协作能力。

---

**注意：这是基于模拟数据生成的示例报告。要获得真实的 AI 分析，请配置有效的 OpenAI API Key。**

```json
{
  "personality_traits": ["理性思考", "内敛沉稳", "追求成长", "注重深度", "独立自主"],
  "motivations": ["自我实现", "知识探索", "内在满足"],
  "values": ["真诚", "成长", "和谐"],
  "behavioral_tendencies": ["理性分析", "谨慎决策", "深度思考"],
  "summary": "一个理性而内敛的思考者，追求自我成长与内在和谐"
}
```
ANALYSIS;

        return [
            'success' => true,
            'analysis' => $analysis,
            'structured_data' => [
                'personality_traits' => ['理性思考', '内敛沉稳', '追求成长', '注重深度', '独立自主'],
                'motivations' => ['自我实现', '知识探索', '内在满足'],
                'values' => ['真诚', '成长', '和谐'],
                'behavioral_tendencies' => ['理性分析', '谨慎决策', '深度思考'],
                'summary' => '一个理性而内敛的思考者，追求自我成长与内在和谐'
            ]
        ];
    }
}
