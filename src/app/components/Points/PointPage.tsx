'use client';

import React from 'react';
import { observer } from 'mobx-react';

const PointPage: React.FC = observer(() => {
  return (
    <div className="w-full h-auto overflow-hidden text-black px-4 md:px-48 mx-auto pt-16 md:pt-36">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm opacity-80">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <h2 className="text-purple-700 text-xl font-medium">Ignite Program</h2>
          </div>
          <p className="text-text-100 mb-4 text-sm">
          Engage in trading on OxiSwap to accumulate Ignite Tokens (IP). These tokens can be periodically converted into veOXI tokens, enhancing your potential for profit.
          </p>
          <a 
            href="https://oxiswap.gitbook.io/oxiswap/incentives/ignite-program"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center border border-purple-700/50 text-purple-700 hover:text-purple-800 hover:bg-purple-700/10 transition-all duration-300 rounded-full px-8 py-2 text-sm"
          >
            Ignite Program
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm opacity-80">
          <h3 className="text-xl mb-4">IP</h3>
          <div className="mb-2">
            <span className="text-3xl font-semibold">0</span>
          </div>
          <p className="text-text-100">Cumulative Supply</p>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm opacity-80">
            <h3 className="text-xl mb-6">Your Ignite Stats</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-text-100">Current Balance</p>
                </div>
                <p className="text-xl font-medium">0 IP</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-text-100">Pending Rewards</p>
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                    24h
                  </span>
                </div>
                <p className="text-xl font-medium">0 IP</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm opacity-80">
            <div className="mb-6">
              <span className="text-3xl font-semibold">0</span>
              <span className="text-text-300 ml-2">veOXI</span>
            </div>
            <button className="w-full py-2 px-4 bg-gray-50 text-purple-700 rounded-lg hover:bg-gray-100 transition-colors">
              No reward to claim
            </button>
            <p className="text-text-100 mt-4 text-sm">
            Your rewards are determined by your share of IP tokens and the total distribution of veOXI tokens for that period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PointPage;