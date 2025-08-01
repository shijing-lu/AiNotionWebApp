# AI Notion - 智能笔记助手

一个集成AI功能的现代化笔记应用，基于Next.js和TypeScript开发。

## 功能特性

### 已实现功能 ✅
- **现代化笔记编辑器**
  - 支持Markdown语法
  - 实时预览功能
  - 语法高亮显示
  - 双栏编辑/预览模式

- **笔记管理**
  - 创建、编辑、删除笔记
  - 导入本地Markdown文件
  - 标签系统（支持自动标签识别）
  - 书签功能
  - 本地存储支持

- **智能搜索**
  - 全文搜索
  - 标签过滤
  - 实时搜索结果

- **AI智能助手** 🤖
  - 文档智能摘要
  - 多语言翻译
  - 概念解释
  - 智能问答
  - 内容风格优化
  - 自动标签生成

- **响应式设计**
  - 桌面端和移动端适配
  - Material-UI组件库
  - 现代化UI设计

### 规划中功能 🚧
- 知识图谱可视化
- 云端同步
- 协作功能
- 语音输入
- 文档导入/导出

## 技术栈

- **前端框架**: Next.js 14 (React)
- **语言**: TypeScript
- **UI组件库**: Material-UI (MUI)
- **样式方案**: Emotion
- **Markdown处理**: react-markdown
- **语法高亮**: react-syntax-highlighter
- **AI集成**: OpenAI API

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置AI功能（推荐）

#### 🤖 方法一：自动配置（推荐）
```bash
npm run setup-ai
```
运行配置助手，按照提示输入OpenAI API密钥即可。

#### 🔧 方法二：手动配置
1. 复制环境变量文件：
   ```bash
   cp env.example .env.local
   ```
2. 获取OpenAI API密钥：
   - 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
   - 注册/登录账户
   - 点击 "Create new secret key"
   - 复制生成的密钥（以 `sk-` 开头）
3. 编辑 `.env.local` 文件：
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

#### 💡 AI功能说明
- 📄 **文档总结**: 快速提取关键信息
- 🌍 **文本翻译**: 支持多语言翻译
- 💭 **概念解释**: 智能解释复杂概念
- ❓ **智能问答**: 基于文档内容回答问题
- ✨ **内容优化**: 改进文本风格和表达
- 🏷️ **自动标签**: 智能生成相关标签

#### ⚠️ 费用提醒
- OpenAI API按使用量计费（约$0.002/1K tokens）
- 新用户通常有$5免费额度
- 建议在OpenAI控制台设置使用限额

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 打开浏览器
访问 [http://localhost:3000](http://localhost:3000)

### 5. 测试AI功能
1. 点击左侧工具栏的 🧠 **AI测试** 按钮
2. 在测试对话框中验证AI配置是否正确
3. 开始使用AI助手功能：
   - 在笔记编辑器中选择文本
   - 点击右侧 AI 助手面板
   - 选择需要的AI功能（总结、翻译等）

## 项目结构

```
ai-notion/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 主页面
│   │   └── globals.css     # 全局样式
│   ├── components/         # React组件
│   │   ├── NotesApp.tsx    # 主应用组件
│   │   ├── NoteEditor.tsx  # 笔记编辑器
│   │   ├── NoteList.tsx    # 笔记列表
│   │   ├── MarkdownPreview.tsx # Markdown预览
│   │   └── ThemeProvider.tsx   # 主题提供者
│   └── types/              # TypeScript类型定义
│       └── note.ts         # 笔记相关类型
├── public/                 # 静态资源
├── package.json           # 项目配置
├── tsconfig.json         # TypeScript配置
└── next.config.js        # Next.js配置
```

## 使用指南

### 创建笔记
1. 点击左侧边栏的 "+" 按钮
2. 输入笔记标题
3. 在编辑器中编写内容
4. 使用Ctrl+S保存笔记

### 编辑模式
- **编辑模式**: 在左侧编写Markdown内容
- **预览模式**: 在右侧查看渲染后的效果
- **标签管理**: 在标题下方添加和管理标签

### 导入功能
- **文件导入**: 点击左侧边栏的上传图标 📤
- **文件夹导入**: 点击左侧边栏的文件夹图标 📁
- **文件格式**: 支持 .md 和 .markdown 文件
- **批量导入**: 可同时选择多个文件或整个文件夹
- **智能解析**: 
  - 自动提取文档标题（从第一个#标题）
  - 基于内容自动生成相关标签
  - 文件夹导入时保留目录结构信息
  - 自动添加父文件夹名作为标签
  - 保持原有的Markdown格式

### 文件夹结构
- **双视图模式**: 支持列表视图和文件夹树视图
- **层级显示**: 完整保留导入文件的目录结构
- **文件夹折叠**: 可展开/折叠文件夹查看内容
- **视图切换**: 点击树形图标在两种视图间切换
- **智能排序**: 文件夹优先，文件按名称排序

### 搜索功能
- **文本搜索**: 在搜索框中输入关键词搜索标题和内容
- **标签搜索**: 点击任意标签快速搜索相关笔记
- **标签过滤**: 使用标签过滤区域进行分类浏览
- **清除搜索**: 点击搜索框的清除按钮或"All"标签重置
- **实时搜索**: 输入时实时显示搜索结果

### AI功能使用
1. **AI助手按钮**: 点击右下角的AI图标打开功能菜单
2. **智能摘要**: 为长文档生成简洁摘要
3. **多语言翻译**: 支持多种语言互译
4. **概念解释**: 输入概念获得详细解释
5. **智能问答**: 基于文档内容回答问题
6. **内容优化**: 调整文本风格（正式/轻松/学术/创意）
7. **自动标签**: 基于内容智能生成相关标签

### 快捷键
- `Ctrl + S`: 保存笔记
- `Tab`: 在编辑器中插入缩进
- 选中文本后使用AI功能可针对选中内容进行处理

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件