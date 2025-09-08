import React, { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Image,
  
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const pronostiqueursMock = [
  { id: '1', name: 'Alex', score: 124, avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Chloé', score: 117, avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Marc', score: 109, avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Léa', score: 105, avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', name: 'Julien', score: 98, avatar: 'https://i.pravatar.cc/150?img=5' },
];

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const intervalRef = useRef(null);
  const navigation = useNavigation();

  const fetchNews = () => {
    setLoading(true);
    let rssUrl = '';

    if (filter === 'Tous') {
      rssUrl = 'https://rmcsport.bfmtv.com/rss/football/';
    } else if (filter === 'Tendances') {
      rssUrl = 'https://www.football365.fr/feed';
    } else if (filter === 'Mercato') {
      rssUrl = 'https://rmcsport.bfmtv.com/rss/football/transferts/';
    }

    if (filter === 'Top Pronostiqueurs') {
      setLoading(false);
      return;
    }

    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
      .then((response) => response.json())
      .then((data) => {
        let items = data.items || [];
        setNews(items);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur de chargement RSS:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (filter === 'Tendances') {
      intervalRef.current = setInterval(() => {
        fetchNews();
      }, 3 * 60 * 1000);
    } else if (filter === 'Mercato') {
      intervalRef.current = setInterval(() => {
        fetchNews();
      }, 10 * 60 * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [filter]);

  const renderItem = ({ item }) => {
    if (filter === 'Top Pronostiqueurs') {
      return (
        <View style={styles.pronostiqueurItem}>
          <Text style={styles.rank}>{pronostiqueursMock.indexOf(item) + 1}</Text>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <Text style={styles.pronostiqueurName}>{item.name}</Text>
          <Text style={styles.pronostiqueurScore}>{item.score} pts</Text>
        </View>
      );
    }

    const imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || null;

    return (
      <TouchableOpacity
        style={styles.newsItem}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ArticleScreen', { url: item.link })}
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.newsImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDate}>
          {new Date(item.pubDate).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Actualités</Text>
      <View>

      <ScrollView showsHorizontalScrollIndicator={false} horizontal> 
        <View style={styles.tabsContainer}>
        {['Tous', 'Tendances', 'Mercato', 'Top Pronostiqueurs'].map((tab, index, array) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              filter === tab && styles.tabButtonActive,
              index !== array.length - 1 && styles.tabButtonSpacing,
            ]}
            onPress={() => setFilter(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                filter === tab && styles.tabButtonTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        </View>
      </ScrollView>
      </View>
      

      {filter === 'Top Pronostiqueurs' && !isLoggedIn ? (
          <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 150, paddingHorizontal: 20 }}>
          <Text style={{ color: '#fff', fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
            Connecte-toi pour voir ton classement
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('login')}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filter === 'Top Pronostiqueurs' ? pronostiqueursMock : news}
          keyExtractor={(item) => item.id || item.guid || item.link}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  tabButtonActive: {
    backgroundColor: '#ff0000',
  },
  tabButtonText: {
    color: '#aaa',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabButtonSpacing: {
    marginRight: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  newsItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  newsImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#333',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 14,
    color: '#aaa',
  },
  pronostiqueurItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  rank: {
    color: '#ffd700',
    fontWeight: 'bold',
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  pronostiqueurName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  pronostiqueurScore: {
    color: '#1e90ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default News;
