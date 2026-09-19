import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  LogBox,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { trigger, dismiss } from 'expo-dynamic-notifications';

LogBox.ignoreAllLogs();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// SafeAreaView (RN) não aplica o inset do topo no Android; compensamos manualmente.
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

// Todas as imagens vêm da internet (Unsplash), replicando a referência.
const scene = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=240&h=360&fit=crop&crop=entropy&q=80&auto=format`;
const face = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=140&h=140&fit=crop&crop=faces&q=80&auto=format`;
const post = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=1000&fit=crop&crop=entropy&q=80&auto=format`;

const IMG = {
  // Avatares de perfil (portraits)
  a1: face('1500648767791-00dcc994a43e'),
  a2: face('1507003211169-0a1dd7228f2d'),
  a3: face('1494790108377-be9c29b29330'),
  a4: face('1438761681033-6461ffad8d80'),
  a5: face('1472099645785-5658abf4ff4e'),
  // Cenas dos stories (cápsulas)
  s1: scene('1503376780353-7e6692767b70'), // carro azul
  s2: scene('1529626455594-4ff0802cfb7e'), // chapéu de palha
  s3: scene('1441974231531-c6227db76b6e'), // campo / floresta
  s4: scene('1508739773434-c26b3d09e071'), // borboleta
  s5: scene('1493238792000-8113da705763'), // editorial
  // Posts
  surfer: post('1531722569936-825d3dd91b15'), // prancha na praia
  wave: post('1502933691298-84fc14542831'), // onda
};

type StoryItem = {
  name: string;
  scene: string;
  avatar: string;
  accentColor: string;
  message: string;
  symbol: string;
};

export default function App() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(43);
  const [lastAction, setLastAction] = useState<string>('Pronto para testar');

  // 1. Notificação idêntica à referência (Noah)
  const showNoahNotification = () => {
    setLastAction('Notificação Noah acionada');
    trigger({
      title: 'New Follower!',
      message: 'Noah followed you',
      avatarUrl: IMG.a2,
      rightSymbolName: 'person.badge.plus',
      theme: 'light',
      duration: 3500,
      onPress: () => setLastAction('Abriu o perfil do Noah!'),
      onDismiss: () => setLastAction('Notificação absorvida na Dynamic Island'),
    });
  };

  // 2. Seguidor alternativo
  const showFollowerNotification = () => {
    setLastAction('Seguidor alternativo acionado');
    trigger({
      title: 'Novo Seguidor!',
      message: 'Sasuke Uchiha começou a te seguir',
      avatarUrl: IMG.a5,
      rightSymbolName: 'person.badge.plus',
      theme: 'light',
      duration: 3500,
      onPress: () => setLastAction('Abriu o perfil de Sasuke!'),
      onDismiss: () => setLastAction('Notificação fechada'),
    });
  };

  // 3. Música
  const showMusicNotification = () => {
    setLastAction('Música acionada');
    trigger({
      title: 'Tocando Agora',
      message: 'M83 • Midnight City',
      symbolName: 'music.note',
      accentColor: '#FF2D55',
      theme: 'light',
      duration: 4000,
      onPress: () => setLastAction('Abriu o player de música!'),
      onDismiss: () => setLastAction('Música fechada'),
    });
  };

  // 4. Bateria
  const showBatteryNotification = () => {
    setLastAction('Alerta de bateria acionado');
    trigger({
      title: 'Bateria Fraca',
      message: 'Resta apenas 20% de bateria',
      symbolName: 'battery.25',
      accentColor: '#FF9500',
      theme: 'light',
      duration: 3000,
      onPress: () => setLastAction('Abriu configurações de bateria!'),
      onDismiss: () => setLastAction('Alerta fechado'),
    });
  };

  const handleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));
    if (nextLiked) {
      trigger({
        title: 'Nova Curtida!',
        message: 'Você curtiu a foto de Sebastian Rojas',
        symbolName: 'heart.fill',
        accentColor: '#FF2D55',
        theme: 'light',
        duration: 2500,
      });
    }
  };

  // Notificação dinâmica baseada no story tocado (nome + avatar daquele story)
  const showStoryNotification = (story: StoryItem) => {
    setLastAction(`${story.name} • ${story.message}`);
    trigger({
      title: story.name,
      message: story.message,
      avatarUrl: story.avatar,
      rightSymbolName: story.symbol,
      accentColor: story.accentColor,
      theme: 'light',
      duration: 3500,
      onPress: () => setLastAction(`Abriu o story de ${story.name}!`),
      onDismiss: () => setLastAction('Story fechado'),
    });
  };

  const stories: StoryItem[] = [
    { name: 'Noah Carter', scene: IMG.s1, avatar: IMG.a1, accentColor: '#FF375F', message: 'está ao vivo agora', symbol: 'dot.radiowaves.left.and.right' },
    { name: 'Liam Bennett', scene: IMG.s2, avatar: IMG.a5, accentColor: '#2F9BFF', message: 'adicionou um novo story', symbol: 'plus.circle.fill' },
    { name: 'Ethan Cole', scene: IMG.s3, avatar: IMG.a2, accentColor: '#34C759', message: 'começou a te seguir', symbol: 'person.badge.plus' },
    { name: 'Mia Rivera', scene: IMG.s4, avatar: IMG.a3, accentColor: '#AF52DE', message: 'mencionou você no story', symbol: 'at' },
    { name: 'Sofia Klein', scene: IMG.s5, avatar: IMG.a4, accentColor: '#FF9500', message: 'curtiu seu story', symbol: 'heart.fill' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDEDF2" translucent={false} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconCircleButton} activeOpacity={0.7} onPress={showFollowerNotification}>
          <Feather name="menu" size={22} color="#1C1C1E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconCircleButton} activeOpacity={0.7} onPress={showNoahNotification}>
          <Feather name="bell" size={22} color="#1C1C1E" />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* STORIES */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}
        >
          {stories.map((story, index) => (
            <TouchableOpacity key={index} style={styles.storyCard} activeOpacity={0.85} onPress={() => showStoryNotification(story)}>
              <Image source={{ uri: story.scene }} style={styles.storyScene} resizeMode="cover" />
              <View style={styles.storyAvatarWrap}>
                <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* POST 1: Sebastian Rojas */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={{ uri: IMG.a2 }} style={styles.postAvatar} />
            <View style={styles.postHeaderText}>
              <Text style={styles.postAuthor}>Sebastian Rojas</Text>
              <Text style={styles.postLocation}>Looking for a good beach to surf.</Text>
            </View>
            <TouchableOpacity style={styles.moreButton} onPress={showNoahNotification}>
              <Feather name="more-horizontal" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Image source={{ uri: IMG.surfer }} style={styles.postImage} resizeMode="cover" />

          <View style={styles.actionsRow}>
            <View style={styles.actionsLeft}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={liked ? '#FF2D55' : '#1C1C1E'}
                />
                <Text style={styles.actionCount}>{likeCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={showMusicNotification}>
                <MaterialCommunityIcons name="repeat-variant" size={23} color="#1C1C1E" />
                <Text style={styles.actionCount}>1</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={showFollowerNotification}>
                <Feather name="message-circle" size={22} color="#1C1C1E" />
                <Text style={styles.actionCount}>5</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={showNoahNotification}>
              <Feather name="share-2" size={20} color="#1C1C1E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* POST 2: Felix Schneider */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={{ uri: IMG.a5 }} style={styles.postAvatar} />
            <View style={styles.postHeaderText}>
              <Text style={styles.postAuthor}>Felix Schneider</Text>
              <Text style={styles.postLocation}>is at The Colosseum with 2 others</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <Feather name="more-horizontal" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Image source={{ uri: IMG.wave }} style={[styles.postImage, { height: 260 }]} resizeMode="cover" />
        </View>
      </ScrollView>

      {/* DOCK FLUTUANTE DE TESTES */}
      <View style={styles.dockContainer}>
        <View style={styles.dock}>
          <TouchableOpacity
            style={[styles.dockButton, styles.dockPrimaryButton]}
            activeOpacity={0.8}
            onPress={showNoahNotification}
          >
            <Text style={styles.dockPrimaryText}>🌟 Noah (Ref)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dockButton} activeOpacity={0.7} onPress={showMusicNotification}>
            <Ionicons name="musical-notes" size={16} color="#1C1C1E" />
            <Text style={styles.dockButtonText}>Música</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dockButton} activeOpacity={0.7} onPress={showBatteryNotification}>
            <Ionicons name="battery-charging" size={16} color="#1C1C1E" />
            <Text style={styles.dockButtonText}>Bateria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dockButton, styles.dockDismissButton]}
            activeOpacity={0.7}
            onPress={() => dismiss()}
          >
            <Ionicons name="close" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <Text style={styles.dockStatusText}>{lastAction}</Text>
      </View>
    </SafeAreaView>
  );
}

const STORY_W = 64;
const STORY_H = 98;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEDF2',
    paddingTop: STATUS_BAR_HEIGHT,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 6 : 4,
  },
  iconCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  storiesContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 10,
  },
  storyCard: {
    width: STORY_W,
    height: STORY_H,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#DDE0E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  storyScene: {
    width: '100%',
    height: '100%',
  },
  storyAvatarWrap: {
    position: 'absolute',
    bottom: 7,
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
    backgroundColor: '#C9CDD4',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
  },
  postCard: {
    marginHorizontal: 16,
    marginBottom: 22,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5E5EA',
  },
  postHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.2,
  },
  postLocation: {
    fontSize: 13,
    color: '#7E8085',
    marginTop: 2,
  },
  moreButton: {
    padding: 6,
  },
  postImage: {
    width: SCREEN_WIDTH - 32,
    height: 350,
    borderRadius: 28,
    backgroundColor: '#E5E5EA',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  dockContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  dockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
  },
  dockPrimaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
  },
  dockPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  dockButtonText: {
    color: '#1C1C1E',
    fontWeight: '600',
    fontSize: 13,
  },
  dockDismissButton: {
    paddingHorizontal: 10,
    backgroundColor: '#F2F2F7',
  },
  dockStatusText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 6,
    fontWeight: '500',
  },
});
