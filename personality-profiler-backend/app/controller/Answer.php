<?php
declare(strict_types=1);

namespace app\controller;

use think\Response;
use think\facade\Db;

class Answer extends Base
{
    /**
     * 保存单个答案
     */
    public function save(): Response
    {
        $data = $this->request->post();
        
        // 参数验证
        $this->validate($data, [
            'session_id' => 'require',
            'question_id' => 'require|number',
            'content' => 'require'
        ]);
        
        try {
            // 检查是否已存在
            $existing = Db::name('answers')
                ->where('session_id', $data['session_id'])
                ->where('question_id', $data['question_id'])
                ->find();
            
            if ($existing) {
                // 更新现有答案
                Db::name('answers')
                    ->where('id', $existing['id'])
                    ->update([
                        'content' => $data['content'],
                        'user_id' => $this->userId
                    ]);
                
                $answerId = $existing['id'];
            } else {
                // 插入新答案
                $answerId = Db::name('answers')->insertGetId([
                    'session_id' => $data['session_id'],
                    'question_id' => $data['question_id'],
                    'content' => $data['content'],
                    'user_id' => $this->userId
                ]);
            }
            
            $answer = Db::name('answers')->find($answerId);
            return $this->success($answer, '答案保存成功');
            
        } catch (\Exception $e) {
            return $this->error('保存答案失败：' . $e->getMessage());
        }
    }
    
    /**
     * 批量保存答案
     */
    public function saveBatch(): Response
    {
        $data = $this->request->post();
        
        // 参数验证
        $this->validate($data, [
            'session_id' => 'require',
            'answers' => 'require|array'
        ]);
        
        try {
            $insertData = [];
            
            foreach ($data['answers'] as $answer) {
                // 检查是否已存在
                $existing = Db::name('answers')
                    ->where('session_id', $data['session_id'])
                    ->where('question_id', $answer['question_id'])
                    ->find();
                
                if ($existing) {
                    // 更新
                    Db::name('answers')
                        ->where('id', $existing['id'])
                        ->update([
                            'content' => $answer['content'],
                            'user_id' => $this->userId
                        ]);
                } else {
                    // 准备插入
                    $insertData[] = [
                        'session_id' => $data['session_id'],
                        'question_id' => $answer['question_id'],
                        'content' => $answer['content'],
                        'user_id' => $this->userId
                    ];
                }
            }
            
            // 批量插入新答案
            if (!empty($insertData)) {
                Db::name('answers')->insertAll($insertData);
            }
            
            // 返回所有答案
            $answers = Db::name('answers')
                ->where('session_id', $data['session_id'])
                ->select();
            
            return $this->success($answers, '批量保存成功');
            
        } catch (\Exception $e) {
            return $this->error('批量保存失败：' . $e->getMessage());
        }
    }
    
    /**
     * 获取会话的所有答案
     */
    public function session(): Response
    {
        $sessionId = $this->request->param('session_id');
        
        if (empty($sessionId)) {
            return $this->error('会话ID不能为空', 422);
        }
        
        try {
            $answers = Db::name('answers')
                ->where('session_id', $sessionId)
                ->select();
            
            return $this->success($answers);
            
        } catch (\Exception $e) {
            return $this->error('获取答案失败：' . $e->getMessage());
        }
    }
}
