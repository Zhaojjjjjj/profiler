<?php
declare(strict_types=1);

namespace app\controller;

use think\Response;
use think\facade\Db;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class User extends Base
{
    /**
     * 用户注册
     */
    public function register(): Response
    {
        $data = $this->request->post();
        
        // 参数验证
        $this->validate($data, [
            'username' => 'require|length:3,20',
            'email' => 'require|email',
            'password' => 'require|length:6,20'
        ]);
        
        try {
            // 检查用户名是否已存在
            $existingUser = Db::name('users')
                ->where('username', $data['username'])
                ->find();
                
            if ($existingUser) {
                return $this->error('用户名已存在', 400);
            }
            
            // 检查邮箱是否已存在
            $existingEmail = Db::name('users')
                ->where('email', $data['email'])
                ->find();
                
            if ($existingEmail) {
                return $this->error('邮箱已被注册', 400);
            }
            
            // 创建用户
            $userId = Db::name('users')->insertGetId([
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => password_hash($data['password'], PASSWORD_DEFAULT)
            ]);
            
            // 生成JWT token
            $token = $this->generateToken($userId);
            
            // 获取用户信息
            $user = Db::name('users')
                ->field('id, username, email, created_at')
                ->find($userId);
            
            return $this->success([
                'token' => $token,
                'user' => $user
            ], '注册成功');
            
        } catch (\Exception $e) {
            return $this->error('注册失败：' . $e->getMessage());
        }
    }
    
    /**
     * 用户登录
     */
    public function login(): Response
    {
        $data = $this->request->post();
        
        // 参数验证
        $this->validate($data, [
            'username' => 'require',
            'password' => 'require'
        ]);
        
        try {
            // 查找用户
            $user = Db::name('users')
                ->where('username', $data['username'])
                ->find();
            
            if (!$user) {
                return $this->error('用户名或密码错误', 401);
            }
            
            // 验证密码
            if (!password_verify($data['password'], $user['password'])) {
                return $this->error('用户名或密码错误', 401);
            }
            
            // 生成JWT token
            $token = $this->generateToken($user['id']);
            
            // 移除密码字段
            unset($user['password']);
            
            return $this->success([
                'token' => $token,
                'user' => $user
            ], '登录成功');
            
        } catch (\Exception $e) {
            return $this->error('登录失败：' . $e->getMessage());
        }
    }
    
    /**
     * 获取用户信息
     */
    public function info(): Response
    {
        if (!$this->userId) {
            return $this->error('未登录', 401);
        }
        
        try {
            $user = Db::name('users')
                ->field('id, username, email, created_at')
                ->find($this->userId);
            
            if (!$user) {
                return $this->error('用户不存在', 404);
            }
            
            return $this->success($user);
            
        } catch (\Exception $e) {
            return $this->error('获取用户信息失败：' . $e->getMessage());
        }
    }
    
    /**
     * 退出登录
     */
    public function logout(): Response
    {
        // JWT是无状态的，前端清除token即可
        return $this->success(null, '退出成功');
    }
    
    /**
     * 生成JWT Token
     */
    private function generateToken(int $userId): string
    {
        $payload = [
            'user_id' => $userId,
            'iat' => time(),
            'exp' => time() + (7 * 24 * 60 * 60) // 7天过期
        ];
        
        return JWT::encode($payload, config('jwt.secret'), 'HS256');
    }
}
