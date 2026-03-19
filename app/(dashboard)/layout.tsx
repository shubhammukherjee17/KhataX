'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatAssistant } from '@/components/ai/ChatAssistant';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { businessId } = useAuth();
  const setBusinessIdMaster = useMasterDataStore((state) => state.setBusinessId);
  const setBusinessIdTx = useTransactionStore((state) => state.setBusinessId);

  useEffect(() => {
    setBusinessIdMaster(businessId);
    setBusinessIdTx(businessId);
  }, [businessId, setBusinessIdMaster, setBusinessIdTx]);

  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <ChatAssistant />
    </>
  );
}
