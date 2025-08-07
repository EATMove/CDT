import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TabOneScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">加拿大驾考 App</Text>
      <View 
        className="my-8 h-px w-4/5" 
        lightColor="#eee" 
        darkColor="rgba(255,255,255,0.1)" 
      />
      
      <TouchableOpacity
        className="bg-green-500 px-6 py-3 rounded-lg mb-4"
        onPress={() => router.push('/simple-test')}
      >
        <Text className="text-white font-semibold">测试手册功能</Text>
      </TouchableOpacity>
      
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}
