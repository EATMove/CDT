import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  userType: 'FREE' | 'TRIAL' | 'MEMBER';
  language: 'ZH' | 'EN';
  province: 'AB' | 'BC' | 'ON';
  setUserType: (type: 'FREE' | 'TRIAL' | 'MEMBER') => void;
  setLanguage: (lang: 'ZH' | 'EN') => void;
  setProvince: (prov: 'AB' | 'BC' | 'ON') => void;
  loadUserSettings: () => Promise<void>;
  saveUserSettings: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  userType: 'FREE',
  language: 'ZH',
  province: 'ON',
  
  setUserType: (type) => {
    set({ userType: type });
    get().saveUserSettings();
  },
  
  setLanguage: (lang) => {
    set({ language: lang });
    get().saveUserSettings();
  },
  
  setProvince: (prov) => {
    set({ province: prov });
    get().saveUserSettings();
  },
  
  loadUserSettings: async () => {
    try {
      const userType = await AsyncStorage.getItem('userType') as 'FREE' | 'TRIAL' | 'MEMBER' || 'FREE';
      const language = await AsyncStorage.getItem('language') as 'ZH' | 'EN' || 'ZH';
      const province = await AsyncStorage.getItem('province') as 'AB' | 'BC' | 'ON' || 'ON';
      
      set({ userType, language, province });
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  },
  
  saveUserSettings: async () => {
    try {
      const { userType, language, province } = get();
      await AsyncStorage.setItem('userType', userType);
      await AsyncStorage.setItem('language', language);
      await AsyncStorage.setItem('province', province);
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  },
})); 