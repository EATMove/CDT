# 加拿大驾考 App - 移动端应用

📱 专为中国用户设计的加拿大驾考学习应用，基于 React Native + Expo 开发。

## 🚧 开发状态

**当前状态**: 架构就绪，核心功能待开发

- ✅ **项目配置**: Expo + TypeScript + NativeWind 已配置
- ✅ **导航结构**: React Navigation 基础路由
- ✅ **状态管理**: Zustand store 结构设计
- ✅ **API集成**: 后端API接口已就绪
- 🔲 **界面实现**: 19个核心屏幕待开发
- 🔲 **功能逻辑**: 用户交互和业务逻辑
- 🔲 **测试验证**: 功能测试和设备兼容性

## 📋 功能规划

### 🔐 **用户认证模块**
- **屏幕1**: 省份选择 (AB/BC/ON)
- **屏幕2**: 登录首页 (微信/邮箱/手机选择)
- **屏幕3**: 邮箱登录
- **屏幕4**: 邮箱注册

### 📚 **学习模块** 
- **屏幕9**: 驾驶手册首页 (章节列表)
- **屏幕10**: 手册阅读页面 (滚动阅读、进度追踪)

### 🧠 **练习模块**
- **屏幕12**: 章节练习入口 (选择练习章节)
- **屏幕13**: 练习页面 (题目展示、选项选择)
- **屏幕16**: 练习总结 (成绩统计、错题回顾)

### 🎯 **模拟考试**
- **屏幕19**: 模拟考试列表 (考试套题)
- **屏幕20**: 模拟考试界面 (30题限时)
- **屏幕23**: 考试总结 (通过/不通过判定)

### 📝 **错题管理**
- **屏幕26**: 错题本 (历史错题复习)

### 👤 **个人中心**
- **屏幕30**: 用户资料 (会员状态、邀请码、设置)

## 🛠️ 技术栈

### 核心框架
- **Expo 52** - 跨平台开发框架
- **React Native** - 移动端UI框架
- **TypeScript** - 类型安全开发
- **React Navigation** - 路由导航

### 状态管理
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 服务端状态管理
- **AsyncStorage** - 本地数据持久化

### UI 和样式
- **NativeWind** - Tailwind CSS for React Native
- **Expo Vector Icons** - 图标库
- **React Native Reanimated** - 动画库

### 工具和服务
- **Expo Router** - 文件系统路由
- **Expo Updates** - OTA 更新
- **Expo Notifications** - 推送通知

## 🚀 快速开始

### 环境要求

- Node.js 20+
- Expo CLI
- iOS 模拟器 / Android 模拟器
- 真机测试 (推荐)

### 开发流程

```bash
# 进入移动端目录
cd apps/mobile

# 安装依赖 (如果还未安装)
pnpm install

# 启动开发服务器
pnpm dev

# 在 iOS 模拟器运行
pnpm ios

# 在 Android 模拟器运行  
pnpm android

# 在浏览器运行 (调试用)
pnpm web
```

### 真机测试

```bash
# 安装 Expo Go 应用
# iOS: App Store 搜索 "Expo Go"
# Android: Google Play 搜索 "Expo Go"

# 启动开发服务器
pnpm dev

# 扫描二维码即可在真机测试
```

## 📱 屏幕设计规范

### 设计原则

1. **移动优先**: 针对手机屏幕优化
2. **中文友好**: 字体、间距适配中文显示
3. **简洁直观**: 减少认知负担，突出核心功能
4. **一致性**: 统一的交互模式和视觉风格
5. **无障碍**: 支持辅助功能和不同设备

### 通用组件

```typescript
// 示例：通用按钮组件
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// 示例：输入框组件
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
}
```

### 响应式设计

```typescript
// 屏幕尺寸适配
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: width > 400 ? 20 : 16,
    paddingVertical: height > 800 ? 24 : 20,
  },
  
  title: {
    fontSize: width > 400 ? 24 : 20,
    lineHeight: width > 400 ? 32 : 28,
  },
});
```

## 🔄 状态管理

### Zustand Store 结构

```typescript
// stores/userStore.ts
interface UserState {
  user: User | null;
  province: Province;
  userType: UserType;
  isLoggedIn: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setProvince: (province: Province) => void;
  logout: () => void;
}

// stores/learningStore.ts  
interface LearningState {
  currentChapter: string | null;
  readingProgress: Record<string, number>;
  completedChapters: string[];
  bookmarks: Bookmark[];
  
  // Actions
  updateProgress: (chapterId: string, progress: number) => void;
  markChapterComplete: (chapterId: string) => void;
  addBookmark: (bookmark: Bookmark) => void;
}

// stores/quizStore.ts
interface QuizState {
  currentSession: QuizSession | null;
  wrongQuestions: Question[];
  practiceHistory: PracticeRecord[];
  
  // Actions
  startQuiz: (chapterId: string, type: QuizType) => void;
  submitAnswer: (questionId: string, answer: string[]) => void;
  endQuiz: () => void;
}
```

### API 调用

```typescript
// hooks/useApi.ts
export function useChapters(userType: UserType, language: Language) {
  return useQuery({
    queryKey: ['chapters', userType, language],
    queryFn: () => api.getChapters({ userType, language }),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}

export function useChapterContent(chapterId: string, userType: UserType) {
  return useQuery({
    queryKey: ['chapter-content', chapterId, userType],
    queryFn: () => api.getChapterContent(chapterId, { userType }),
    enabled: !!chapterId,
  });
}
```

## 🎨 UI/UX 设计指南

### 颜色规范

```typescript
// constants/Colors.ts
export const Colors = {
  // 主色调
  primary: '#2563EB',      // 蓝色主色
  primaryDark: '#1D4ED8',  // 深蓝色
  primaryLight: '#93C5FD', // 浅蓝色
  
  // 辅助色
  secondary: '#64748B',    // 灰色
  success: '#10B981',      // 绿色
  warning: '#F59E0B',      // 黄色
  error: '#EF4444',        // 红色
  
  // 背景色
  background: '#FFFFFF',   // 白色背景
  surface: '#F8FAFC',      // 浅灰背景
  border: '#E2E8F0',       // 边框色
  
  // 文字色
  text: '#1E293B',         // 主文字
  textSecondary: '#64748B', // 次要文字
  textMuted: '#94A3B8',     // 弱化文字
};
```

### 字体规范

```typescript
// constants/Typography.ts
export const Typography = {
  // 标题
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  
  // 正文
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  
  // 特殊
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
};
```

### 间距规范

```typescript
// constants/Spacing.ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // 特殊间距
  screenPadding: 20,      // 屏幕边距
  cardPadding: 16,        // 卡片内边距
  buttonPadding: 12,      // 按钮内边距
  sectionSpacing: 32,     // 区块间距
};
```

## 🔧 开发工具

### 调试工具

```bash
# React Native 调试
pnpm run ios --device           # 真机调试
pnpm run android --device      # 真机调试

# 性能分析
npx react-native log-ios       # iOS 日志
npx react-native log-android   # Android 日志

# 网络调试
# 在 Expo Dev Tools 中开启 Network inspector
```

### 代码质量

```bash
# 类型检查
pnpm type-check

# 代码格式化
pnpm prettier

# 构建检查
pnpm build
```

## 📦 构建和发布

### 开发构建

```bash
# Expo 开发构建
eas build --platform ios --profile development
eas build --platform android --profile development
```

### 生产构建

```bash
# 应用商店版本
eas build --platform ios --profile production
eas build --platform android --profile production

# 提交到应用商店
eas submit --platform ios
eas submit --platform android
```

### OTA 更新

```bash
# 发布更新
eas update --branch production --message "修复登录问题"

# 查看更新历史
eas update:list --branch production
```

## 🧪 测试策略

### 单元测试

```bash
# 运行测试
pnpm test

# 监听模式
pnpm test --watch

# 覆盖率报告
pnpm test --coverage
```

### 设备测试

- **iOS**: iPhone 12/13/14/15 系列
- **Android**: 主流 Android 设备 (API 21+)
- **屏幕**: 4.7寸 - 6.7寸范围
- **分辨率**: 375x667 - 428x926

## 🚀 开发计划

### Phase 1: 核心功能 (2-3周)
- [ ] 用户认证流程
- [ ] 省份选择和设置
- [ ] 基础导航结构
- [ ] API 接口集成

### Phase 2: 学习功能 (3-4周)
- [ ] 手册阅读界面
- [ ] 章节练习功能
- [ ] 进度追踪系统
- [ ] 错题本功能

### Phase 3: 测试功能 (2-3周)
- [ ] 模拟考试系统
- [ ] 成绩统计分析
- [ ] 复习推荐算法

### Phase 4: 完善优化 (1-2周)
- [ ] 用户中心功能
- [ ] 会员系统集成
- [ ] 性能优化
- [ ] 应用商店准备

## 📚 相关资源

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [NativeWind 文档](https://www.nativewind.dev/)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [TanStack Query 文档](https://tanstack.com/query/latest)

## 🤝 贡献指南

1. 创建功能分支
2. 开发功能模块
3. 编写单元测试
4. 提交代码审查
5. 合并到主分支

---

**📱 让我们构建最棒的驾考学习应用！🚀** 