<?php
declare(strict_types=1);

namespace app\middleware;

use think\Request;
use think\Response;

class Security
{
    /**
     * 处理请求
     */
    public function handle(Request $request, \Closure $next)
    {
        // 注意：输入过滤在这里不做，因为：
        // 1. ThinkPHP 的查询构建器已自动处理 SQL 注入
        // 2. 用户的回答内容可能包含特殊字符，不应过度过滤
        // 3. 前端已经做了基本的输入验证
        
        // 继续执行请求
        $response = $next($request);
        
        // 添加安全响应头部
        $response->header([
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'X-XSS-Protection' => '1; mode=block',
            'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy' => "default-src 'self'"
        ]);
        
        return $response;
    }
}
