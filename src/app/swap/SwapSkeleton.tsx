import React from 'react';

export const SwapSkeleton: React.FC = () => (
  <div className="w-full max-w-md mx-auto p-4">
    <div className="h-64 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
    <div className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
  </div>
);