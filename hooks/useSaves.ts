import { useState, useEffect, useCallback } from 'react';
import { getSaves, createSave, deleteSave } from '@/lib/api';
import type { Save, CreateSaveForm } from '@/types';

export function useSaves(userId: string | undefined) {
  const [saves, setSaves] = useState<Save[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setSaves(await getSaves(userId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function add(form: CreateSaveForm) {
    if (!userId) return;
    const save = await createSave(userId, form);
    setSaves((prev) => [save, ...prev]);
    return save;
  }

  async function remove(saveId: string) {
    await deleteSave(saveId);
    setSaves((prev) => prev.filter((s) => s.id !== saveId));
  }

  return { saves, loading, error, refresh: load, add, remove };
}
