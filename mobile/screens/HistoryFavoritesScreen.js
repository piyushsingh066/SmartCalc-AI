import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { Trash, Star, CornerDownLeft, History } from 'lucide-react-native';
import { dbAdapter } from '../../src/context/dbAdapter';
import { useDbTable } from '../useDbTable';

export default function HistoryFavoritesScreen({ activeTab, setActiveTab, onReuse, themeStyle, onToast }) {
  const [historyItems] = useDbTable('history');
  const [favoriteItems] = useDbTable('favorites');

  const handleDeleteHistoryItem = async (id) => {
    try {
      await dbAdapter.history.delete(id);
      onToast('History item deleted');
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await dbAdapter.history.clear();
      onToast('History cleared');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFavoriteItem = async (id) => {
    try {
      await dbAdapter.favorites.delete(id);
      onToast('Removed from favorites');
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearFavorites = async () => {
    try {
      await dbAdapter.favorites.clear();
      onToast('All favorites deleted');
    } catch (e) {
      console.error(e);
    }
  };

  const sortedHistory = [...historyItems].reverse();
  const sortedFavorites = [...favoriteItems].reverse();

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onReuse(item.expression)}
      style={[styles.itemRow, { backgroundColor: themeStyle.keyNumBg, borderColor: themeStyle.cardBorder }]}
    >
      <View style={styles.itemMain}>
        <Text style={[styles.expressionText, { color: themeStyle.textSecondary }]}>{item.expression}</Text>
        <Text style={[styles.resultText, { color: themeStyle.textPrimary }]}>= {item.result}</Text>
        <Text style={[styles.modeText, { color: themeStyle.accent }]}>{item.mode || 'Standard'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onReuse(item.expression)}>
          <CornerDownLeft color={themeStyle.textSecondary} size={18} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteHistoryItem(item.id)}>
          <Trash color="#f87171" size={18} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onReuse(item.expression)}
      style={[styles.itemRow, { backgroundColor: themeStyle.keyNumBg, borderColor: themeStyle.cardBorder }]}
    >
      <View style={styles.itemMain}>
        <Text style={[styles.expressionText, { color: themeStyle.textSecondary }]}>{item.expression}</Text>
        <Text style={[styles.resultText, { color: themeStyle.textPrimary }]}>= {item.result}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onReuse(item.expression)}>
          <CornerDownLeft color={themeStyle.textSecondary} size={18} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteFavoriteItem(item.id)}>
          <Trash color="#f87171" size={18} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
        <View style={styles.header}>
          <View style={styles.tabToggles}>
            <TouchableOpacity
              onPress={() => setActiveTab('history')}
              style={[styles.tabToggle, activeTab === 'history' && { borderBottomColor: themeStyle.accent }]}
            >
              <History color={activeTab === 'history' ? themeStyle.accent : themeStyle.textSecondary} size={18} />
              <Text style={[styles.tabToggleText, { color: activeTab === 'history' ? themeStyle.textPrimary : themeStyle.textSecondary }]}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('favorites')}
              style={[styles.tabToggle, activeTab === 'favorites' && { borderBottomColor: themeStyle.accent }]}
            >
              <Star color={activeTab === 'favorites' ? themeStyle.accent : themeStyle.textSecondary} size={18} />
              <Text style={[styles.tabToggleText, { color: activeTab === 'favorites' ? themeStyle.textPrimary : themeStyle.textSecondary }]}>Favorites</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'history' && sortedHistory.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearAllButton}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
          {activeTab === 'favorites' && sortedFavorites.length > 0 && (
            <TouchableOpacity onPress={handleClearFavorites} style={styles.clearAllButton}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab === 'history' ? (
          <FlatList
            data={sortedHistory}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ color: themeStyle.textSecondary }}>History is empty</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={sortedFavorites}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFavoriteItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Star color={themeStyle.textSecondary} size={28} style={{ marginBottom: 8 }} />
                <Text style={{ color: themeStyle.textSecondary }}>No starred calculations yet</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 10,
    marginBottom: 16,
  },
  tabToggles: {
    flexDirection: 'row',
  },
  tabToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 16,
  },
  tabToggleText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  clearAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearAllText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemMain: {
    flex: 1,
  },
  expressionText: {
    fontSize: 13,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
