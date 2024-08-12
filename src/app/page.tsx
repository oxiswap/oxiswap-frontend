// pages/index.tsx
'use client'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'


export default function Home() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex bg-nav-200">
      <Head>
        <title>Oxiswap | Lightning-Fast Decentralized Exchange Built On The Fuel Network</title>
        <link rel="icon" href='/favicon.ico' sizes='any' />
      </Head>

      <main className="flex flex-col mx-4 md:mx-8 lg:mx-36 bg-nav-200 bg-custom-radial bg-custom-size bg-custom-position animate-move-up md:relative justify-between w-full min-h-screen overflow-hidden">
        <header className="flex flex-col pb-8 md:pd-14">
          <nav className="container items-center justify-between flex flex-row gap-3 top-0 pr-4 md:pr-20">
            <Link className="gap-2 z-50 flex items-center justify-center" href="/" title="oxiswap">
              <Image src="/oxiswap.svg" alt="fuelswap" width={128} height={32} />
            </Link>
            <div className='md:hidden'>
              <button onClick={() => setMenuOpen(!isMenuOpen)} className='text-text-100'>
                {isMenuOpen ? (
                  <Image src='/close.svg' alt='menu open' width={20} height={20} />
                ) : (
                  <Image src='menu.svg' alt='menu close' width={20} height={20} />
                )}
              </button>
            </div>
            <div className={`flex flex-row items-center justify-end space-x-4 ${isMenuOpen ? 'absolute top-16 right-4 p-4 rounded-md bg-nav-200' : 'hidden md:flex'}`}>
              <Link href="https://x.com/oxiswap" title='twitter' className='flex items-center justify-center hover:opacity-75' target="_blank" rel="noopener noreferrer">
                <Image src='/twitter_icon.svg' alt='twitter' width={20} height={20} />
              </Link>
              <Link href="https://discord.gg/oxiswap" title='discord' className='flex ietms-center justify-center hover:opacity-75' target="_blank" rel="noopener noreferrer">
                <Image src='/discord_icon.svg' alt='discord' width={20} height={20} />
              </Link>
              <Link className="flex ietms-center justify-center border border-gray-700 text-text-100 bg-nav-200 py-2 px-4 rounded-full hover:border-[#A87FFB]"
                target="_blank" rel="noopener noreferrer" href="https://github.com/oxiswap">
                <Image src="/github.svg" alt="github" width={20} height={20} className="mr-2" />
                <span>Github</span>
              </Link>
            </div>
          </nav>

          <div className="flex flex-col items-start md:items-center justify-center mt-60 md:mt-14 mr-4 md:mr-12">
            <div className="text-text-200 font-medium text-xs md:text-sm mb-2">
              Built for Fuel
            </div>
            <h1 className="text-text-100 text-lg md:text-4xl lg:text-5xl text-left md:text-center font-bold line-clamp-2 mb-4 md:mb-6">
              Lightning-Fast Decentralized Exchange <br/>Built On The Fuel Network
            </h1>
            <p className="text-[#808C9C] text-left md:text-center text-xs md:text-base mb-8 tracking-wider leading-relaxed md:line-clamp-3">
              Trade, earn, and build on the advanced DEX powered by the Fuel network.
              <span className='hidden md:inline'><br/></span>
              Utilizing the Sway language and UTXO model,
              Oxiswap delivers <span className='hidden md:inline'><br/></span> an ultimate decentralized trading experience
            </p>

            <div className='flex mt-2 md:mt-16 space-x-4 items-center justify-center'>
              <Link target='_blank' rel='noopener noreferrer' href='https://docs.oxiswap.com'>
                <button className='flex ietms-center justify-center text-sm border border-gray-700 text-text-100 bg-nav-200 py-2 px-4 rounded-full hover:border-[#A87FFB]'>
                  Read Docs
                </button>
              </Link>
              <Link target='_blank' rel='noopener noreferrer' href='https://app.oxiswap.com' className='flex ietms-center justify-center text-sm border border-gray-700 text-[#10151D] bg-[#A87FFB] py-2 px-4 space-x-1 rounded-full hover:bg-white hover:border-[#A87FFB]'>
                <span>Launch App</span>
                <Image src='/right.svg' alt='right' width={15} height={15} />
              </Link>
            </div>
          </div>

        </header>
        <footer className="text-start md:text-center py-2 md:py-8 md:pr-12">
          <div>
            <p className="bg-nav-200 text-text-100 md:px-4 py-2 inline-block text-xs md:text-sm">© 2024 Oxiswap Ltd. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}