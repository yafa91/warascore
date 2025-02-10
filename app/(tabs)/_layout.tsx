import { Tabs } from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const TabsNavigation = () => {
	return (
		<Tabs
			initialRouteName="index"
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: '#FFFFFF',
					borderTopWidth: 0,
					elevation: 0,
					height: 100,
					paddingBottom: 60,
					paddingTop: 10,
				},
				tabBarActiveTintColor: '#3C50E0',
				tabBarInactiveTintColor: '#8E8E93',
				tabBarLabelStyle: {
					fontFamily: 'Satoshi-Variable',
                    fontSize: 18,
                    fontWeight: "bold"
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Accueil',
					tabBarIcon: ({ focused, color }) => (
						<Ionicons
							name={focused ? 'home' : 'home-outline'}
							size={24}
							color={color}
						/>
					),
				}}
			/>
            <Tabs.Screen
				name="live"
				options={{
					title: 'Live',
					tabBarIcon: ({ focused, color }) => (
						<MaterialIcons
							name={'live-tv'}
							size={24}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="news"
				options={{
					title: 'News',
					tabBarIcon: ({ focused, color }) => (
						<Ionicons
							name={'newspaper-outline'}
							size={24}
							color={color}
						/>
					),
				}}
			/>
            <Tabs.Screen
				name="favoris"
				options={{
					title: 'Favoris',
					tabBarIcon: ({ focused, color }) => (
						<Feather
							name={'bell'}
							size={24}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
};

export default TabsNavigation;