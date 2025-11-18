-- 创建数据库
CREATE DATABASE IF NOT EXISTS personality_profiler DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE personality_profiler;

-- 用户表
CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `password` varchar(255) NOT NULL COMMENT '密码（加密）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`),
  UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 问题表
CREATE TABLE `questions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '问题ID',
  `category` varchar(50) NOT NULL DEFAULT '基础' COMMENT '问题分类',
  `content` text NOT NULL COMMENT '问题内容',
  `order_num` int(11) NOT NULL DEFAULT 0 COMMENT '排序序号',
  `is_required` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否必答 0-否 1-是',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_order` (`order_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题表';

-- 答案表
CREATE TABLE `answers` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '答案ID',
  `user_id` int(11) unsigned DEFAULT NULL COMMENT '用户ID（可选）',
  `session_id` varchar(100) NOT NULL COMMENT '会话ID',
  `question_id` int(11) unsigned NOT NULL COMMENT '问题ID',
  `content` text NOT NULL COMMENT '答案内容',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `fk_answers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answers_question_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答案表';

-- 人格画像表
CREATE TABLE `profiles` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '画像ID',
  `user_id` int(11) unsigned DEFAULT NULL COMMENT '用户ID（可选）',
  `session_id` varchar(100) NOT NULL COMMENT '会话ID',
  `ai_analysis` text NOT NULL COMMENT 'AI分析结果（文本）',
  `structured_data` json NOT NULL COMMENT '结构化数据（JSON）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_profiles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人格画像表';

-- 插入默认问题数据
INSERT INTO `questions` (`category`, `content`, `order_num`, `is_required`) VALUES
('价值观', '你认为人生最重要的三样东西是什么？请详细说明你的理由。', 1, 1),
('价值观', '如果你有一个超能力，你会选择什么？为什么？', 2, 1),
('动机', '什么事情能让你感到真正的满足和成就感？', 3, 1),
('动机', '你愿意为了什么而改变自己的生活方式？', 4, 1),
('性格特质', '在朋友眼中，你是一个怎样的人？请举例说明。', 5, 1),
('性格特质', '你如何处理压力和挫折？能分享一个具体的例子吗？', 6, 1),
('行为倾向', '你更喜欢独处还是和他人在一起？为什么？', 7, 1),
('行为倾向', '面对重要决定时，你是依靠理性分析还是直觉感受？', 8, 1),
('人际关系', '你如何维护重要的人际关系？', 9, 1),
('人际关系', '冲突发生时，你通常采取什么样的解决方式？', 10, 1),
('成长经历', '哪个人或哪件事对你的人生影响最大？', 11, 0),
('成长经历', '你最引以为傲的成就是什么？', 12, 0),
('未来规划', '五年后，你希望自己成为什么样的人？', 13, 1),
('未来规划', '如果没有任何限制，你最想做什么？', 14, 0),
('自我认知', '你认为自己最大的优点和缺点分别是什么？', 15, 1),
('自我认知', '别人对你最大的误解是什么？', 16, 0),
('兴趣爱好', '你的兴趣爱好是什么？它们如何影响你的生活？', 17, 0),
('工作态度', '理想的工作环境是怎样的？', 18, 0),
('学习方式', '你更喜欢通过什么方式学习新知识？', 19, 0),
('情感表达', '你如何表达自己的情感？', 20, 1);

-- 创建索引以提高查询性能
CREATE INDEX idx_profiles_created_desc ON profiles(created_at DESC);
CREATE INDEX idx_answers_session_question ON answers(session_id, question_id);
