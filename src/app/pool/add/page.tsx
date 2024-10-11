import React from 'react';
import CreatePosition from '@components/Position/CreatePosition';

export const runtime = "edge";

export default function AddPage() {
  return (
    <div className="w-full">
      <CreatePosition />
    </div>
  );
}
