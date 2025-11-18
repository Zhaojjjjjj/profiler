<?php

return [
    // JWT密钥，生产环境请修改
    'secret' => env('JWT_SECRET', 'your-secret-key-change-this-in-production-' . uniqid()),
    
    // 过期时间（秒）
    'ttl' => 7 * 24 * 60 * 60, // 7天
    
    // 刷新时间（秒）
    'refresh_ttl' => 14 * 24 * 60 * 60, // 14天
];
