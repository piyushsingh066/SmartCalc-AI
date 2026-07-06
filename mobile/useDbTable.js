import { useState, useEffect } from 'react';
import { dbAdapter, subscribeToTable } from '../src/context/dbAdapter';

export function useDbTable(tableName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const result = await dbAdapter[tableName].getAll();
        if (active) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Failed to fetch from ${tableName}`, err);
      }
    };

    fetchData();

    // Subscribe to updates on this table
    const unsubscribe = subscribeToTable(tableName, () => {
      fetchData();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [tableName]);

  return [data, loading];
}
