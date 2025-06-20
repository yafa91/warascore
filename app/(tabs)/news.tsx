import React, { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';


const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
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
    const imageUrl =
      item.thumbnail || (item.enclosure && item.enclosure.link) || null;

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

      <View style={styles.tabsContainer}>
        {['Tous', 'Tendances', 'Mercato'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              filter === tab && styles.tabButtonActive,
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

      <FlatList
        data={news}
        keyExtractor={(item) => item.guid || item.link}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
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
    backgroundColor: '#1e90ff',
  },
  tabButtonText: {
    color: '#aaa',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#fff',
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
});

export default News;
