<?php
declare(strict_types=1);

namespace app\middleware;

use think\Request;
use think\Response;

class Cors
{
    /**
     * 处理跨域请求
     */
    public function handle(Request $request, \Closure $next)
    {
        // 处理 OPTIONS 预检请求
        if ($request->method() == 'OPTIONS') {
            return response()
                ->code(200)
                ->header([
                    'Access-Control-Allow-Origin' => '*',
                    'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Session-Id, X-Requested-With',
                    'Access-Control-Max-Age' => 3600,
                ]);
        }
        
        // 处理正常请求
        $response = $next($request);
        
        // 添加 CORS 头部
        $response->header([
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Session-Id, X-Requested-With',
            'Access-Control-Expose-Headers' => 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
        ]);
        
        return $response;
    }
}
