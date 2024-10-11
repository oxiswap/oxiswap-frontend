'use client'

import React from 'react';
// import SwapPage from './swap/page';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react';

const SwapPage = dynamic(() => import('./swap/page'), { ssr: false });
export const runtime = "edge";

function Page() {
  return (
    <div className="flex">
      <SwapPage />
    </div>
  );
}


export default observer(Page);