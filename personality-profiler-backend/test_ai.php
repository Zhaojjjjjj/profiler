<?php
// 测试 AI API 调用

require __DIR__ . '/vendor/autoload.php';

$apiUrl = 'http://127.0.0.1:11434/v1/chat/completions';
$model = 'mistral';

$data = [
    'model' => $model,
    'messages' => [
        [
            'role' => 'system',
            'content' => '你是一位专业的心理学家。请简短回答。'
        ],
        [
            'role' => 'user',
            'content' => '请用一句话描述一个喜欢独处的人的性格特点。'
        ]
    ],
    'temperature' => 0.7,
    'max_tokens' => 100
];

echo "开始调用 AI API...\n";
echo "API URL: $apiUrl\n";
echo "Model: $model\n\n";

$startTime = microtime(true);

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

$endTime = microtime(true);
$duration = round($endTime - $startTime, 2);

curl_close($ch);

echo "耗时: {$duration} 秒\n";
echo "HTTP 状态码: $httpCode\n";

if ($curlError) {
    echo "cURL 错误: $curlError\n";
    exit(1);
}

if ($httpCode !== 200) {
    echo "HTTP 错误响应:\n";
    echo $response . "\n";
    exit(1);
}

$result = json_decode($response, true);

if (isset($result['choices'][0]['message']['content'])) {
    echo "\n✅ AI 响应成功！\n";
    echo "内容: " . $result['choices'][0]['message']['content'] . "\n";
} else {
    echo "\n❌ 响应格式错误\n";
    echo "原始响应:\n";
    print_r($result);
}
