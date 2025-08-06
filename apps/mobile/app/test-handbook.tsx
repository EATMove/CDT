import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import HtmlRenderer from '@/components/HtmlRenderer';
import { useUserStore } from '../stores/userStore';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedReadTime: number;
  coverImageUrl?: string;
  canAccess: boolean;
  status: string;
  totalSections: number;
  accessibleSections: number;
  requiresUpgrade: boolean;
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
  images: any[];
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

export default function TestHandbookScreen() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // 从状态管理获取用户信息
  const { userType, language, province, setUserType, setLanguage, setProvince, loadUserSettings } = useUserStore();

  useEffect(() => {
    loadUserSettings();
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/mobile/chapters?userType=${userType}&language=${language}&province=${province}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      
      const data = await response.json();
      setChapters(data.data.chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      Alert.alert('错误', '获取章节列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterContent = async (chapterId: string) => {
    try {
      setLoadingChapter(true);
      const response = await fetch(
        `http://localhost:3000/api/mobile/content/${chapterId}?userType=${userType}&language=${language}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapter content');
      }
      
      const data = await response.json();
      setSelectedChapter(data.data);
    } catch (error) {
      console.error('Error fetching chapter content:', error);
      Alert.alert('错误', '获取章节内容失败');
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
      <View className="flex-row items-center">
        {chapter.coverImageUrl && (
          <Image
            source={{ uri: chapter.coverImageUrl }}
            className="w-16 h-16 rounded-lg mr-3"
            resizeMode="cover"
          />
        )}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              {chapter.title}
            </Text>
            {!chapter.canAccess && (
              <View className="bg-orange-100 px-2 py-1 rounded">
                <Text className="text-orange-600 text-xs">需要升级</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
            {chapter.description}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-xs">
                {chapter.totalSections} 段落
              </Text>
              <Text className="text-gray-400 mx-1">•</Text>
              <Text className="text-gray-500 text-xs">
                {chapter.estimatedReadTime} 分钟
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-xs">
                可访问: {chapter.accessibleSections}/{chapter.totalSections}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionItem = (section: Section) => (
    <View key={section.id} className="mb-6">
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
        <HtmlRenderer html={section.content} />
      </View>
      
      {section.images && section.images.length > 0 && (
        <ScrollView horizontal className="mt-3" showsHorizontalScrollIndicator={false}>
          {section.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.smallUrl || image.fileUrl }}
              className="w-20 h-20 rounded-lg mr-2"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
      
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
            <Text className="text-xl font-bold text-gray-900">驾考手册测试</Text>
            <TouchableOpacity
              onPress={() => setSelectedChapter(null)}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-sm">返回列表</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 text-sm mt-1">
            用户类型: {userType} | 语言: {language} | 省份: {province}
          </Text>
          
          {/* 设置面板 */}
          <View className="mt-3 flex-row space-x-2">
            <TouchableOpacity
              onPress={() => {
                setUserType(userType === 'FREE' ? 'TRIAL' : userType === 'TRIAL' ? 'MEMBER' : 'FREE');
                setTimeout(() => fetchChapters(), 100);
              }}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              <Text className="text-gray-700 text-xs">切换用户类型</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setLanguage(language === 'ZH' ? 'EN' : 'ZH');
                setTimeout(() => fetchChapters(), 100);
              }}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              <Text className="text-gray-700 text-xs">切换语言</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setProvince(province === 'ON' ? 'BC' : province === 'BC' ? 'AB' : 'ON');
                setTimeout(() => fetchChapters(), 100);
              }}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              <Text className="text-gray-700 text-xs">切换省份</Text>
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
              {chapters.map(renderChapterItem)}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 