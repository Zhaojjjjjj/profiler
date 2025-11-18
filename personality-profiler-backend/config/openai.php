<?php

return [
    // OpenAI API Key - 请在.env文件中设置
    'api_key' => env('OPENAI_API_KEY', ''),
    
    // API端点
    'api_url' => env('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
    
    // 使用的模型
    'model' => env('OPENAI_MODEL', 'gpt-4'),
    
    // 温度参数（0-2，越高越随机）
    'temperature' => 0.7,
    
    // 最大token数
    'max_tokens' => 2000,
];
