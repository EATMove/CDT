# 📱 Mobile Authentication API

## 🔐 支持的登录方式

### 1. 邮箱登录 (Email + Password)
### 2. 手机号登录 (Phone + Verification Code)  
### 3. Google 登录 (Google OAuth)
### 4. Apple 登录 (Apple Sign In)

---

## 🚀 API 端点

### 认证相关
- `POST /api/mobile/auth` - 登录/注册
- `DELETE /api/mobile/auth` - 退出登录
- `POST /api/mobile/verification` - 发送验证码
- `PUT /api/mobile/verification` - 验证验证码

### 用户相关
- `GET /api/mobile/user` - 获取用户信息
- `PUT /api/mobile/user` - 更新用户信息

---

## 📋 API 详细说明

### 1. 邮箱注册
```http
POST /api/mobile/auth
Content-Type: application/json

{
  "action": "register",
  "email": "user@example.com",
  "password": "password123",
  "nickname": "用户昵称",
  "province": "ON"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "User registered successfully",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "userType": "FREE",
      "province": "ON"
    },
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 2592000
  }
}
```

### 2. 邮箱登录
```http
POST /api/mobile/auth
Content-Type: application/json

{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Google 登录
```http
POST /api/mobile/auth
Content-Type: application/json

{
  "action": "google_login",
  "googleId": "google-user-id",
  "email": "user@gmail.com",
  "nickname": "Google用户",
  "province": "ON"
}
```

### 4. Apple 登录
```http
POST /api/mobile/auth
Content-Type: application/json

{
  "action": "apple_login",
  "appleId": "apple-user-id",
  "email": "user@icloud.com",
  "nickname": "Apple用户",
  "province": "ON"
}
```

### 5. 手机号登录流程

#### 第一步：发送验证码
```http
POST /api/mobile/verification
Content-Type: application/json

{
  "phone": "+1234567890",
  "type": "login"
}
```

#### 第二步：登录
```http
POST /api/mobile/auth
Content-Type: application/json

{
  "action": "phone_login",
  "phoneNumber": "+1234567890",
  "verificationCode": "123456",
  "nickname": "手机用户",
  "province": "ON"
}
```

### 6. 获取用户信息
```http
GET /api/mobile/user
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "+1234567890",
      "nickname": "用户昵称",
      "userType": "FREE",
      "province": "ON",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLoginAt": "2024-01-01T00:00:00Z",
      "membership": {
        "type": "FREE",
        "isMember": false,
        "isTrial": false,
        "isFree": true,
        "membershipEndDate": null,
        "trialEndDate": null,
        "membershipDaysLeft": 0,
        "trialDaysLeft": 0
      },
      "permissions": {
        "canAccessPremium": false,
        "canAccessTrial": false,
        "canAccessAllChapters": false,
        "canTakeSimulationExams": false
      }
    }
  }
}
```

### 7. 退出登录
```http
DELETE /api/mobile/auth
```

---

## 🔧 JWT Token 使用

### 请求头格式
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Token 信息
- **有效期**: 30天
- **算法**: HS256
- **包含信息**: userId, userType, iat, exp

---

## 🚨 错误代码

| 错误码 | 说明 |
|--------|------|
| `VALIDATION_ERROR` | 参数验证失败 |
| `UNAUTHORIZED` | 认证失败 |
| `USER_NOT_FOUND` | 用户不存在 |
| `INVALID_VERIFICATION_CODE` | 验证码无效或过期 |
| `TOO_MANY_ATTEMPTS` | 请求过于频繁 |
| `EXTERNAL_SERVICE_ERROR` | 服务器内部错误 |

---

## 📱 移动端集成建议

### 1. Token 存储
```javascript
// 登录成功后存储token
await AsyncStorage.setItem('accessToken', response.data.accessToken);
await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
```

### 2. 自动认证
```javascript
// 应用启动时检查token
const token = await AsyncStorage.getItem('accessToken');
if (token) {
  // 设置默认请求头
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
```

### 3. Google 登录集成
```javascript
// 使用 @react-native-google-signin/google-signin
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const signInWithGoogle = async () => {
  const userInfo = await GoogleSignin.signIn();
  
  // 调用后端API
  const response = await api.post('/api/mobile/auth', {
    action: 'google_login',
    googleId: userInfo.user.id,
    email: userInfo.user.email,
    nickname: userInfo.user.name
  });
};
```

### 4. Apple 登录集成
```javascript
// 使用 @invertase/react-native-apple-authentication
import { appleAuth } from '@invertase/react-native-apple-authentication';

const signInWithApple = async () => {
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  
  // 调用后端API
  const response = await api.post('/api/mobile/auth', {
    action: 'apple_login',
    appleId: appleAuthRequestResponse.user,
    email: appleAuthRequestResponse.email,
    nickname: appleAuthRequestResponse.fullName?.givenName
  });
};
```

---

## 🔒 安全建议

1. **JWT Secret**: 生产环境使用强密码
2. **HTTPS**: 所有API调用必须使用HTTPS
3. **Token刷新**: 考虑实现refresh token机制
4. **验证码**: 生产环境集成真实短信服务
5. **限流**: 对验证码发送进行频率限制