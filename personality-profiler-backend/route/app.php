<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006~2018 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------
use think\facade\Route;

// 加载 API 路由
require_once __DIR__ . '/api.php';

// 默认首页
Route::get('/', function () {
    return json([
        'code' => 200,
        'message' => 'Personality Profiler API',
        'version' => '1.0.0',
        'endpoints' => [
            'questions' => '/api/questions/list',
            'profile' => '/api/profile/generate',
            'user' => '/api/user/login'
        ]
    ]);
});
