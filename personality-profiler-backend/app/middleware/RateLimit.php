<?php
declare(strict_types=1);

namespace app\middleware;

use think\Request;
use think\Response;
use think\facade\Cache;

class RateLimit
{
    /**
     * 处理请求
     */
    public function handle(Request $request, \Closure $next, int $limit = 60, int $window = 60)
    {
        // 获取客户端标识
        $clientId = $this->getClientIdentifier($request);
        $key = 'rate_limit:' . $clientId;
        
        // 获取当前请求次数
        $current = Cache::get($key);
        if ($current === null || $current === false) {
            $current = 0;
        }
        
        if ($current >= $limit) {
            return json([
                'code' => 429,
                'message' => '请求过于频繁，请稍后再试',
                'data' => null
            ], 429);
        }
        
        // 增加请求次数并设置过期时间
        if ($current == 0) {
            Cache::set($key, 1, $window);
        } else {
            Cache::inc($key);
        }
        
        // 继续执行
        $response = $next($request);
        
        // 添加速率限制头部
        $response->header([
            'X-RateLimit-Limit' => $limit,
            'X-RateLimit-Remaining' => max(0, $limit - $current - 1),
            'X-RateLimit-Reset' => time() + $window
        ]);
        
        return $response;
    }
    
    /**
     * 获取客户端标识
     */
    private function getClientIdentifier(Request $request): string
    {
        // 优先使用用户ID
        $token = $request->header('Authorization', '');
        if ($token) {
            return 'user:' . md5($token);
        }
        
        // 使用Session ID
        $sessionId = $request->header('X-Session-Id', '');
        if ($sessionId) {
            return 'session:' . $sessionId;
        }
        
        // 使用IP地址
        return 'ip:' . $request->ip();
    }
}
