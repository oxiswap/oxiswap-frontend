import React from "react";
import PositionPage from "@components/Position/PositionPage";
import { Metadata } from 'next';

export const runtime = "edge";

export const metadata: Metadata = {
  title: 'Pool',
};

export default function Pool() {
  return (
    <div className="w-full">
      <PositionPage />
    </div>
  );
}