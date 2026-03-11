import { useState, useEffect, useCallback } from 'react';
import { getMyPlans, createPlan, getPendingInvites, respondToInvite } from '@/lib/api';
import type { Plan, PlanInvite, CreatePlanForm } from '@/types';

export function usePlans(userId: string | undefined) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PlanInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [p, i] = await Promise.all([
        getMyPlans(userId),
        getPendingInvites(userId),
      ]);
      setPlans(p);
      setPendingInvites(i);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function add(form: CreatePlanForm) {
    if (!userId) return;
    const plan = await createPlan(userId, form);
    setPlans((prev) => [plan, ...prev]);
    return plan;
  }

  async function respond(inviteId: string, status: 'accepted' | 'declined') {
    await respondToInvite(inviteId, status);
    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    await load(); // refresh plans list
  }

  return { plans, pendingInvites, loading, error, refresh: load, add, respond };
}
