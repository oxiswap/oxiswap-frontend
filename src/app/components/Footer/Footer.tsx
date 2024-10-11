'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Provider } from 'fuels';
import { FUEL_PROVIDER_URL } from '@utils/interface';
import useResponsive from '@hooks/useResponsive';

const Footer: React.FC = () => {
  const [currentBlockNumber, setCurrentBlockNumber] = useState<string>('');
  const isMobile = useResponsive();

  const handleBlock = async () => {
    try {
      const provider = await Provider.create(FUEL_PROVIDER_URL);
      const blockNumber = await provider.getBlockNumber();
      setCurrentBlockNumber(blockNumber.toString());
    } catch (error) {
      setCurrentBlockNumber(currentBlockNumber);
    }
  };

  useEffect(() => {
    handleBlock();

    const intervalId = setInterval(handleBlock, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      {!isMobile && (
        <footer className="absolute bottom-2 left-0 right-0 text-gray-600 py-4 px-14 flex justify-between items-center text-sm">
          <Link href="https://fuel.network/" target="_blank" rel="noopener noreferrer" className="flex items-center flex-row space-x-2">
            <div className="flex items-center flex-row space-x-2">
              <Image src="/fuel-icon.svg" alt="OxiSwap" width={16} height={16} />
              <span className="text-text-300 hover:text-blue-500">Powered by Fuel</span>
            </div>
            <span>© 2024 OxiSwap</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Link href="https://github.com/oxiswap" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors items-center">
              <Image src="/github.svg" alt="GitHub" width={16} height={16} />
            </Link>
            <Link href="https://discord.gg/oxiswap" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors items-center">
              <Image src="/discord.svg" alt="Discord" width={16} height={16} />
            </Link>
            <Link href="https://x.com/oxiswap" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors items-center">
              <Image src="/x.svg" alt="X" width={16} height={16} />
            </Link>
            <Link href="https://oxiswap.gitbook.io/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors items-center flex flex-row space-x-2">
              <Image src="/gitbook.svg" alt="Gitbook" width={16} height={16} />
            </Link>
            <Link href={`https://app.fuel.network/block/${currentBlockNumber}/simple`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors items-center flex flex-row space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span>{currentBlockNumber}</span>
            </Link>
          </div>
        </footer>
      )
    }
    </>

  );
};

export default Footer;