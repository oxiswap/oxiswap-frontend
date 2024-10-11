import React from "react";
import PositionPage from "@components/Position/PositionPage";


export const runtime = "edge";

export default function Pool() {
  return (
    <div className="w-full">
      <PositionPage />
    </div>
  );
}