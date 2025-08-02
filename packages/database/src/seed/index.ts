import { createDatabase } from '../index';
import { 
  handbookChapters,
  handbookSections,
  handbookImages,
  questions, 
  questionOptions, 
  appConfigs,
  inviteCodes,
  users,
  type NewHandbookChapter,
  type NewHandbookSection,
  type NewHandbookImage,
  type NewQuestion,
  type NewQuestionOption,
  type NewAppConfig,
  type NewInviteCode,
  type NewUser
} from '../schema';

// 用户种子数据 - 展示不同登录方式
const usersSeed: NewUser[] = [
  {
    id: 'user-001',
    nickname: '张小明',
    email: 'zhangxiaoming@example.com',
    passwordHash: '$2b$10$rQZ7uYJhQ8eX9Y.X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', // password123
    primaryLoginMethod: 'EMAIL',
    province: 'ON',
    userType: 'MEMBER',
    emailVerified: true,
    phoneVerified: false,
    googleVerified: false,
    membershipEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
    lastLoginMethod: 'EMAIL',
  },
  {
    id: 'user-002',
    nickname: '李小红',
    phone: '+1234567890',
    passwordHash: '$2b$10$rQZ7uYJhQ8eX9Y.X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', // password123
    primaryLoginMethod: 'PHONE',
    province: 'BC',
    userType: 'TRIAL',
    emailVerified: false,
    phoneVerified: true,
    googleVerified: false,
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天试用
    lastLoginMethod: 'PHONE',
  },
  {
    id: 'user-003',
    nickname: 'John Smith',
    email: 'john.smith@gmail.com',
    googleId: 'google_123456789',
    primaryLoginMethod: 'GOOGLE',
    province: 'AB',
    userType: 'FREE',
    emailVerified: true,
    phoneVerified: false,
    googleVerified: true,
    lastLoginMethod: 'GOOGLE',
  },
  {
    id: 'user-admin',
    nickname: '管理员',
    email: 'admin@drivingtest.ca',
    passwordHash: '$2b$10$rQZ7uYJhQ8eX9Y.X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', // password123
    primaryLoginMethod: 'EMAIL',
    province: 'ON',
    userType: 'MEMBER',
    emailVerified: true,
    phoneVerified: false,
    googleVerified: false,
    lastLoginMethod: 'EMAIL',
  }
];

// 手册章节种子数据 - 重新设计
const handbookChaptersSeed: NewHandbookChapter[] = [
  {
    id: 'ch-001',
    title: '第一章：交通标志和信号',
    titleEn: 'Chapter 1: Traffic Signs and Signals',
    description: '学习基本的交通标志、信号灯和道路标记，为安全驾驶打下基础',
    descriptionEn: 'Learn basic traffic signs, signals and road markings to build a foundation for safe driving',
    order: 1,
    contentFormat: 'HTML',
    estimatedReadTime: 25,
    coverImageUrl: '/images/chapters/traffic-signs-cover.jpg',
    coverImageAlt: '交通标志示例图',
    paymentType: 'FREE',
    freePreviewSections: 3, // 前3个段落免费
    prerequisiteChapters: [],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-01-01'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  {
    id: 'ch-002',
    title: '第二章：道路规则与法规',
    titleEn: 'Chapter 2: Road Rules and Regulations',
    description: '掌握加拿大道路交通法规，了解各省份的具体规定',
    descriptionEn: 'Master Canadian traffic laws and understand specific regulations in each province',
    order: 2,
    contentFormat: 'HTML',
    estimatedReadTime: 35,
    coverImageUrl: '/images/chapters/road-rules-cover.jpg',
    coverImageAlt: '道路规则示意图',
    paymentType: 'TRIAL_INCLUDED',
    freePreviewSections: 2, // 前2个段落免费预览
    prerequisiteChapters: ['ch-001'],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-01-15'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  {
    id: 'ch-003',
    title: '第三章：安全驾驶技巧',
    titleEn: 'Chapter 3: Safe Driving Techniques',
    description: '学习防御性驾驶、恶劣天气驾驶和紧急情况处理',
    descriptionEn: 'Learn defensive driving, bad weather driving, and emergency situation handling',
    order: 3,
    contentFormat: 'HTML',
    estimatedReadTime: 40,
    coverImageUrl: '/images/chapters/safe-driving-cover.jpg',
    coverImageAlt: '安全驾驶技巧',
    paymentType: 'MEMBER_ONLY',
    freePreviewSections: 1, // 仅第1个段落免费预览
    prerequisiteChapters: ['ch-001', 'ch-002'],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-02-01'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
];

// 章节段落种子数据
const handbookSectionsSeed: NewHandbookSection[] = [
  // 第一章的段落
  {
    id: 'sec-001-001',
    chapterId: 'ch-001',
    title: '1.1 交通标志的分类',
    titleEn: '1.1 Classification of Traffic Signs',
    order: 1,
    content: `<div class="section-content">
      <h3>交通标志的基本分类</h3>
      <p>加拿大的交通标志按照功能和用途主要分为以下四大类：</p>
      
      <div class="sign-category">
        <h4>1. 警告标志 (Warning Signs)</h4>
        <p>警告标志通常为<strong>黄色背景配黑色图案</strong>，用于提醒驾驶员前方可能出现的危险或特殊情况。</p>
        <ul>
          <li>形状：通常为菱形</li>
          <li>颜色：黄色背景，黑色边框和符号</li>
          <li>作用：提前警告潜在危险</li>
        </ul>
        <img src="/images/signs/warning-signs.jpg" alt="警告标志示例" class="sign-image" />
      </div>
      
      <div class="sign-category">
        <h4>2. 禁令标志 (Regulatory Signs)</h4>
        <p>禁令标志告诉驾驶员必须做什么或不能做什么，具有法律约束力。</p>
        <ul>
          <li>形状：圆形、八边形或矩形</li>
          <li>颜色：通常为白色背景配红色边框</li>
          <li>作用：规定交通行为</li>
        </ul>
      </div>
    </div>`,
    contentEn: `<div class="section-content">
      <h3>Basic Classification of Traffic Signs</h3>
      <p>Traffic signs in Canada are mainly classified into four major categories based on their function and purpose:</p>
      
      <div class="sign-category">
        <h4>1. Warning Signs</h4>
        <p>Warning signs usually have a <strong>yellow background with black patterns</strong> to alert drivers of possible dangers or special conditions ahead.</p>
        <ul>
          <li>Shape: Usually diamond-shaped</li>
          <li>Color: Yellow background with black border and symbols</li>
          <li>Purpose: Advance warning of potential hazards</li>
        </ul>
        <img src="/images/signs/warning-signs.jpg" alt="Warning signs examples" class="sign-image" />
      </div>
      
      <div class="sign-category">
        <h4>2. Regulatory Signs</h4>
        <p>Regulatory signs tell drivers what they must do or cannot do, and are legally binding.</p>
        <ul>
          <li>Shape: Circular, octagonal, or rectangular</li>
          <li>Color: Usually white background with red border</li>
          <li>Purpose: Regulate traffic behavior</li>
        </ul>
      </div>
    </div>`,
    isFree: true,
    requiredUserType: ['FREE'],
    wordCount: 280,
    estimatedReadTime: 85, // 秒
  },
  {
    id: 'sec-001-002',
    chapterId: 'ch-001',
    title: '1.2 信号灯系统',
    titleEn: '1.2 Traffic Light Systems',
    order: 2,
    content: `<div class="section-content">
      <h3>标准三色信号灯</h3>
      <p>加拿大使用标准的三色交通信号灯系统：</p>
      
      <div class="traffic-light">
        <div class="light red">
          <h4>🔴 红灯 (Red Light)</h4>
          <p><strong>完全停止</strong> - 车辆必须在停止线前完全停车，等待绿灯。</p>
          <ul>
            <li>禁止直行</li>
            <li>禁止左转和右转（除非有特殊标志允许）</li>
            <li>行人也必须等待</li>
          </ul>
        </div>
        
        <div class="light yellow">
          <h4>🟡 黄灯 (Yellow Light)</h4>
          <p><strong>准备停车</strong> - 如果能够安全停车，应该停车等待。</p>
          <ul>
            <li>评估是否能安全停车</li>
            <li>如果无法安全停车，谨慎通过</li>
            <li>不要加速抢黄灯</li>
          </ul>
        </div>
        
        <div class="light green">
          <h4>🟢 绿灯 (Green Light)</h4>
          <p><strong>安全通行</strong> - 确认路口安全后方可通行。</p>
          <ul>
            <li>确认对向和横向无来车</li>
            <li>注意行人和自行车</li>
            <li>左转时礼让对向直行车辆</li>
          </ul>
        </div>
      </div>
    </div>`,
    contentEn: `<div class="section-content">
      <h3>Standard Three-Color Traffic Lights</h3>
      <p>Canada uses the standard three-color traffic light system:</p>
      
      <div class="traffic-light">
        <div class="light red">
          <h4>🔴 Red Light</h4>
          <p><strong>Complete Stop</strong> - Vehicles must come to a complete stop before the stop line and wait for green.</p>
          <ul>
            <li>No going straight</li>
            <li>No left or right turns (unless special signs permit)</li>
            <li>Pedestrians must also wait</li>
          </ul>
        </div>
        
        <div class="light yellow">
          <h4>🟡 Yellow Light</h4>
          <p><strong>Prepare to Stop</strong> - If you can stop safely, you should stop and wait.</p>
          <ul>
            <li>Assess if you can stop safely</li>
            <li>If unable to stop safely, proceed with caution</li>
            <li>Do not speed up to beat the yellow light</li>
          </ul>
        </div>
        
        <div class="light green">
          <h4>🟢 Green Light</h4>
          <p><strong>Proceed Safely</strong> - Confirm the intersection is safe before proceeding.</p>
          <ul>
            <li>Check for oncoming and cross traffic</li>
            <li>Watch for pedestrians and cyclists</li>
            <li>Yield to oncoming traffic when turning left</li>
          </ul>
        </div>
      </div>
    </div>`,
    isFree: true,
    requiredUserType: ['FREE'],
    wordCount: 320,
    estimatedReadTime: 95,
  },
  {
    id: 'sec-001-003',
    chapterId: 'ch-001',
    title: '1.3 特殊信号和标记',
    titleEn: '1.3 Special Signals and Markings',
    order: 3,
    content: `<div class="section-content">
      <h3>特殊交通信号</h3>
      
      <div class="special-signals">
        <h4>闪烁信号灯</h4>
        <ul>
          <li><strong>红灯闪烁</strong> = 停车标志 (Stop sign)</li>
          <li><strong>黄灯闪烁</strong> = 谨慎通过 (Proceed with caution)</li>
        </ul>
        
        <h4>行人过街信号</h4>
        <div class="pedestrian-signals">
          <p>🚶 白色人形 - 行人可以通过</p>
          <p>🚶‍♂️ 闪烁橙色人形 - 已在路口的行人快速通过，其他人不要开始过街</p>
          <p>🚫 橙色手掌 - 行人不得进入路口</p>
        </div>
        
        <h4>道路标线</h4>
        <ul>
          <li><strong>实线</strong> - 不得跨越</li>
          <li><strong>虚线</strong> - 可以跨越超车</li>
          <li><strong>双黄实线</strong> - 禁止超车</li>
          <li><strong>斑马线</strong> - 行人过街区域</li>
        </ul>
      </div>
    </div>`,
    contentEn: `<div class="section-content">
      <h3>Special Traffic Signals</h3>
      
      <div class="special-signals">
        <h4>Flashing Signal Lights</h4>
        <ul>
          <li><strong>Flashing Red</strong> = Stop sign</li>
          <li><strong>Flashing Yellow</strong> = Proceed with caution</li>
        </ul>
        
        <h4>Pedestrian Crossing Signals</h4>
        <div class="pedestrian-signals">
          <p>🚶 White walking figure - Pedestrians may cross</p>
          <p>🚶‍♂️ Flashing orange figure - Pedestrians already in intersection should finish crossing quickly, others should not start</p>
          <p>🚫 Orange hand - Pedestrians must not enter intersection</p>
        </div>
        
        <h4>Road Markings</h4>
        <ul>
          <li><strong>Solid line</strong> - Do not cross</li>
          <li><strong>Dashed line</strong> - May cross to pass</li>
          <li><strong>Double solid yellow</strong> - No passing</li>
          <li><strong>Crosswalk</strong> - Pedestrian crossing area</li>
        </ul>
      </div>
    </div>`,
    isFree: true,
    requiredUserType: ['FREE'],
    wordCount: 250,
    estimatedReadTime: 75,
  },
  {
    id: 'sec-001-004',
    chapterId: 'ch-001',
    title: '1.4 省份特殊标志',
    titleEn: '1.4 Province-Specific Signs',
    order: 4,
    content: `<div class="section-content">
      <h3>各省特殊交通标志</h3>
      <p>虽然加拿大大部分交通标志是统一的，但各省份也有一些特殊的标志和规定：</p>
      
      <div class="province-signs">
        <h4>安大略省 (Ontario)</h4>
        <ul>
          <li>高乘载车道 (HOV Lane) 标志</li>
          <li>限制通行时间标志</li>
          <li>学校区域特殊限速标志</li>
        </ul>
        
        <h4>不列颠哥伦比亚省 (British Columbia)</h4>
        <ul>
          <li>冬季轮胎要求标志</li>
          <li>链条要求区域标志</li>
          <li>山区驾驶警告标志</li>
        </ul>
        
        <h4>阿尔伯塔省 (Alberta)</h4>
        <ul>
          <li>野生动物出没警告</li>
          <li>石油工业车辆警告</li>
          <li>农业设备共享道路标志</li>
        </ul>
      </div>
      
      <div class="important-note">
        <p><strong>重要提醒：</strong>在考试前，请确保了解您所在省份的特殊标志和规定。</p>
      </div>
    </div>`,
    contentEn: `<div class="section-content">
      <h3>Province-Specific Traffic Signs</h3>
      <p>While most traffic signs in Canada are standardized, each province also has some special signs and regulations:</p>
      
      <div class="province-signs">
        <h4>Ontario</h4>
        <ul>
          <li>HOV (High Occupancy Vehicle) Lane signs</li>
          <li>Time-restricted access signs</li>
          <li>School zone special speed limit signs</li>
        </ul>
        
        <h4>British Columbia</h4>
        <ul>
          <li>Winter tire requirement signs</li>
          <li>Chain requirement zone signs</li>
          <li>Mountain driving warning signs</li>
        </ul>
        
        <h4>Alberta</h4>
        <ul>
          <li>Wildlife crossing warnings</li>
          <li>Oil industry vehicle warnings</li>
          <li>Agricultural equipment sharing road signs</li>
        </ul>
      </div>
      
      <div class="important-note">
        <p><strong>Important Note:</strong> Before taking the test, make sure you understand the special signs and regulations in your province.</p>
      </div>
    </div>`,
    isFree: false,
    requiredUserType: ['TRIAL', 'MEMBER'],
    wordCount: 300,
    estimatedReadTime: 90,
  },
];

// 图片资源种子数据
const handbookImagesSeed: NewHandbookImage[] = [
  {
    id: 'img-001',
    chapterId: 'ch-001',
    sectionId: 'sec-001-001',
    filename: 'warning-signs-collection.jpg',
    originalName: '警告标志合集.jpg',
    fileUrl: '/images/handbook/warning-signs-collection.jpg',
    fileSize: 248576,
    mimeType: 'image/jpeg',
    width: 800,
    height: 600,
    altText: '常见警告标志集合',
    caption: '加拿大常见的警告标志示例',
    captionEn: 'Examples of common warning signs in Canada',
    usage: 'content',
    order: 1,
    uploadedBy: 'user-admin',
  },
  {
    id: 'img-002',
    chapterId: 'ch-001',
    filename: 'traffic-lights-diagram.png',
    originalName: '交通信号灯示意图.png',
    fileUrl: '/images/handbook/traffic-lights-diagram.png',
    fileSize: 156432,
    mimeType: 'image/png',
    width: 400,
    height: 300,
    altText: '标准交通信号灯示意图',
    caption: '标准三色交通信号灯及其含义',
    captionEn: 'Standard three-color traffic lights and their meanings',
    usage: 'diagram',
    order: 1,
    uploadedBy: 'user-admin',
  },
  {
    id: 'img-003',
    chapterId: 'ch-001',
    filename: 'chapter1-cover.jpg',
    originalName: '第一章封面.jpg',
    fileUrl: '/images/chapters/traffic-signs-cover.jpg',
    fileSize: 325678,
    mimeType: 'image/jpeg',
    width: 1200,
    height: 800,
    altText: '交通标志和信号章节封面',
    caption: '第一章：交通标志和信号',
    captionEn: 'Chapter 1: Traffic Signs and Signals',
    usage: 'cover',
    order: 0,
    uploadedBy: 'user-admin',
  },
];

// 题目种子数据（基于新的章节结构）
const questionsSeed: NewQuestion[] = [
  {
    id: 'q-001',
    chapterId: 'ch-001',
    type: 'SINGLE_CHOICE',
    title: '当看到红灯时，驾驶员应该：',
    titleEn: 'When seeing a red light, the driver should:',
    content: '在交通信号灯显示红灯时，正确的做法是什么？',
    contentEn: 'What is the correct action when traffic lights show red?',
    explanation: '红灯表示禁止通行，所有车辆必须在停止线前完全停车。',
    explanationEn: 'Red light means no entry, all vehicles must come to a complete stop before the stop line.',
    difficulty: 1,
    tags: ['交通信号', '基础知识'],
  },
  {
    id: 'q-002',
    chapterId: 'ch-001',
    type: 'SINGLE_CHOICE',
    title: '黄灯闪烁表示：',
    titleEn: 'A flashing yellow light means:',
    content: '当交通信号灯显示黄灯闪烁时，驾驶员应该如何行动？',
    contentEn: 'How should a driver act when traffic lights show a flashing yellow?',
    explanation: '黄灯闪烁表示谨慎通过，驾驶员需要减速并注意其他车辆和行人。',
    explanationEn: 'Flashing yellow means proceed with caution, drivers need to slow down and watch for other vehicles and pedestrians.',
    difficulty: 2,
    tags: ['交通信号', '谨慎驾驶'],
  },
];

// 题目选项种子数据
const questionOptionsSeed: NewQuestionOption[] = [
  // 题目 q-001 的选项
  {
    id: 'opt-001-1',
    questionId: 'q-001',
    text: '立即停车',
    textEn: 'Stop immediately',
    isCorrect: true,
    order: 1,
  },
  {
    id: 'opt-001-2',
    questionId: 'q-001',
    text: '减速慢行',
    textEn: 'Slow down',
    isCorrect: false,
    order: 2,
  },
  {
    id: 'opt-001-3',
    questionId: 'q-001',
    text: '快速通过',
    textEn: 'Pass quickly',
    isCorrect: false,
    order: 3,
  },
  {
    id: 'opt-001-4',
    questionId: 'q-001',
    text: '鸣笛通过',
    textEn: 'Honk and pass',
    isCorrect: false,
    order: 4,
  },
  // 题目 q-002 的选项
  {
    id: 'opt-002-1',
    questionId: 'q-002',
    text: '停车等待',
    textEn: 'Stop and wait',
    isCorrect: false,
    order: 1,
  },
  {
    id: 'opt-002-2',
    questionId: 'q-002',
    text: '谨慎通过',
    textEn: 'Proceed with caution',
    isCorrect: true,
    order: 2,
  },
  {
    id: 'opt-002-3',
    questionId: 'q-002',
    text: '正常通过',
    textEn: 'Proceed normally',
    isCorrect: false,
    order: 3,
  },
  {
    id: 'opt-002-4',
    questionId: 'q-002',
    text: '加速通过',
    textEn: 'Speed up and pass',
    isCorrect: false,
    order: 4,
  },
];

// 应用配置种子数据
const appConfigsSeed: NewAppConfig[] = [
  {
    id: 'config-001',
    key: 'SIMULATION_PASS_SCORE',
    value: '25',
    description: '模拟考试通过分数（总分30分）',
    isPublic: true,
  },
  {
    id: 'config-002',
    key: 'TRIAL_DURATION_DAYS',
    value: '3',
    description: '试用期天数',
    isPublic: true,
  },
  {
    id: 'config-003',
    key: 'FREE_CHAPTERS_COUNT',
    value: '1',
    description: '免费章节数量',
    isPublic: true,
  },
  {
    id: 'config-004',
    key: 'SIMULATION_QUESTION_COUNT',
    value: '30',
    description: '模拟考试题目数量',
    isPublic: true,
  },
  {
    id: 'config-005',
    key: 'GOOGLE_OAUTH_ENABLED',
    value: 'true',
    description: '是否启用Google OAuth登录',
    isPublic: true,
  },
  {
    id: 'config-006',
    key: 'PHONE_LOGIN_ENABLED',
    value: 'true',
    description: '是否启用手机号登录',
    isPublic: true,
  },
  {
    id: 'config-007',
    key: 'RICH_TEXT_EDITOR_ENABLED',
    value: 'true',
    description: '管理端是否启用富文本编辑器',
    isPublic: false,
  },
  {
    id: 'config-008',
    key: 'MAX_IMAGE_SIZE_MB',
    value: '5',
    description: '图片上传最大尺寸（MB）',
    isPublic: false,
  },
];

// 邀请码种子数据
const inviteCodesSeed: NewInviteCode[] = [
  {
    id: 'invite-001',
    code: 'WELCOME123',
    trialDays: 7,
    maxUses: 100,
    currentUses: 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
    isActive: true,
  },
  {
    id: 'invite-002',
    code: 'STUDENT50',
    trialDays: 14,
    maxUses: 50,
    currentUses: 0,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后过期
    isActive: true,
  },
  {
    id: 'invite-003',
    code: 'GOOGLE2024',
    trialDays: 5,
    maxUses: 200,
    currentUses: 15,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90天后过期
    isActive: true,
  },
];

// 执行种子数据插入
export async function seedDatabase() {
  console.log('开始插入种子数据...');
  
  const { db, close } = createDatabase();
  
  try {
    // 插入用户数据
    console.log('插入用户数据...');
    await db.insert(users).values(usersSeed);
    
    // 插入手册章节
    console.log('插入手册章节数据...');
    await db.insert(handbookChapters).values(handbookChaptersSeed);
    
    // 插入章节段落
    console.log('插入章节段落数据...');
    await db.insert(handbookSections).values(handbookSectionsSeed);
    
    // 插入图片资源
    console.log('插入图片资源数据...');
    await db.insert(handbookImages).values(handbookImagesSeed);
    
    // 插入题目
    console.log('插入题目数据...');
    await db.insert(questions).values(questionsSeed);
    
    // 插入题目选项
    console.log('插入题目选项数据...');
    await db.insert(questionOptions).values(questionOptionsSeed);
    
    // 插入应用配置
    console.log('插入应用配置数据...');
    await db.insert(appConfigs).values(appConfigsSeed);
    
    // 插入邀请码
    console.log('插入邀请码数据...');
    await db.insert(inviteCodes).values(inviteCodesSeed);
    
    console.log('种子数据插入完成！');
  } catch (error) {
    console.error('插入种子数据时出错:', error);
    throw error;
  } finally {
    await close();
  }
}

// 如果直接运行此文件，则执行种子数据插入
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('种子数据插入成功！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('种子数据插入失败:', error);
      process.exit(1);
    });
} 