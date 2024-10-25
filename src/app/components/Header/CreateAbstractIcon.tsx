import React, { useMemo } from 'react';
import { sha256 } from 'js-sha256';

interface AbstractIconProps {
  address: string;
  size?: number;
}

const AbstractIcon: React.FC<AbstractIconProps> = ({ address, size = 80 }) => {
  const svgContent = useMemo(() => {
    const hash = sha256(address);
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F06292', '#AED581', '#FFD54F',
      '#FF99C8', '#FCF6BD', '#D0F4DE', '#A9DEF9',
      '#E4C1F9', '#FF8FA3', '#B1E693', '#FB9F89',
      '#FF00FF', '#00FF00', '#00FFFF', '#FF0099',
      '#FF0066', '#00FF99', '#00FFCC', '#CC00FF',
      '#582F0E', '#7F4F24', '#936639', '#A68A64',
      '#B6AD90', '#C2C5AA', '#A4AC86', '#656D4A'
    ];

    const elementSize = size / 4;
    const elements = Array.from({ length: 16 }, (_, i) => {
      const color = colors[parseInt(hash.substr(i * 2, 2), 16) % colors.length];
      const x = (i % 4) * elementSize + elementSize / 2;
      const y = Math.floor(i / 4) * elementSize + elementSize / 2;
      const shapeSize = elementSize * 0.5 + (parseInt(hash.substr(i * 2, 2), 16) % (elementSize * 0.5));
      const shape = parseInt(hash.substr(i * 2, 2), 16) % 3;

      switch (shape) {
        case 0:
          return `<circle cx="${x}" cy="${y}" r="${shapeSize / 2}" fill="${color}" />`;
        case 1:
          return `<rect x="${x - shapeSize / 2}" y="${y - shapeSize / 2}" width="${shapeSize}" height="${shapeSize}" fill="${color}" transform="rotate(${45 + i * 10}, ${x}, ${y})" />`;
        case 2:
          return `<polygon points="${x},${y - shapeSize / 2} ${x + shapeSize / 2},${y + shapeSize / 2} ${x - shapeSize / 2},${y + shapeSize / 2}" fill="${color}" />`;
      }
    }).join('');

    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#f0f0f0" />
      ${elements}
    </svg>`;
  }, [address, size]);

  return (
    <div 
      className={`rounded-full overflow-hidden`} 
      style={{ width: `${size}px`, height: `${size}px` }}
      dangerouslySetInnerHTML={{ __html: svgContent }} 
    />
  );
};

export default AbstractIcon;