<?php
declare(strict_types=1);

namespace app\controller;

use think\App;
use think\exception\HttpResponseException;
use think\Response;

abstract class Base
{
    protected $app;
    protected $request;
    protected $userId;
    protected $sessionId;

    public function __construct(App $app)
    {
        $this->app = $app;
        $this->request = $this->app->request;
        
        // 获取session_id
        $this->sessionId = $this->request->header('X-Session-Id', '');
        
        // JWT验证（可选）
        $token = $this->request->header('Authorization', '');
        if ($token) {
            $this->userId = $this->validateToken($token);
        }
    }

    /**
     * 成功响应
     */
    protected function success($data = null, string $message = '操作成功'): Response
    {
        return json([
            'code' => 200,
            'message' => $message,
            'data' => $data
        ]);
    }

    /**
     * 错误响应
     */
    protected function error(string $message = '操作失败', int $code = 400, $data = null): Response
    {
        return json([
            'code' => $code,
            'message' => $message,
            'data' => $data
        ]);
    }

    /**
     * 验证Token
     */
    private function validateToken(string $token): ?int
    {
        try {
            $token = str_replace('Bearer ', '', $token);
            if (empty($token)) {
                return null;
            }
            
            // 使用JWT解码
            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key(config('jwt.secret'), 'HS256'));
            return $decoded->user_id ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * 参数验证
     */
    protected function validate(array $data, array $rules): void
    {
        $validate = new \think\Validate($rules);
        if (!$validate->check($data)) {
            throw new HttpResponseException($this->error($validate->getError(), 422));
        }
    }
}
