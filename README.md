# 足记 - 旅行记录网站

一个清新温暖的旅行记录平台，让用户记录旅行足迹，分享精彩游记。

## 🎯 功能特性

### 用户功能
- **注册登录** - 支持用户名/邮箱+密码注册登录，JWT认证
- **足迹地图** - 标记去过和想去的城市，生成交互式地图
- **城市管理** - 搜索、添加、编辑、删除城市标记
- **图文游记** - 发布、编辑、删除游记，支持多张图片
- **互动功能** - 点赞、评论游记
- **城市筛选** - 按城市筛选游记
- **个人主页** - 展示统计数据、足迹地图、照片墙
- **地图分享** - 导出地图为图片，生成长图分享

### 管理员功能
- **内容审核** - 审核用户发布的游记
- **权限隔离** - 管理员仅能看到审核相关菜单，无法访问普通用户功能

## 🛠 技术栈

### 后端
- **框架**: Spring Boot 3.2.0
- **安全**: Spring Security + JWT
- **数据库**: MySQL 8.0+
- **ORM**: Spring Data JPA
- **构建工具**: Maven

### 前端
- **框架**: Angular 17 (Standalone Components)
- **UI组件**: Angular Material
- **地图**: Leaflet
- **图片导出**: html2canvas
- **样式**: SCSS

## 📁 项目结构

```
TravelTrace/
├── backend/                    # 后端Spring Boot项目
│   ├── pom.xml
│   └── src/main/
│       ├── resources/
│       │   ├── application.yml
│       │   └── db/schema.sql
│       └── java/com/traveltrace/footprint/
│           ├── FootprintApplication.java
│           ├── config/
│           ├── controller/
│           ├── dto/
│           ├── entity/
│           ├── repository/
│           ├── security/
│           └── service/
│
├── frontend/                   # 前端Angular项目
│   ├── package.json
│   ├── angular.json
│   ├── proxy.conf.json
│   └── src/
│       ├── app/
│       │   ├── app.component.ts
│       │   ├── app.config.ts
│       │   ├── app.routes.ts
│       │   ├── core/
│       │   │   ├── models/
│       │   │   ├── services/
│       │   │   └── guards/
│       │   └── features/
│       │       ├── auth/
│       │       ├── home/
│       │       ├── map/
│       │       ├── cities/
│       │       ├── posts/
│       │       ├── profile/
│       │       └── admin/
│       ├── index.html
│       ├── main.ts
│       └── styles.scss
│
├── .gitignore
└── README.md
```

## 🚀 快速启动

### 环境要求

- **Java**: JDK 17+
- **Node.js**: 18.x+
- **npm**: 9.x+
- **MySQL**: 8.0+
- **Angular CLI**: 17.x (可选)

### 1. 数据库配置

#### 1.1 创建数据库

```sql
-- 使用MySQL命令行或客户端执行
CREATE DATABASE IF NOT EXISTS footprint DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 1.2 执行初始化脚本

找到文件 `backend/src/main/resources/db/schema.sql`，执行其中的SQL语句。

或者等待Spring Boot启动时自动创建表结构（JPA hibernate.ddl-auto=update）。

#### 1.3 修改数据库连接配置

编辑 `backend/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/footprint?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root           # 改为你的MySQL用户名
    password: root           # 改为你的MySQL密码
```

### 2. 启动后端

#### 2.1 进入后端目录

```bash
cd TravelTrace/backend
```

#### 2.2 编译项目

```bash
mvn clean install -DskipTests
```

#### 2.3 运行项目

```bash
mvn spring-boot:run
```

或者运行编译后的jar包：

```bash
java -jar target/footprint-1.0.0.jar
```

后端服务启动在 **http://localhost:8080**

### 3. 启动前端

#### 3.1 进入前端目录

```bash
cd TravelTrace/frontend
```

#### 3.2 安装依赖

```bash
npm install
```

#### 3.3 启动开发服务器

```bash
npm start
```

前端服务启动在 **http://localhost:4200**

### 4. 创建管理员账户

#### 4.1 方法一：通过SQL插入

```sql
-- 插入管理员 (密码: admin123，需要BCrypt加密)
-- 先用普通用户注册，然后修改role字段
INSERT INTO users (username, password, email, nickname, role, created_at, updated_at)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5', 'admin@footprint.com', '管理员', 'ADMIN', NOW(), NOW());

-- 注意：上面的密码是示例，请使用正确的BCrypt加密后的密码
-- 建议：先用前端注册一个普通用户，然后手动修改role字段为'ADMIN'
```

#### 4.2 方法二：注册后修改（推荐）

1. 用前端注册一个普通用户，例如用户名 `admin`
2. 执行SQL修改角色：

```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';
```

## 🧪 验证步骤

### 1. 后端API验证

#### 1.1 检查健康状态

访问：http://localhost:8080/api/cities

应该返回城市列表的JSON数据。

#### 1.2 用户注册

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456",
    "email": "test@example.com",
    "nickname": "测试用户"
  }'
```

#### 1.3 用户登录

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456"
  }'
```

### 2. 前端功能验证

#### 2.1 访问首页

打开浏览器访问：http://localhost:4200

应该能看到：
- 顶部导航栏
- 首页Hero区域
- 功能特性展示
- 精选游记区域
- 热门城市区域

#### 2.2 用户注册/登录

1. 点击右上角「注册」按钮
2. 填写用户名、密码、邮箱、昵称
3. 提交注册，应该自动登录并跳转首页

#### 2.3 城市管理

1. 登录后点击导航栏「城市列表」
2. 在「全部城市」标签页浏览城市
3. 点击「已到过」或「想去」添加城市
4. 切换到「我的城市」标签页查看已添加的城市

#### 2.4 足迹地图

1. 点击导航栏「我的足迹」
2. 查看地图上标记的城市
3. 不同颜色区分「已到过」(绿色) 和「想去」(橙色)
4. 点击「导出地图」下载PNG图片
5. 点击「生成长图」生成分享用长图

#### 2.5 游记功能

1. 点击导航栏「游记」浏览游记列表
2. 点击「写游记」进入发布页面
3. 填写标题、内容，选择关联城市
4. 添加图片URL（可选）
5. 点击「发布游记」提交审核
6. 点击游记卡片进入详情页
7. 查看评论、发表评论、点赞

#### 2.6 个人主页

1. 点击右上角头像，选择「个人主页」
2. 查看个人信息、统计数据
3. 查看「我的足迹」和「我的游记」标签
4. 点击「编辑资料」修改个人信息

#### 2.7 管理员审核

1. 使用管理员账户登录
2. 导航栏出现「审核」菜单
3. 点击「审核」进入审核页面
4. 查看待审核的游记列表
5. 点击「通过」或「拒绝」进行审核
6. 拒绝时需要填写原因

## 🔧 常见问题

### 1. MySQL连接失败

- 检查MySQL服务是否启动
- 检查数据库连接配置中的用户名和密码
- 检查是否创建了`footprint`数据库
- 确认MySQL版本是否为8.0+

### 2. 前端无法访问后端API

- 确认后端服务已启动在8080端口
- 检查前端proxy配置是否正确
- 查看浏览器控制台是否有CORS相关错误

### 3. JWT Token过期

- 后端默认Token有效期为24小时
- Token过期后需要重新登录
- 可以修改 `application.yml` 中的 `jwt.expiration` 调整有效期

### 4. 图片无法显示

- 当前版本使用图片URL，需要确保图片地址可访问
- 建议使用稳定的图床服务
- 后续可扩展实现本地文件上传功能

## 📊 数据库表说明

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| cities | 城市基础数据表 |
| user_cities | 用户-城市关联表（足迹） |
| posts | 游记表 |
| post_images | 游记图片表 |
| likes | 点赞表 |
| comments | 评论表 |
| audit_records | 审核记录表 |

## 🎨 UI设计风格

- **主色调**: 紫色渐变 (#667eea → #764ba2)
- **强调色**: 粉色 (#f093fb)
- **状态色**: 绿色(成功)、橙色(待审核)、红色(警告)
- **风格**: 清新温暖、圆角卡片、柔和阴影、旅行治愈感

## 📝 后续优化建议

1. **图片上传**: 实现本地文件上传，替代当前的URL方式
2. **地图样式**: 集成高德/百度地图API，支持中文地图
3. **消息通知**: 添加系统消息和审核结果通知
4. **搜索功能**: 增强游记和城市的搜索能力
5. **社交功能**: 关注用户、收藏游记
6. **数据分析**: 更丰富的旅行统计和可视化
7. **移动端**: 开发小程序或移动端适配优化

## 📄 许可证

MIT License

---

如有问题，请查看项目代码或联系开发者。
