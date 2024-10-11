import React from 'react';
import { Skeleton } from 'antd';

export const SkeletonLoader: React.FC = () => (
  <>
    <Skeleton.Input style={{ width: '100%', height: '16px' }} active size="small" />
    <Skeleton.Input style={{ width: '100%', height: '16px' }} active size="small" />
  </>
);