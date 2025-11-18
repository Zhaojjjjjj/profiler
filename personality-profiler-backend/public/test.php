<?php
// 简单测试文件
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'code' => 200,
    'message' => 'API 测试成功',
    'data' => [
        'php_version' => PHP_VERSION,
        'server_time' => date('Y-m-d H:i:s'),
        'test' => 'OK'
    ]
]);
