'use client';

import dynamic from 'next/dynamic';

export const LiquidEtherClient = dynamic(() => import('./LiquidEther'), { ssr: false });
