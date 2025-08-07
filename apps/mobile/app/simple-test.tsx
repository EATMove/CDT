import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import HtmlRenderer from '../components/HtmlRenderer';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedReadTime: number;
  canAccess: boolean;
  status: string;
  totalSections: number;
  accessibleSections: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  isFree: boolean;
  isLocked: boolean;
  content: string;
  wordCount: number;
  estimatedReadTime: number;
}

interface ChapterContent {
  id: string;
  title: string;
  description: string;
  sections: Section[];
  totalSections: number;
  freeSections: number;
  unlockedSections: number;
  userCanAccess: boolean;
}

export default function SimpleTestScreen() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [userType, setUserType] = useState<'FREE' | 'TRIAL' | 'MEMBER'>('FREE');
  const [language, setLanguage] = useState<'ZH' | 'EN'>('ZH');
  const [customIp, setCustomIp] = useState('192.168.1.70'); // 默认IP，需要修改为你的实际IP
  
  // 根据平台选择不同的API地址
  const getApiBaseUrl = () => {
    // 在web环境下使用localhost，在移动端使用电脑IP地址
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    } else {
      return `http://${customIp}:3000`;
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [userType, language]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      console.log('Fetching chapters...');
      
      const url = `${getApiBaseUrl()}/api/mobile/chapters?userType=${userType}&language=${language}&province=ON`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Chapters data:', data);
      
      if (data.success && data.data && data.data.chapters) {
        setChapters(data.data.chapters);
      } else {
        console.warn('Unexpected data structure:', data);
        setChapters([]);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('错误', `获取章节列表失败: ${errorMessage}`);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeChange = () => {
    const types: Array<'FREE' | 'TRIAL' | 'MEMBER'> = ['FREE', 'TRIAL', 'MEMBER'];
    const currentIndex = types.indexOf(userType);
    const nextIndex = (currentIndex + 1) % types.length;
    setUserType(types[nextIndex]);
  };

  const handleLanguageChange = () => {
    setLanguage(language === 'ZH' ? 'EN' : 'ZH');
  };

  const fetchChapterContent = async (chapterId: string) => {
    try {
      setLoadingChapter(true);
      const url = `${getApiBaseUrl()}/api/mobile/content/${chapterId}?userType=${userType}&language=${language}`;
      console.log('Fetching chapter content from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch chapter content: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Chapter content response:', data);
      
      if (data.success && data.data) {
        setSelectedChapter(data.data);
      } else {
        console.warn('Unexpected chapter data structure:', data);
        Alert.alert('错误', '章节数据格式异常');
      }
    } catch (error) {
      console.error('Error fetching chapter content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('错误', `获取章节内容失败: ${errorMessage}`);
    } finally {
      setLoadingChapter(false);
    }
  };

  const renderChapterItem = (chapter: Chapter) => (
    <TouchableOpacity
      key={chapter.id}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
      onPress={() => fetchChapterContent(chapter.id)}
    >
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        {chapter.title}
      </Text>
      <Text className="text-gray-600 text-sm mb-2">
        {chapter.description}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-500 text-xs">
          段落: {chapter.totalSections} | 可访问: {chapter.accessibleSections}
        </Text>
        <Text className="text-gray-500 text-xs">
          {chapter.estimatedReadTime} 分钟
        </Text>
      </View>
      {!chapter.canAccess && (
        <View className="bg-orange-100 px-2 py-1 rounded mt-2">
          <Text className="text-orange-600 text-xs">需要升级</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSectionItem = (section: Section) => (
    <View key={section.id} className="mb-4">
      <View className="flex-row items-center mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1">
          {section.title}
        </Text>
        {section.isLocked && (
          <View className="bg-red-100 px-2 py-1 rounded">
            <Text className="text-red-600 text-xs">已锁定</Text>
          </View>
        )}
        {section.isFree && (
          <View className="bg-green-100 px-2 py-1 rounded">
            <Text className="text-green-600 text-xs">免费</Text>
          </View>
        )}
      </View>
      
      <View className="bg-gray-50 rounded-lg p-3">
        <HtmlRenderer 
          html={section.content} 
          baseUrl={getApiBaseUrl()}
        />
      </View>
      
      <View className="flex-row items-center mt-2">
        <Text className="text-gray-500 text-xs">
          {section.wordCount} 字
        </Text>
        <Text className="text-gray-400 mx-1">•</Text>
        <Text className="text-gray-500 text-xs">
          {section.estimatedReadTime} 秒
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-2">加载章节列表...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">测试手册功能</Text>
            <TouchableOpacity
              onPress={() => {
                if (selectedChapter) {
                  setSelectedChapter(null);
                } else {
                  router.back();
                }
              }}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-sm">
                {selectedChapter ? '返回列表' : '返回'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 text-sm mt-1">
            用户类型: {userType} | 语言: {language}
          </Text>
          
          {/* IP地址配置 */}
          {Platform.OS !== 'web' && (
            <View className="mt-2">
              <Text className="text-gray-600 text-xs mb-1">服务器IP地址:</Text>
              <TextInput
                value={customIp}
                onChangeText={setCustomIp}
                className="bg-gray-100 px-2 py-1 rounded text-sm"
                placeholder="输入你的电脑IP地址"
                placeholderTextColor="#999"
              />
            </View>
          )}
          
          {/* 设置面板 */}
          <View className="mt-3 flex-row space-x-2">
            <TouchableOpacity
              onPress={handleUserTypeChange}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              <Text className="text-gray-700 text-xs">切换用户类型</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLanguageChange}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              <Text className="text-gray-700 text-xs">切换语言</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={fetchChapters}
              className="bg-blue-200 px-2 py-1 rounded"
            >
              <Text className="text-blue-700 text-xs">刷新</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {selectedChapter ? (
            // 显示章节内容
            <View>
              <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedChapter.title}
                </Text>
                <Text className="text-gray-600 mb-3">
                  {selectedChapter.description}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-500">
                    总段落: {selectedChapter.totalSections}
                  </Text>
                  <Text className="text-gray-500">
                    免费段落: {selectedChapter.freeSections}
                  </Text>
                  <Text className="text-gray-500">
                    可访问: {selectedChapter.unlockedSections}
                  </Text>
                </View>
              </View>

              {loadingChapter ? (
                <View className="justify-center items-center py-8">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-gray-600 mt-2">加载章节内容...</Text>
                </View>
              ) : (
                <View>
                  {selectedChapter.sections.map(renderSectionItem)}
                </View>
              )}
            </View>
          ) : (
            // 显示章节列表
            <View>
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                章节列表 ({chapters.length})
              </Text>
              
              {chapters.length === 0 ? (
                <View className="bg-white rounded-lg p-4 shadow-sm">
                  <Text className="text-gray-600 text-center">暂无章节数据</Text>
                </View>
              ) : (
                chapters.map(renderChapterItem)
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 