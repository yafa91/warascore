import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface TabProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

const tabs = ['Détails', 'Compo', 'Classement', 'Historique'];

const TabsComponent: React.FC<TabProps> = ({ activeTab, onChangeTab }) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab} onPress={() => onChangeTab(tab)}>
          <Text style={{
            fontWeight: activeTab === tab ? 'bold' : 'normal',
            color: activeTab === tab ? '#000' : '#666'
          }}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabsComponent;
