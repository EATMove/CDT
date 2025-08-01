// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  timestamp: string;
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// 错误响应
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// 认证相关API
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends ApiResponse<{
  user: any; // 用户信息
  tokens: AuthTokens;
}> {}

// 文件上传响应
export interface UploadResponse extends ApiResponse<{
  fileId: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}> {}

// WebSocket消息类型
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
} 