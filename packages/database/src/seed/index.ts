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
    passwordHash: '$2b$10$rQZ7uYJhQ8eX9Y.X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', // password123
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
    passwordHash: '$2b$10$rQZ7uYJhQ8eX9Y.X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', // password123
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
    passwordHash: '$2b$10$rQZ7uYJhQ8eX9Y.X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', // password123
    primaryLoginMethod: 'EMAIL',
    province: 'ON',
    userType: 'MEMBER',
    emailVerified: true,
    phoneVerified: false,
    googleVerified: false,
    lastLoginMethod: 'EMAIL',
  }
];

// 手册章节种子数据 - 按省份分组的章节
const handbookChaptersSeed: NewHandbookChapter[] = [
  // 安大略省 (ON) 章节
  {
    id: 'ch-on-001',
    title: '第一章：安大略省交通标志和信号',
    titleEn: 'Chapter 1: Ontario Traffic Signs and Signals',
    description: '学习安大略省特有的交通标志、信号灯和道路标记',
    descriptionEn: 'Learn Ontario-specific traffic signs, signals and road markings',
    order: 1,
    province: 'ON',
    contentFormat: 'HTML',
    estimatedReadTime: 25,
    coverImageUrl: '/images/chapters/on-traffic-signs-cover.jpg',
    coverImageAlt: '安大略省交通标志示例图',
    paymentType: 'FREE',
    freePreviewSections: 3,
    prerequisiteChapters: [],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-01-01'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  {
    id: 'ch-on-002',
    title: '第二章：安大略省道路规则与法规',
    titleEn: 'Chapter 2: Ontario Road Rules and Regulations',
    description: '掌握安大略省道路交通法规和具体规定',
    descriptionEn: 'Master Ontario traffic laws and specific regulations',
    order: 2,
    province: 'ON',
    contentFormat: 'HTML',
    estimatedReadTime: 35,
    coverImageUrl: '/images/chapters/on-road-rules-cover.jpg',
    coverImageAlt: '安大略省道路规则示意图',
    paymentType: 'TRIAL_INCLUDED',
    freePreviewSections: 2,
    prerequisiteChapters: ['ch-on-001'],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-01-15'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  {
    id: 'ch-on-003',
    title: '第三章：安大略省安全驾驶技巧',
    titleEn: 'Chapter 3: Ontario Safe Driving Techniques',
    description: '学习安大略省特有的驾驶技巧和注意事项',
    descriptionEn: 'Learn Ontario-specific driving techniques and precautions',
    order: 3,
    province: 'ON',
    contentFormat: 'HTML',
    estimatedReadTime: 40,
    coverImageUrl: '/images/chapters/on-safe-driving-cover.jpg',
    coverImageAlt: '安大略省安全驾驶技巧',
    paymentType: 'MEMBER_ONLY',
    freePreviewSections: 1,
    prerequisiteChapters: ['ch-on-001', 'ch-on-002'],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-02-01'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  
  // 不列颠哥伦比亚省 (BC) 章节
  {
    id: 'ch-bc-001',
    title: '第一章：BC省交通标志和信号',
    titleEn: 'Chapter 1: BC Traffic Signs and Signals',
    description: '学习BC省特有的交通标志、信号灯和道路标记',
    descriptionEn: 'Learn BC-specific traffic signs, signals and road markings',
    order: 1,
    province: 'BC',
    contentFormat: 'HTML',
    estimatedReadTime: 25,
    coverImageUrl: '/images/chapters/bc-traffic-signs-cover.jpg',
    coverImageAlt: 'BC省交通标志示例图',
    paymentType: 'FREE',
    freePreviewSections: 3,
    prerequisiteChapters: [],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-01-01'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  {
    id: 'ch-bc-002',
    title: '第二章：BC省道路规则与法规',
    titleEn: 'Chapter 2: BC Road Rules and Regulations',
    description: '掌握BC省道路交通法规和具体规定',
    descriptionEn: 'Master BC traffic laws and specific regulations',
    order: 2,
    province: 'BC',
    contentFormat: 'HTML',
    estimatedReadTime: 35,
    coverImageUrl: '/images/chapters/bc-road-rules-cover.jpg',
    coverImageAlt: 'BC省道路规则示意图',
    paymentType: 'TRIAL_INCLUDED',
    freePreviewSections: 2,
    prerequisiteChapters: ['ch-bc-001'],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-01-15'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  {
    id: 'ch-bc-003',
    title: '第三章：BC省安全驾驶技巧',
    titleEn: 'Chapter 3: BC Safe Driving Techniques',
    description: '学习BC省特有的驾驶技巧和注意事项',
    descriptionEn: 'Learn BC-specific driving techniques and precautions',
    order: 3,
    province: 'BC',
    contentFormat: 'HTML',
    estimatedReadTime: 40,
    coverImageUrl: '/images/chapters/bc-safe-driving-cover.jpg',
    coverImageAlt: 'BC省安全驾驶技巧',
    paymentType: 'MEMBER_ONLY',
    freePreviewSections: 1,
    prerequisiteChapters: ['ch-bc-001', 'ch-bc-002'],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-02-01'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  
  // 阿尔伯塔省 (AB) 章节
  {
    id: 'ch-ab-001',
    title: '第一章：阿尔伯塔省交通标志和信号',
    titleEn: 'Chapter 1: Alberta Traffic Signs and Signals',
    description: '学习阿尔伯塔省特有的交通标志、信号灯和道路标记',
    descriptionEn: 'Learn Alberta-specific traffic signs, signals and road markings',
    order: 1,
    province: 'AB',
    contentFormat: 'HTML',
    estimatedReadTime: 25,
    coverImageUrl: '/images/chapters/ab-traffic-signs-cover.jpg',
    coverImageAlt: '阿尔伯塔省交通标志示例图',
    paymentType: 'FREE',
    freePreviewSections: 3,
    prerequisiteChapters: [],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-01-01'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  {
    id: 'ch-ab-002',
    title: '第二章：阿尔伯塔省道路规则与法规',
    titleEn: 'Chapter 2: Alberta Road Rules and Regulations',
    description: '掌握阿尔伯塔省道路交通法规和具体规定',
    descriptionEn: 'Master Alberta traffic laws and specific regulations',
    order: 2,
    province: 'AB',
    contentFormat: 'HTML',
    estimatedReadTime: 35,
    coverImageUrl: '/images/chapters/ab-road-rules-cover.jpg',
    coverImageAlt: '阿尔伯塔省道路规则示意图',
    paymentType: 'TRIAL_INCLUDED',
    freePreviewSections: 2,
    prerequisiteChapters: ['ch-ab-001'],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-01-15'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
  {
    id: 'ch-ab-003',
    title: '第三章：阿尔伯塔省安全驾驶技巧',
    titleEn: 'Chapter 3: Alberta Safe Driving Techniques',
    description: '学习阿尔伯塔省特有的驾驶技巧和注意事项',
    descriptionEn: 'Learn Alberta-specific driving techniques and precautions',
    order: 3,
    province: 'AB',
    contentFormat: 'HTML',
    estimatedReadTime: 40,
    coverImageUrl: '/images/chapters/ab-safe-driving-cover.jpg',
    coverImageAlt: '阿尔伯塔省安全驾驶技巧',
    paymentType: 'MEMBER_ONLY',
    freePreviewSections: 1,
    prerequisiteChapters: ['ch-ab-001', 'ch-ab-002'],
    publishStatus: 'PUBLISHED',
    publishedAt: new Date('2024-02-01'),
    authorId: 'user-admin',
    lastEditedBy: 'user-admin',
  },
];

// 章节段落种子数据 - 按省份分组
const handbookSectionsSeed: NewHandbookSection[] = [
  // 安大略省 (ON) 章节段落
  {
    id: 'sec-on-001-001',
    chapterId: 'ch-on-001',
    title: '1.1 安大略省交通标志分类',
    titleEn: '1.1 Ontario Traffic Sign Classification',
    order: 1,
    content: `<div class="section-content">
      <h3>安大略省交通标志的基本分类</h3>
      <p>安大略省的交通标志按照功能和用途主要分为以下四大类：</p>
      
      <div class="sign-category">
        <h4>1. 警告标志 (Warning Signs)</h4>
        <p>警告标志通常为<strong>黄色背景配黑色图案</strong>，用于提醒驾驶员前方可能出现的危险或特殊情况。</p>
        <ul>
          <li>形状：通常为菱形</li>
          <li>颜色：黄色背景，黑色边框和符号</li>
          <li>作用：提前警告潜在危险</li>
        </ul>
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
      <h3>Basic Classification of Ontario Traffic Signs</h3>
      <p>Traffic signs in Ontario are mainly classified into four major categories based on their function and purpose:</p>
      
      <div class="sign-category">
        <h4>1. Warning Signs</h4>
        <p>Warning signs usually have a <strong>yellow background with black patterns</strong> to alert drivers of possible dangers or special conditions ahead.</p>
        <ul>
          <li>Shape: Usually diamond-shaped</li>
          <li>Color: Yellow background with black border and symbols</li>
          <li>Purpose: Advance warning of potential hazards</li>
        </ul>
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
    estimatedReadTime: 85,
  },
  
  // BC省 (BC) 章节段落
  {
    id: 'sec-bc-001-001',
    chapterId: 'ch-bc-001',
    title: '1.1 BC省交通标志分类',
    titleEn: '1.1 BC Traffic Sign Classification',
    order: 1,
    content: `<div class="section-content">
      <h3>BC省交通标志的基本分类</h3>
      <p>BC省的交通标志按照功能和用途主要分为以下四大类：</p>
      
      <div class="sign-category">
        <h4>1. 警告标志 (Warning Signs)</h4>
        <p>警告标志通常为<strong>黄色背景配黑色图案</strong>，用于提醒驾驶员前方可能出现的危险或特殊情况。</p>
        <ul>
          <li>形状：通常为菱形</li>
          <li>颜色：黄色背景，黑色边框和符号</li>
          <li>作用：提前警告潜在危险</li>
        </ul>
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
      <h3>Basic Classification of BC Traffic Signs</h3>
      <p>Traffic signs in BC are mainly classified into four major categories based on their function and purpose:</p>
      
      <div class="sign-category">
        <h4>1. Warning Signs</h4>
        <p>Warning signs usually have a <strong>yellow background with black patterns</strong> to alert drivers of possible dangers or special conditions ahead.</p>
        <ul>
          <li>Shape: Usually diamond-shaped</li>
          <li>Color: Yellow background with black border and symbols</li>
          <li>Purpose: Advance warning of potential hazards</li>
        </ul>
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
    estimatedReadTime: 85,
  },
  
  // 阿尔伯塔省 (AB) 章节段落
  {
    id: 'sec-ab-001-001',
    chapterId: 'ch-ab-001',
    title: '1.1 阿尔伯塔省交通标志分类',
    titleEn: '1.1 Alberta Traffic Sign Classification',
    order: 1,
    content: `<div class="section-content">
      <h3>阿尔伯塔省交通标志的基本分类</h3>
      <p>阿尔伯塔省的交通标志按照功能和用途主要分为以下四大类：</p>
      
      <div class="sign-category">
        <h4>1. 警告标志 (Warning Signs)</h4>
        <p>警告标志通常为<strong>黄色背景配黑色图案</strong>，用于提醒驾驶员前方可能出现的危险或特殊情况。</p>
        <ul>
          <li>形状：通常为菱形</li>
          <li>颜色：黄色背景，黑色边框和符号</li>
          <li>作用：提前警告潜在危险</li>
        </ul>
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
      <h3>Basic Classification of Alberta Traffic Signs</h3>
      <p>Traffic signs in Alberta are mainly classified into four major categories based on their function and purpose:</p>
      
      <div class="sign-category">
        <h4>1. Warning Signs</h4>
        <p>Warning signs usually have a <strong>yellow background with black patterns</strong> to alert drivers of possible dangers or special conditions ahead.</p>
        <ul>
          <li>Shape: Usually diamond-shaped</li>
          <li>Color: Yellow background with black border and symbols</li>
          <li>Purpose: Advance warning of potential hazards</li>
        </ul>
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
    estimatedReadTime: 85,
  },
];

// 图片资源种子数据
const handbookImagesSeed: NewHandbookImage[] = [
  {
    id: 'img-001',
    chapterId: 'ch-on-001',
    sectionId: 'sec-on-001-001',
    filename: 'warning-signs-collection.jpg',
    originalName: '警告标志合集.jpg',
    fileUrl: '/images/handbook/warning-signs-collection.jpg',
    fileSize: 248576,
    mimeType: 'image/jpeg',
    width: 800,
    height: 600,
    altText: '常见警告标志集合',
    caption: '安大略省常见的警告标志示例',
    captionEn: 'Examples of common warning signs in Ontario',
    usage: 'content',
    order: 1,
    uploadedBy: 'user-admin',
  },
  {
    id: 'img-002',
    chapterId: 'ch-on-001',
    filename: 'traffic-lights-diagram.png',
    originalName: '交通信号灯示意图.png',
    fileUrl: '/images/handbook/traffic-lights-diagram.png',
    fileSize: 156432,
    mimeType: 'image/png',
    width: 400,
    height: 300,
    altText: '标准交通信号灯示意图',
    caption: '安大略省标准三色交通信号灯及其含义',
    captionEn: 'Standard three-color traffic lights and their meanings in Ontario',
    usage: 'diagram',
    order: 1,
    uploadedBy: 'user-admin',
  },
  {
    id: 'img-003',
    chapterId: 'ch-on-001',
    filename: 'chapter1-cover.jpg',
    originalName: '第一章封面.jpg',
    fileUrl: '/images/chapters/on-traffic-signs-cover.jpg',
    fileSize: 325678,
    mimeType: 'image/jpeg',
    width: 1200,
    height: 800,
    altText: '安大略省交通标志和信号章节封面',
    caption: '第一章：安大略省交通标志和信号',
    captionEn: 'Chapter 1: Ontario Traffic Signs and Signals',
    usage: 'cover',
    order: 0,
    uploadedBy: 'user-admin',
  },
];

// 题目种子数据（基于新的章节结构）
const questionsSeed: NewQuestion[] = [
  // 安大略省题目
  {
    id: 'q-on-001',
    chapterId: 'ch-on-001',
    province: 'ON',
    type: 'SINGLE_CHOICE',
    title: '安大略省：当看到红灯时，驾驶员应该：',
    titleEn: 'Ontario: When seeing a red light, the driver should:',
    content: '在安大略省，交通信号灯显示红灯时，正确的做法是什么？',
    contentEn: 'In Ontario, what is the correct action when traffic lights show red?',
    explanation: '红灯表示禁止通行，所有车辆必须在停止线前完全停车。',
    explanationEn: 'Red light means no entry, all vehicles must come to a complete stop before the stop line.',
    difficulty: 1,
    tags: ['交通信号', '基础知识', '安大略省'],
  },
  {
    id: 'q-on-002',
    chapterId: 'ch-on-001',
    province: 'ON',
    type: 'SINGLE_CHOICE',
    title: '安大略省：黄灯闪烁表示：',
    titleEn: 'Ontario: A flashing yellow light means:',
    content: '在安大略省，当交通信号灯显示黄灯闪烁时，驾驶员应该如何行动？',
    contentEn: 'In Ontario, how should a driver act when traffic lights show a flashing yellow?',
    explanation: '黄灯闪烁表示谨慎通过，驾驶员需要减速并注意其他车辆和行人。',
    explanationEn: 'Flashing yellow means proceed with caution, drivers need to slow down and watch for other vehicles and pedestrians.',
    difficulty: 2,
    tags: ['交通信号', '谨慎驾驶', '安大略省'],
  },
  
  // BC省题目
  {
    id: 'q-bc-001',
    chapterId: 'ch-bc-001',
    province: 'BC',
    type: 'SINGLE_CHOICE',
    title: 'BC省：当看到红灯时，驾驶员应该：',
    titleEn: 'BC: When seeing a red light, the driver should:',
    content: '在BC省，交通信号灯显示红灯时，正确的做法是什么？',
    contentEn: 'In BC, what is the correct action when traffic lights show red?',
    explanation: '红灯表示禁止通行，所有车辆必须在停止线前完全停车。',
    explanationEn: 'Red light means no entry, all vehicles must come to a complete stop before the stop line.',
    difficulty: 1,
    tags: ['交通信号', '基础知识', 'BC省'],
  },
  {
    id: 'q-bc-002',
    chapterId: 'ch-bc-001',
    province: 'BC',
    type: 'SINGLE_CHOICE',
    title: 'BC省：黄灯闪烁表示：',
    titleEn: 'BC: A flashing yellow light means:',
    content: '在BC省，当交通信号灯显示黄灯闪烁时，驾驶员应该如何行动？',
    contentEn: 'In BC, how should a driver act when traffic lights show a flashing yellow?',
    explanation: '黄灯闪烁表示谨慎通过，驾驶员需要减速并注意其他车辆和行人。',
    explanationEn: 'Flashing yellow means proceed with caution, drivers need to slow down and watch for other vehicles and pedestrians.',
    difficulty: 2,
    tags: ['交通信号', '谨慎驾驶', 'BC省'],
  },
  
  // 阿尔伯塔省题目
  {
    id: 'q-ab-001',
    chapterId: 'ch-ab-001',
    province: 'AB',
    type: 'SINGLE_CHOICE',
    title: '阿尔伯塔省：当看到红灯时，驾驶员应该：',
    titleEn: 'Alberta: When seeing a red light, the driver should:',
    content: '在阿尔伯塔省，交通信号灯显示红灯时，正确的做法是什么？',
    contentEn: 'In Alberta, what is the correct action when traffic lights show red?',
    explanation: '红灯表示禁止通行，所有车辆必须在停止线前完全停车。',
    explanationEn: 'Red light means no entry, all vehicles must come to a complete stop before the stop line.',
    difficulty: 1,
    tags: ['交通信号', '基础知识', '阿尔伯塔省'],
  },
  {
    id: 'q-ab-002',
    chapterId: 'ch-ab-001',
    province: 'AB',
    type: 'SINGLE_CHOICE',
    title: '阿尔伯塔省：黄灯闪烁表示：',
    titleEn: 'Alberta: A flashing yellow light means:',
    content: '在阿尔伯塔省，当交通信号灯显示黄灯闪烁时，驾驶员应该如何行动？',
    contentEn: 'In Alberta, how should a driver act when traffic lights show a flashing yellow?',
    explanation: '黄灯闪烁表示谨慎通过，驾驶员需要减速并注意其他车辆和行人。',
    explanationEn: 'Flashing yellow means proceed with caution, drivers need to slow down and watch for other vehicles and pedestrians.',
    difficulty: 2,
    tags: ['交通信号', '谨慎驾驶', '阿尔伯塔省'],
  },
];

// 题目选项种子数据
const questionOptionsSeed: NewQuestionOption[] = [
  // 安大略省题目 q-on-001 的选项
  {
    id: 'opt-on-001-1',
    questionId: 'q-on-001',
    text: '立即停车',
    textEn: 'Stop immediately',
    isCorrect: true,
    order: 1,
  },
  {
    id: 'opt-on-001-2',
    questionId: 'q-on-001',
    text: '减速慢行',
    textEn: 'Slow down',
    isCorrect: false,
    order: 2,
  },
  {
    id: 'opt-on-001-3',
    questionId: 'q-on-001',
    text: '快速通过',
    textEn: 'Pass quickly',
    isCorrect: false,
    order: 3,
  },
  {
    id: 'opt-on-001-4',
    questionId: 'q-on-001',
    text: '鸣笛通过',
    textEn: 'Honk and pass',
    isCorrect: false,
    order: 4,
  },
  // 安大略省题目 q-on-002 的选项
  {
    id: 'opt-on-002-1',
    questionId: 'q-on-002',
    text: '停车等待',
    textEn: 'Stop and wait',
    isCorrect: false,
    order: 1,
  },
  {
    id: 'opt-on-002-2',
    questionId: 'q-on-002',
    text: '谨慎通过',
    textEn: 'Proceed with caution',
    isCorrect: true,
    order: 2,
  },
  {
    id: 'opt-on-002-3',
    questionId: 'q-on-002',
    text: '正常通过',
    textEn: 'Proceed normally',
    isCorrect: false,
    order: 3,
  },
  {
    id: 'opt-on-002-4',
    questionId: 'q-on-002',
    text: '加速通过',
    textEn: 'Accelerate and pass',
    isCorrect: false,
    order: 4,
  },
  
  // BC省题目 q-bc-001 的选项
  {
    id: 'opt-bc-001-1',
    questionId: 'q-bc-001',
    text: '立即停车',
    textEn: 'Stop immediately',
    isCorrect: true,
    order: 1,
  },
  {
    id: 'opt-bc-001-2',
    questionId: 'q-bc-001',
    text: '减速慢行',
    textEn: 'Slow down',
    isCorrect: false,
    order: 2,
  },
  {
    id: 'opt-bc-001-3',
    questionId: 'q-bc-001',
    text: '快速通过',
    textEn: 'Pass quickly',
    isCorrect: false,
    order: 3,
  },
  {
    id: 'opt-bc-001-4',
    questionId: 'q-bc-001',
    text: '鸣笛通过',
    textEn: 'Honk and pass',
    isCorrect: false,
    order: 4,
  },
  // BC省题目 q-bc-002 的选项
  {
    id: 'opt-bc-002-1',
    questionId: 'q-bc-002',
    text: '停车等待',
    textEn: 'Stop and wait',
    isCorrect: false,
    order: 1,
  },
  {
    id: 'opt-bc-002-2',
    questionId: 'q-bc-002',
    text: '谨慎通过',
    textEn: 'Proceed with caution',
    isCorrect: true,
    order: 2,
  },
  {
    id: 'opt-bc-002-3',
    questionId: 'q-bc-002',
    text: '正常通过',
    textEn: 'Proceed normally',
    isCorrect: false,
    order: 3,
  },
  {
    id: 'opt-bc-002-4',
    questionId: 'q-bc-002',
    text: '加速通过',
    textEn: 'Accelerate and pass',
    isCorrect: false,
    order: 4,
  },
  
  // 阿尔伯塔省题目 q-ab-001 的选项
  {
    id: 'opt-ab-001-1',
    questionId: 'q-ab-001',
    text: '立即停车',
    textEn: 'Stop immediately',
    isCorrect: true,
    order: 1,
  },
  {
    id: 'opt-ab-001-2',
    questionId: 'q-ab-001',
    text: '减速慢行',
    textEn: 'Slow down',
    isCorrect: false,
    order: 2,
  },
  {
    id: 'opt-ab-001-3',
    questionId: 'q-ab-001',
    text: '快速通过',
    textEn: 'Pass quickly',
    isCorrect: false,
    order: 3,
  },
  {
    id: 'opt-ab-001-4',
    questionId: 'q-ab-001',
    text: '鸣笛通过',
    textEn: 'Honk and pass',
    isCorrect: false,
    order: 4,
  },
  // 阿尔伯塔省题目 q-ab-002 的选项
  {
    id: 'opt-ab-002-1',
    questionId: 'q-ab-002',
    text: '停车等待',
    textEn: 'Stop and wait',
    isCorrect: false,
    order: 1,
  },
  {
    id: 'opt-ab-002-2',
    questionId: 'q-ab-002',
    text: '谨慎通过',
    textEn: 'Proceed with caution',
    isCorrect: true,
    order: 2,
  },
  {
    id: 'opt-ab-002-3',
    questionId: 'q-ab-002',
    text: '正常通过',
    textEn: 'Proceed normally',
    isCorrect: false,
    order: 3,
  },
  {
    id: 'opt-ab-002-4',
    questionId: 'q-ab-002',
    text: '加速通过',
    textEn: 'Accelerate and pass',
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
export async function seedDatabase(options: { clearFirst?: boolean } = {}) {
  console.log('开始插入种子数据...');
  
  const { db, close } = createDatabase();
  
  try {
    // 如果需要，先清空数据库
    if (options.clearFirst) {
      console.log('清空现有数据...');
      await db.delete(inviteCodes);
      await db.delete(appConfigs);
      await db.delete(questionOptions);
      await db.delete(questions);
      await db.delete(handbookImages);
      await db.delete(handbookSections);
      await db.delete(handbookChapters);
      await db.delete(users);
      console.log('数据清空完成');
    }
    
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