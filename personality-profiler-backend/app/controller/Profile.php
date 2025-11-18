<?php
declare(strict_types=1);

namespace app\controller;

use think\Response;
use think\facade\Db;
use app\service\AiService;

class Profile extends Base
{
    /**
     * 生成人格画像
     */
    public function generate(): Response
    {
        // 增加执行时间限制（AI 生成可能需要较长时间）
        set_time_limit(180); // 3分钟
        
        $data = $this->request->post();
        
        // 参数验证
        $this->validate($data, [
            'session_id' => 'require',
            'answers' => 'require|array'
        ]);
        
        try {
            // 检查是否已生成过
            $existing = Db::name('profiles')
                ->where('session_id', $data['session_id'])
                ->find();
                
            if ($existing) {
                return $this->success($existing, '画像已存在');
            }
            
            // 调用AI服务生成画像
            $aiService = new AiService();
            $result = $aiService->generateProfile($data['answers']);
            
            if (!$result['success']) {
                return $this->error('AI生成失败：' . $result['message']);
            }
            
            // 保存画像到数据库
            $profileId = Db::name('profiles')->insertGetId([
                'user_id' => $this->userId,
                'session_id' => $data['session_id'],
                'ai_analysis' => $result['analysis'],
                'structured_data' => json_encode($result['structured_data'])
            ]);
            
            $profile = Db::name('profiles')->find($profileId);
            $profile['structured_data'] = json_decode($profile['structured_data'], true);
            
            return $this->success($profile, '画像生成成功');
            
        } catch (\Exception $e) {
            return $this->error('生成画像失败：' . $e->getMessage());
        }
    }
    
    /**
     * 获取画像详情
     */
    public function detail($id): Response
    {
        try {
            $profile = Db::name('profiles')->find($id);
            
            if (!$profile) {
                return $this->error('画像不存在', 404);
            }
            
            // 解析JSON数据
            $decoded = json_decode($profile['structured_data'], true);
            $profile['structured_data'] = $decoded ?: [
                'personality_traits' => [],
                'motivations' => [],
                'values' => [],
                'behavioral_tendencies' => [],
                'summary' => '暂无总结'
            ];
            
            return $this->success($profile);
            
        } catch (\Exception $e) {
            return $this->error('获取画像失败：' . $e->getMessage());
        }
    }
    
    /**
     * 获取画像列表
     */
    public function list(): Response
    {
        $page = $this->request->param('page', 1);
        $pageSize = $this->request->param('page_size', 10);
        $userId = $this->request->param('user_id');
        
        try {
            $query = Db::name('profiles');
            
            if ($userId) {
                $query->where('user_id', $userId);
            } elseif ($this->userId) {
                $query->where('user_id', $this->userId);
            }
            
            $total = $query->count();
            
            $list = $query
                ->page((int)$page, (int)$pageSize)
                ->order('created_at', 'desc')
                ->select()
                ->toArray();
            
            // 解析JSON数据
            foreach ($list as $key => $item) {
                $decoded = json_decode($item['structured_data'], true);
                // 如果解析失败或为空，提供默认结构
                $list[$key]['structured_data'] = $decoded ?: [
                    'personality_traits' => [],
                    'motivations' => [],
                    'values' => [],
                    'behavioral_tendencies' => [],
                    'summary' => '暂无总结'
                ];
            }
            
            return $this->success([
                'list' => $list,
                'total' => $total,
                'page' => (int)$page,
                'page_size' => (int)$pageSize
            ]);
            
        } catch (\Exception $e) {
            return $this->error('获取列表失败：' . $e->getMessage());
        }
    }
    
    /**
     * 获取最近的画像
     */
    public function recent(): Response
    {
        $limit = $this->request->param('limit', 5);
        
        try {
            $query = Db::name('profiles');
            
            if ($this->userId) {
                $query->where('user_id', $this->userId);
            }
            
            $list = $query
                ->limit((int)$limit)
                ->order('created_at', 'desc')
                ->select();
            
            // 解析JSON数据
            foreach ($list as &$item) {
                $item['structured_data'] = json_decode($item['structured_data'], true);
            }
            
            return $this->success($list);
            
        } catch (\Exception $e) {
            return $this->error('获取最近画像失败：' . $e->getMessage());
        }
    }
}
