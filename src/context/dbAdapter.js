import { db } from './db';

// Export the raw Dexie instance for use with useLiveQuery in Web components
export { db };

export const dbAdapter = {
  history: {
    getAll: () => db.history.toArray(),
    add: (item) => db.history.add(item),
    delete: (id) => db.history.delete(id),
    clear: () => db.history.clear(),
    put: (item) => db.history.put(item),
  },
  favorites: {
    getAll: () => db.favorites.toArray(),
    add: (item) => db.favorites.add(item),
    delete: (id) => db.favorites.delete(id),
    clear: () => db.favorites.clear(),
    put: (item) => db.favorites.put(item),
    findByExpression: async (expression) => {
      return db.favorites.where('expression').equals(expression).first();
    },
    deleteByExpression: async (expression) => {
      return db.favorites.where('expression').equals(expression).delete();
    },
  },
  currency_rates: {
    getAll: () => db.currency_rates.toArray(),
    get: (code) => db.currency_rates.get(code),
    update: (code, updates) => db.currency_rates.update(code, updates),
    clear: () => db.currency_rates.clear(),
    bulkAdd: (items) => db.currency_rates.bulkAdd(items),
    put: (item) => db.currency_rates.put(item),
    transaction: (mode, tables, callback) => db.transaction(mode, tables, callback),
  },
  unit_definitions: {
    getAll: () => db.unit_definitions.toArray(),
    clear: () => db.unit_definitions.clear(),
    bulkAdd: (items) => db.unit_definitions.bulkAdd(items),
    put: (item) => db.unit_definitions.put(item),
  },
  settings: {
    getAll: () => db.settings.toArray(),
    get: (key) => db.settings.get(key),
    put: (item) => db.settings.put(item),
    clear: () => db.settings.clear(),
    bulkAdd: (items) => db.settings.bulkAdd(items),
  },
  graphs: {
    getAll: () => db.graphs.toArray(),
    delete: (id) => db.graphs.delete(id),
    clear: () => db.graphs.clear(),
    bulkAdd: (items) => db.graphs.bulkAdd(items),
    put: (item) => db.graphs.put(item),
  }
};
