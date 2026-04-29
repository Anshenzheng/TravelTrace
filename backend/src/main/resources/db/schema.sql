-- 创建数据库
CREATE DATABASE IF NOT EXISTS footprint DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE footprint;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    bio VARCHAR(500),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 城市表
CREATE TABLE IF NOT EXISTS cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    country VARCHAR(100),
    province VARCHAR(100),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户城市关联表（足迹）
CREATE TABLE IF NOT EXISTS user_cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    city_id BIGINT NOT NULL,
    status ENUM('VISITED', 'WANT_TO_VISIT') NOT NULL,
    visit_date DATE,
    rating INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_city (user_id, city_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_city_id (city_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 游记表
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    city_id BIGINT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    cover_image VARCHAR(500),
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    reject_reason VARCHAR(500),
    views INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_city_id (city_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 游记图片表
CREATE TABLE IF NOT EXISTS post_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_post (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT NOT NULL,
    status ENUM('ACTIVE', 'DELETED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 审核记录表
CREATE TABLE IF NOT EXISTS audit_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    action ENUM('APPROVE', 'REJECT') NOT NULL,
    reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_admin_id (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始城市数据
INSERT INTO cities (name, name_en, country, province, latitude, longitude, description) VALUES
('北京', 'Beijing', '中国', '北京市', 39.9042, 116.4074, '中国首都，历史悠久的古都'),
('上海', 'Shanghai', '中国', '上海市', 31.2304, 121.4737, '国际大都市，东方明珠'),
('广州', 'Guangzhou', '中国', '广东省', 23.1291, 113.2644, '千年商都，美食天堂'),
('深圳', 'Shenzhen', '中国', '广东省', 22.5431, 114.0579, '创新之都，年轻城市'),
('杭州', 'Hangzhou', '中国', '浙江省', 30.2741, 120.1551, '人间天堂，西湖美景'),
('成都', 'Chengdu', '中国', '四川省', 30.5728, 104.0668, '天府之国，熊猫故乡'),
('西安', 'Xi\'an', '中国', '陕西省', 34.3416, 108.9398, '千年古都，丝绸之路起点'),
('南京', 'Nanjing', '中国', '江苏省', 32.0603, 118.7969, '六朝古都，江南佳丽地'),
('苏州', 'Suzhou', '中国', '江苏省', 31.2990, 120.5853, '东方威尼斯，园林之城'),
('重庆', 'Chongqing', '中国', '重庆市', 29.4316, 106.9123, '山城雾都，火锅之乡'),
('三亚', 'Sanya', '中国', '海南省', 18.2528, 109.5119, '热带海滨，度假天堂'),
('厦门', 'Xiamen', '中国', '福建省', 24.4798, 118.0894, '海上花园，文艺之城'),
('青岛', 'Qingdao', '中国', '山东省', 36.0671, 120.3826, '海滨城市，啤酒之乡'),
('大连', 'Dalian', '中国', '辽宁省', 38.9140, 121.6147, '北方明珠，浪漫之都'),
('昆明', 'Kunming', '中国', '云南省', 25.0389, 102.7183, '春城，四季如春'),
('丽江', 'Lijiang', '中国', '云南省', 26.8721, 100.2294, '古城风韵，雪山脚下'),
('拉萨', 'Lhasa', '中国', '西藏自治区', 29.6500, 91.1000, '日光城，佛教圣地'),
('香港', 'Hong Kong', '中国', '香港特别行政区', 22.3193, 114.1694, '东方之珠，购物天堂'),
('澳门', 'Macau', '中国', '澳门特别行政区', 22.1987, 113.5439, '东方蒙特卡洛，赌城'),
('台北', 'Taipei', '中国', '台湾省', 25.0330, 121.5654, '宝岛首府，夜市美食'),
('东京', 'Tokyo', '日本', '东京都', 35.6762, 139.6503, '日本首都，现代与传统交融'),
('大阪', 'Osaka', '日本', '大阪府', 34.6937, 135.5023, '美食之城，商业中心'),
('京都', 'Kyoto', '日本', '京都府', 35.0116, 135.7681, '千年古都，文化遗产'),
('首尔', 'Seoul', '韩国', '首尔特别市', 37.5665, 126.9780, '韩国首都，时尚之都'),
('曼谷', 'Bangkok', '泰国', '曼谷', 13.7563, 100.5018, '微笑之国，佛教文化'),
('清迈', 'Chiang Mai', '泰国', '清迈府', 18.7877, 98.9931, '北部玫瑰，古城风情'),
('新加坡', 'Singapore', '新加坡', '新加坡', 1.3521, 103.8198, '花园城市，多元文化'),
('巴黎', 'Paris', '法国', '法兰西岛', 48.8566, 2.3522, '浪漫之都，艺术之城'),
('伦敦', 'London', '英国', '英格兰', 51.5074, -0.1278, '雾都，大本钟所在地'),
('纽约', 'New York', '美国', '纽约州', 40.7128, -74.0060, '不夜城，自由女神像'),
('悉尼', 'Sydney', '澳大利亚', '新南威尔士州', -33.8688, 151.2093, '海港城市，歌剧院');

-- 插入管理员账户（密码：admin123，需要在应用启动后修改）
-- 密码将通过Java代码加密后存储，这里先创建结构
