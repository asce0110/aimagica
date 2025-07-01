-- ===============================================
-- 添加默认提示词字段到styles表
-- ===============================================

-- 添加默认提示词字段
ALTER TABLE styles 
ADD COLUMN IF NOT EXISTS default_prompt TEXT;

-- 添加字段注释
COMMENT ON COLUMN styles.default_prompt IS '默认英文提示词，当用户不输入提示词时使用';

-- 只为Chibi Diorama风格添加孙悟空大闹天宫的默认提示词
UPDATE styles SET default_prompt = 'Sun Wukong causing havoc in heaven, traditional Chinese mythology, epic battle scene' WHERE name = 'Chibi Diorama' OR name LIKE '%Chibi%';

-- 验证字段添加成功
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'styles' 
    AND column_name = 'default_prompt';

-- 显示已添加默认提示词的风格
SELECT name, default_prompt 
FROM styles 
WHERE default_prompt IS NOT NULL 
ORDER BY sort_order; 