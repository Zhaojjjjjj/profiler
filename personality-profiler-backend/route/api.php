<?php
use think\facade\Route;

// OPTIONS请求直接返回（跨域由中间件处理）
Route::options('api/:any', function() {
    return '';
})->pattern(['any' => '.*']);

// API路由组
Route::group('api', function () {
    
    // 问题相关
    Route::get('questions/list', 'app\controller\Question@list');
    Route::get('questions/:id', 'app\controller\Question@detail');
    
    // 答案相关
    Route::post('answer/save', 'app\controller\Answer@save');
    Route::post('answer/save-batch', 'app\controller\Answer@saveBatch');
    Route::get('answer/session', 'app\controller\Answer@session');
    
    // 画像相关
    Route::post('profile/generate', 'app\controller\Profile@generate');
    Route::get('profile/list', 'app\controller\Profile@list');
    Route::get('profile/recent', 'app\controller\Profile@recent');
    Route::get('profile/:id', 'app\controller\Profile@detail');
    
    // 用户相关
    Route::post('user/register', 'app\controller\User@register');
    Route::post('user/login', 'app\controller\User@login');
    Route::post('user/logout', 'app\controller\User@logout');
    Route::get('user/info', 'app\controller\User@info');
    
});
