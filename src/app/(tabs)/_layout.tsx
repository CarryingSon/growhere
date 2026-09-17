import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="moje-rastline"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="moje-rastline" options={{ title: 'Moje rastline' }} />
      <Tabs.Screen name="skeniraj" options={{ title: 'Skeniraj' }} />
      <Tabs.Screen name="katalog" options={{ title: 'Katalog' }} />
    </Tabs>
  );
}
