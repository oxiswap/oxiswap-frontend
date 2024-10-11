'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HeaderProps } from '@utils/interface';
import useResponsive from '@hooks/useResponsive';
import { useStores } from '@stores/useStores';
import { observer } from 'mobx-react';
import { useWallet } from '@hooks/useWallet';
import LogoDropMenu from './LogoDropMenu';
import { useRouter } from 'next/navigation';
import AbstractIcon from '@components/Header/CreateAbstractIcon';

const Header: React.FC<HeaderProps> = observer(({ onDisconnected }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useResponsive();
  const { accountStore, balanceStore } = useStores();
  const { connect } = useWallet();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLinks = () => {
    const handleLinkClick = (path: string) => {
      if (isMobile) {
        setIsMenuOpen(false);
      }
      router.push(path);
    };

    return (
      <>
        <button 
          onClick={() => handleLinkClick("/swap")}
          className={`transition-colors ${pathname === '/swap' || pathname === '/' ? 'text-black' : 'hover:text-black text-text-300'}`}
        >
          <span>Trade</span>
        </button>
        <button
          onClick={() => handleLinkClick("/explore/pool")}
          className={`transition-colors ${pathname === '/explore/pool' ? 'text-black' : 'hover:text-black text-text-300'}`}
        >
          <span>Explore</span>
        </button>
        <button
          onClick={() => handleLinkClick("/pool")}
          className={`transition-colors ${pathname === '/pool' ? 'text-black' : 'hover:text-black text-text-300'}`}
        >
          <span>Pool</span>
        </button>
      </>
    );
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-4 py-4 md:py-6 font-basel-grotesk-book transition-all duration-300 ${isScrolled ? 'border border-t-white border-t-1 backdrop-blur-xl' : ''}`}>
      <div className='container mx-auto flex justify-between items-center'>
        <div className='flex items-center space-x-4 md:space-x-8'>
          <LogoDropMenu />
          {!isMobile && (
            <nav className='hidden md:flex space-x-6 font-basel-grotesk-book'>
              <NavLinks />
            </nav>
          )}
        </div>

        <div className='flex items-center space-x-2 md:space-x-4'>
          {!isMobile && (
            <button className='bg-gradient-to-r from-blue-500 to-blue-700 hover:border-white border border-transparent text-xs text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors'>
              <Image src="/fuel-icon.svg" alt='network' width={16} height={16}/>
              <span>Fuel Testnet</span>
            </button>
          )}
          {isMobile && (
            <>
              <button className='bg-gradient-to-r from-blue-500 to-blue-700 hover:border-white border-transparent text-sm text-white py-2 px-3 mr-2 rounded-md flex items-center transition-colors'>
                <Image src="/fuel-icon.svg" alt='network' width={16} height={16}/>
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
                <Image src="/menu.svg" alt='menu' width={24} height={24}/>
              </button>
            </>
          )}
          {!isMobile && (
            accountStore.isConnected ? (
              <div
                onClick={onDisconnected}
                className='flex items-center bg-white text-xs rounded-md overflow-hidden'
              > 
                <button className='flex items-center space-x-2 px-3 py-2'>
                  <Image src="/fuel-icon.svg" alt='wallet' width={16} height={16}/>
                  <span>{balanceStore.getNativeBalance() || 0.0000} ETH</span>
                </button>
                <button className='bg-oxi-bg-02 px-3 py-2 border border-transparent box-border hover:border-blue-200 transition-colors rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <AbstractIcon address={accountStore.getAddress?.toString() ?? ""} size={16} />
                    <span>
                      {accountStore.getAddress?.toString().slice(0, 6)}...{accountStore.getAddress?.toString().slice(-4)}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <button 
                onClick={connect}
                className='bg-button-100/30 hover:bg-button-100/50 text-xs text-text-200 px-4 py-2 rounded-md flex items-center space-x-2 transition-colors'
              >
                <Image src="/fuel-icon.svg" alt='wallet' width={16} height={16}/>
                <span>Connect Wallet</span>
              </button>
            )
          )}
        </div>
      </div>

      {isMobile && (
        <div
          className={`fixed inset-0 bg-white z-50 p-4 transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between mt-2">
            <Image src="/oxiswap.svg" alt="OxiSwap logo" width={120} height={120} />
            <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
              <Image src="/close.svg" alt="Close" width={24} height={24} />
            </button>
          </div>
          <nav className="flex flex-col space-y-4 mt-2">
            <NavLinks />
          </nav>
        </div>
      )}

      {isMobile && (
        <>
          <div className="fixed bottom-10 left-0 right-0 border-t-blue-100 border-t-1 p-4"></div>
          <div className="fixed bottom-0 right-0 p-4">
            {accountStore.isConnected ? (
              <div
                onClick={onDisconnected}
                className='flex flex-row items-end bg-white text-sm rounded-md overflow-hidden'
              > 
                <button className='flex items-center space-x-2 px-3 py-2'>
                  <Image src="/fuel-icon.svg" alt='wallet' width={16} height={16}/>
                  <span>{balanceStore.getNativeBalance() || 0.0000} ETH</span>
                </button>
                <button className='bg-oxi-bg-02 px-3 py-2 border border-transparent box-border hover:border-blue-200 transition-colors rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <AbstractIcon address={accountStore.getAddress?.toString() ?? ""} size={16} />
                    <span>
                      {accountStore.getAddress?.toString().slice(0, 6)}...{accountStore.getAddress?.toString().slice(-4)}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <button 
                onClick={connect}
                className='bg-button-100/30 hover:bg-button-100/50 text-sm text-text-200 px-4 py-2 rounded-md flex items-center space-x-2 transition-colors'
              >
                <Image src="/fuel-icon.svg" alt='wallet' width={16} height={16}/>
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </>
      )}
    </header>
  );
});

export default Header;