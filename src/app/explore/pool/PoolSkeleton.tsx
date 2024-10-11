import React from 'react';

const PoolSkeleton: React.FC = () => (
  <div className="max-w-[600px] mx-auto px-4 md:px-0">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
    {[...Array(3)].map((_, index) => (
      <div key={index} className="mb-4">
        <div className="h-20 bg-gray-200 rounded-3xl animate-pulse"></div>
      </div>
    ))}
  </div>
);

export default PoolSkeleton;