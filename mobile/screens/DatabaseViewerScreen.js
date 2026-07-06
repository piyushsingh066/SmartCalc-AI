import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Database, Trash, RefreshCw } from 'lucide-react-native';
import { dbAdapter } from '../../src/context/dbAdapter';

const TABLES = ['history', 'favorites', 'currency_rates', 'unit_definitions', 'settings', 'graphs'];

export default function DatabaseViewerScreen({ themeStyle, onToast }) {
  const [activeTable, setActiveTable] = useState('history');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let records = [];
      if (activeTable === 'history') records = await dbAdapter.history.getAll();
      else if (activeTable === 'favorites') records = await dbAdapter.favorites.getAll();
      else if (activeTable === 'currency_rates') records = await dbAdapter.currency_rates.getAll();
      else if (activeTable === 'unit_definitions') records = await dbAdapter.unit_definitions.getAll();
      else if (activeTable === 'settings') records = await dbAdapter.settings.getAll();
      else if (activeTable === 'graphs') records = await dbAdapter.graphs.getAll();
      setData(records);
    } catch (e) {
      console.error(e);
      onToast('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [activeTable]);

  const handleDeleteItem = async (item) => {
    try {
      if (activeTable === 'history') await dbAdapter.history.delete(item.id);
      else if (activeTable === 'favorites') await dbAdapter.favorites.delete(item.id);
      else if (activeTable === 'currency_rates') await dbAdapter.currency_rates.delete(item.code);
      else if (activeTable === 'unit_definitions') await dbAdapter.unit_definitions.delete(item.id);
      else if (activeTable === 'settings') await dbAdapter.settings.delete(item.key);
      else if (activeTable === 'graphs') await dbAdapter.graphs.delete(item.id);
      onToast('Item deleted successfully');
      fetchRecords();
    } catch (e) {
      console.error(e);
      onToast('Failed to delete item');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.itemRow, { backgroundColor: themeStyle.keyNumBg, borderColor: themeStyle.cardBorder }]}>
        <View style={styles.itemContent}>
          <Text style={[styles.itemText, { color: themeStyle.textPrimary }]} numberOfLines={3}>
            {JSON.stringify(item)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteItem(item)}
          style={[styles.deleteButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
        >
          <Trash color="#ef4444" size={18} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
        <View style={styles.header}>
          <Database color={themeStyle.textPrimary} size={24} />
          <Text style={[styles.headerTitle, { color: themeStyle.textPrimary }]}>Local Database Inspector</Text>
          <TouchableOpacity onPress={fetchRecords} disabled={loading} style={styles.refreshButton}>
            <RefreshCw color={themeStyle.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {TABLES.map(table => (
            <TouchableOpacity
              key={table}
              onPress={() => setActiveTable(table)}
              style={[
                styles.tabButton,
                activeTable === table && { backgroundColor: themeStyle.accent }
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTable === table ? '#fff' : themeStyle.textSecondary }
                ]}
              >
                {table}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.recordsCount, { color: themeStyle.textSecondary }]}>
          Records: {data.length}
        </Text>

        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: themeStyle.textSecondary }}>No records in this table</Text>
            </View>
          }
        />
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  refreshButton: {
    padding: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    maxHeight: 44,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recordsCount: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  }
});
