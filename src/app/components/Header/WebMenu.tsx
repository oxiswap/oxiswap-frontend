import Link from 'next/link';

const WebMenu = ({ onLinkClick, pathname }: { onLinkClick: (path: string) => void, pathname: string }) => {
  return (
    <>
      <button 
        onClick={() => onLinkClick("/swap")}
        className={`transition-colors ${pathname === '/swap' || pathname === '/' ? 'text-black' : 'hover:text-black text-text-300'}`}
      >
        <span>Trade</span>
      </button>
      <button
        onClick={() => onLinkClick("/explore/pool")}
        className={`transition-colors ${pathname === '/explore/pool' ? 'text-black' : 'hover:text-black text-text-300'}`}
      >
        <span>Explore</span>
      </button>
      <button
        onClick={() => onLinkClick("/pool")}
        className={`transition-colors ${pathname === '/pool' ? 'text-black' : 'hover:text-black text-text-300'}`}
      >
        <span>Pool</span>
      </button>

      <Link href="https://app.fuel.network/bridge?from=eth&to=fuel&auto_close=true&=true" target="_blank" rel="noopener noreferrer" className="text-text-300 w-full">
        <span>Bridge</span>
      </Link>

      <div className="flex flex-row items-center space-x-1 text-text-300 opacity-70 cursor-default">
        <span>Points</span>
        <div className="flex items-center">
          <div
            className="min-w-[40px] h-5 px-2 bg-blue-400 rounded-full flex items-center justify-center text-[10px] text-white"
            title="Points feature coming soon"
            aria-label="Points feature coming soon"
          >
            Soon
          </div>
        </div>
      </div>
    </>
  );
};
   
export default WebMenu;