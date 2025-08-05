import { APP_CONFIG } from './constants';

// 邮箱验证
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 手机号验证（加拿大）
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[2-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 密码强度验证
export const isValidPassword = (password: string): boolean => {
  if (password.length < APP_CONFIG.PASSWORD_MIN_LENGTH || 
      password.length > APP_CONFIG.PASSWORD_MAX_LENGTH) {
    return false;
  }
  
  // 必须包含字母、数字、符号中的至少两种
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const typeCount = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length;
  return typeCount >= 2;
};

// 昵称验证
export const isValidNickname = (nickname: string): boolean => {
  if (nickname.length < APP_CONFIG.NICKNAME_MIN_LENGTH || 
      nickname.length > APP_CONFIG.NICKNAME_MAX_LENGTH) {
    return false;
  }
  
  // 只能包含中文、英文、数字和下划线
  const nicknameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
  return nicknameRegex.test(nickname);
};

// 验证码验证
export const isValidVerificationCode = (code: string): boolean => {
  const codeRegex = /^\d{4,6}$/;
  return codeRegex.test(code);
};

// 邀请码验证
export const isValidInviteCode = (code: string): boolean => {
  if (code.length !== APP_CONFIG.INVITE_CODE_LENGTH) {
    return false;
  }
  
  const inviteCodeRegex = /^[A-Z0-9]+$/;
  return inviteCodeRegex.test(code);
};

// 省份代码验证
export const isValidProvince = (province: string): boolean => {
  return ['AB', 'BC', 'ON'].includes(province);
};

// 清理和格式化输入
export const cleanInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

// 生成随机邀请码
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < APP_CONFIG.INVITE_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 生成随机验证码
export const generateVerificationCode = (): string => {
  return Math.floor(Math.random() * 900000 + 100000).toString();
}; 