'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LogoDropMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { category: 'Company', items: [{ label: 'Blog', href: 'https://oxiswap.medium.com/' }] },
    { 
      category: 'Protocol', 
      items: [
        { label: 'Developer', href: 'https://oxiswap.gitbook.io' },
      ] 
    },
  ];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className='flex items-center'>
        <Image src="/oxiswap.png" alt='oxiswap' width={24} height={24} />
        <Image
          src="/right.svg"
          alt="rightIcon"
          width={12}
          height={12}
          className="text-white ml-2 rotate-90 transition-all duration-300 hover:-rotate-90"
        />
      </div>
      
      <ul className={`
        absolute left-0 top-full mt-2 w-48 bg-white md:bg-opacity-80 rounded-md shadow-lg z-20 overflow-hidden transition-all duration-300 ease-in-out 
        ${isOpen ? 'max-h-96' : 'max-h-0'}
      `}
      >
        <div className='flex flex-col px-2 py-4'>
          {menuItems.map((category, index) => (
            <li key={index} className="py-2">
              <h3 className="px-4 text-sm font-semibold text-black">{category.category}</h3>
              <ul>
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link 
                      href={item.href}
                      className="block px-4 py-2 text-xs text-gray-400 hover:bg-gray-100 transition-colors duration-200"
                      target="_blank"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </div>
        <div className='border-t border-gray-200 mx-6 mb-2'></div>
        <div className='flex flex-row px-6 pt-2 pb-6 space-x-4'>
          <Link 
            href="https://x.com/oxiswap" 
            className='flex items-center group' 
            target='_blank'
          >
            <div className="transition-all duration-300 transform group-hover:animate-wiggle-zoom">
              <Image src="/x.svg" alt='twitter' width={24} height={24} />
            </div>
          </Link>
          <Link 
            href="https://discord.gg/oxiswap" 
            className='flex items-center group' 
            target='_blank'
          >
            <div className="transition-all duration-300 transform group-hover:animate-wiggle-zoom">
              <Image src="/discord.svg" alt='discord' width={24} height={24} />
            </div>
          </Link>
          <Link 
            href="https://github.com/oxiswap" 
            className='flex items-center group' 
            target='_blank'
          >
            <div className="transition-all duration-300 transform group-hover:animate-wiggle-zoom">
              <Image src="/github.svg" alt='github' width={24} height={24} />
            </div>
          </Link>
        </div>
      </ul>
      
    </div>
  );
};

export default LogoDropMenu;