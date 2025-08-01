import { Note } from '@/types/note';
import { v4 as uuidv4 } from 'uuid';

export const createDemoNotes = (): Note[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: uuidv4(),
      title: 'AI Notion 功能介绍',
      content: `# AI Notion - 智能笔记助手

欢迎使用 AI Notion！这是一个集成了AI功能的现代化笔记应用。

## 🚀 主要功能

### 📝 笔记编辑
- **Markdown 支持**: 完整的Markdown语法支持
- **实时预览**: 边写边看，所见即所得
- **语法高亮**: 代码块自动高亮显示

### 🤖 AI 智能助手
点击右下角的AI图标，体验以下功能：

1. **智能摘要** - 为长文档生成简洁摘要
2. **多语言翻译** - 支持多种语言互译
3. **概念解释** - 解释复杂概念和术语
4. **智能问答** - 基于文档内容回答问题
5. **内容优化** - 调整文本风格和表达
6. **自动标签** - 智能生成相关标签

### 🔍 智能搜索
- 全文搜索功能
- 标签过滤
- 实时搜索结果

## 💡 使用技巧

### 快捷键
- \`Ctrl + S\`: 保存笔记
- 选中文本后使用AI功能可针对选中内容进行处理

### 标签管理
- 在标题下方的输入框中添加标签
- 点击标签可以进行过滤

## 🛠 技术栈
- Next.js 14 + TypeScript
- Material-UI 组件库
- OpenAI API 集成
- 本地存储支持

试试选中这段文字，然后点击AI助手按钮体验AI功能吧！`,
      tags: ['介绍', 'AI', '功能', '使用指南', '笔记应用'],
      createdAt: now,
      updatedAt: now,
      isBookmarked: true,
    },
    {
      id: uuidv4(),
      title: 'React Hooks 学习笔记',
      content: `# React Hooks 深入理解

## useState Hook

\`useState\` 是最基础的 Hook，用于在函数组件中添加状态。

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## useEffect Hook

\`useEffect\` 用于处理副作用，相当于 \`componentDidMount\`、\`componentDidUpdate\` 和 \`componentWillUnmount\` 的组合。

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## 自定义 Hook

自定义 Hook 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

\`\`\`javascript
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
\`\`\`

## Hook 规则

1. 只在最顶层使用 Hook
2. 只在 React 函数中调用 Hook
3. 自定义 Hook 必须以 "use" 开头`,
      tags: ['React', 'JavaScript', '前端开发', 'Hooks', '组件'],
      createdAt: yesterday,
      updatedAt: yesterday,
      isBookmarked: false,
    },
    {
      id: uuidv4(),
      title: 'TypeScript 类型系统',
      content: `# TypeScript 类型系统详解

TypeScript 是 JavaScript 的超集，添加了静态类型检查。

## 基础类型

\`\`\`typescript
// 基本类型
let isDone: boolean = false;
let decimal: number = 6;
let color: string = "blue";
let list: number[] = [1, 2, 3];
let x: [string, number] = ["hello", 10]; // 元组

// 枚举
enum Color {Red, Green, Blue}
let c: Color = Color.Green;

// Any 类型
let notSure: any = 4;
notSure = "maybe a string instead";

// Void 类型
function warnUser(): void {
    console.log("This is my warning message");
}
\`\`\`

## 接口 (Interfaces)

\`\`\`typescript
interface Person {
  firstName: string;
  lastName: string;
  age?: number; // 可选属性
  readonly id: number; // 只读属性
}

function greeter(person: Person) {
  return "Hello, " + person.firstName + " " + person.lastName;
}
\`\`\`

## 泛型 (Generics)

\`\`\`typescript
function identity<T>(arg: T): T {
    return arg;
}

let output = identity<string>("myString");
let output2 = identity("myString"); // 类型推断

// 泛型接口
interface GenericIdentityFn<T> {
    (arg: T): T;
}
\`\`\`

## 联合类型与交叉类型

\`\`\`typescript
// 联合类型
type StringOrNumber = string | number;

// 交叉类型
type PersonWithAge = Person & { age: number };
\`\`\`

TypeScript 的类型系统非常强大，可以帮助我们在编译时发现错误。`,
      tags: ['TypeScript', '类型系统', '前端开发', '编程语言', '静态类型'],
      createdAt: lastWeek,
      updatedAt: lastWeek,
      isBookmarked: true,
    },
    {
      id: uuidv4(),
      title: '长内容滚动测试',
      content: `# 长内容滚动测试

这是一个用于测试预览区域滚动功能的长文档。

## 第一部分：介绍

这个文档包含了大量的内容，用于测试预览界面的垂直滚动功能是否正常工作。

## 第二部分：详细内容

### 2.1 子章节一

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### 2.2 子章节二

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### 2.3 代码示例

\`\`\`javascript
function testScrolling() {
  console.log('测试滚动功能');
  
  // 这是一段示例代码
  const elements = document.querySelectorAll('.scroll-test');
  elements.forEach(element => {
    element.addEventListener('scroll', () => {
      console.log('滚动事件触发');
    });
  });
}
\`\`\`

## 第三部分：更多内容

### 3.1 列表内容

1. 第一项内容
2. 第二项内容
3. 第三项内容
4. 第四项内容
5. 第五项内容

### 3.2 无序列表

- 项目 A
- 项目 B
- 项目 C
- 项目 D
- 项目 E

### 3.3 表格示例

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
| 数据7 | 数据8 | 数据9 |

## 第四部分：引用内容

> 这是一个引用块。
> 它包含了多行内容。
> 用于测试引用样式的显示效果。

## 第五部分：更多测试内容

这里添加更多内容来确保页面足够长，需要滚动才能看到全部内容。

### 5.1 技术说明

在Web开发中，滚动是一个重要的用户交互功能。正确实现滚动可以提升用户体验。

### 5.2 实现细节

滚动功能的实现需要考虑以下几个方面：

1. **容器高度设置**：确保容器有固定高度
2. **overflow属性**：设置为auto或scroll
3. **内容高度**：内容高度超过容器高度时才会出现滚动条
4. **CSS Flexbox**：正确使用flex布局

### 5.3 常见问题

- 滚动条不出现
- 滚动不流畅
- 滚动区域计算错误
- 移动端滚动问题

## 第六部分：结论

通过这个长文档，我们可以测试预览界面的滚动功能是否正常工作。如果你能看到这一部分，说明滚动功能运行正常！

### 6.1 最终测试

这是文档的最后一部分。如果滚动功能正常，你应该能够从文档顶部滚动到这里。

### 6.2 感谢

感谢您测试这个滚动功能！

---

**测试完成时间**: ${new Date().toLocaleString()}

**文档状态**: 滚动测试通过 ✅`,
      tags: ['测试', '滚动', 'UI', '长内容', '预览'],
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30分钟前
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      isBookmarked: false,
    },
  ];
};

export const loadDemoData = () => {
  const existingNotes = localStorage.getItem('ai-notion-notes');
  if (!existingNotes) {
    const demoNotes = createDemoNotes();
    localStorage.setItem('ai-notion-notes', JSON.stringify(demoNotes));
    return demoNotes;
  }
  return JSON.parse(existingNotes);
};