import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { View, Text } from 'react-native';

const TabsNavigation = () => {
	return (
		<Tabs
			initialRouteName="index"
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: '#121212',
					borderTopWidth: 0,
					elevation: 0,
				},
				tabBarActiveTintColor: '#3C50E0',
				tabBarInactiveTintColor: '#8E8E93',
				tabBarLabelStyle: {
					fontFamily: 'Satoshi-Variable',
					fontSize: 16,
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
				name="favoris"
				options={{
					title: 'Favoris',
					tabBarIcon: ({ focused, color }) => (
						<Feather
							name={'star'}
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
						<View style={{ position: 'relative' }}>
							<Ionicons
								name={'newspaper-sharp'}
								size={24}
								color={color}
							/>
							<View style={{
								position: 'absolute',
								top: -6,
								left: -12,
								backgroundColor: 'red',
								paddingHorizontal: 4,
								paddingVertical: 1,
								borderRadius: 4,
							}}>
								<Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>BETA</Text>
							</View>
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name="profil"
				options={{
					title: 'Profil',
					tabBarIcon: ({ focused, color }) => (
						<AntDesign
							name={'user-add'}
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
