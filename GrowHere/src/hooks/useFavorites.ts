import { useCallback, useEffect, useState } from 'react';

import { getFavorites, setFavorites as saveFavorites } from '@/lib/storage';

export function useFavorites() {
  const [favorites, setFavoritesState] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    getFavorites().then((ids) => {
      if (mounted) {
        setFavoritesState(ids);
        setLoaded(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFavorite = useCallback((plantId: string) => {
    setFavoritesState((prev) => {
      const next = prev.includes(plantId) ? prev.filter((id) => id !== plantId) : [...prev, plantId];
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((plantId: string) => favorites.includes(plantId), [favorites]);

  return { favorites, loaded, toggleFavorite, isFavorite };
}
