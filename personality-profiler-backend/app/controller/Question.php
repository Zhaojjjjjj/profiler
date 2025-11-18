<?php
declare(strict_types=1);

namespace app\controller;

use think\Response;
use think\facade\Db;

class Question extends Base
{
    /**
     * 获取问题列表
     */
    public function list(): Response
    {
        try {
            $questions = Db::name('questions')
                ->field('id, category, content, order_num, is_required')
                ->order('order_num', 'asc')
                ->select();
            
            return $this->success($questions);
        } catch (\Exception $e) {
            return $this->error('获取问题列表失败：' . $e->getMessage());
        }
    }
    
    /**
     * 获取单个问题
     */
    public function detail($id): Response
    {
        try {
            $question = Db::name('questions')
                ->field('id, category, content, order_num, is_required')
                ->where('id', $id)
                ->find();
                
            if (!$question) {
                return $this->error('问题不存在', 404);
            }
            
            return $this->success($question);
        } catch (\Exception $e) {
            return $this->error('获取问题失败：' . $e->getMessage());
        }
    }
}
