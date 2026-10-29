import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { queryClient } from './api';
import type { MarketEvent } from './contracts';
export function useRealtime(userId?: string) {
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    let socket: Socket | undefined;
    const versions = new Map<string, number>();
    const accept = (type: string, event: MarketEvent) => {
      if (!active || (event.userId && event.userId !== userId)) return;
      const key = type + event.resourceId;
      if ((versions.get(key) || 0) >= event.version) return;
      versions.set(key, event.version);
      if (type === 'nft') {
        setNotice('Preço ou disponibilidade atualizado em tempo real. Revise seu carrinho.');
        for (const key of ['nfts', 'nft', 'cart', 'quote'])
          void queryClient.invalidateQueries({ queryKey: [key] });
      } else {
        void queryClient.invalidateQueries({ queryKey: ['order', userId, event.resourceId] });
        void queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    };
    // Engine.IO captures WebSocket at import time: load after MSW starts.
    void import('socket.io-client').then(({ io }) => {
      if (!active) return;
      socket = io('wss://realtime.greenmint.test', {
        transports: ['websocket'],
        reconnectionDelay: 500,
      });
      socket.on('connect', () => {
        if (active) void queryClient.invalidateQueries();
      });
      socket.on('nft.updated', (e) => accept('nft', e));
      socket.on('order.updated', (e) => accept('order', e));
      socket.on('disconnect', () => {
        if (active) setNotice('Conexão interrompida. Reconectando e recuperando dados…');
      });
    });
    return () => {
      active = false;
      socket?.removeAllListeners();
      socket?.disconnect();
      setNotice('');
    };
  }, [userId]);
  return notice;
}
