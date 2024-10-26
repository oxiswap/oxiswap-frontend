import Image from "next/image";

const SwapSeparator = ({ onClick }: { onClick: () => void }) => {

  return (
    <button className="absolute left-1/2 top-1/3 mt-12 transform -translate-x-1/2 -translate-y-1/2 z-10" onClick={onClick}>
      <div className="bg-oxi-bg-02 border-4 border-white rounded-lg p-1.5">
        <Image src="/swap-separator.svg" alt="separator" width={16} height={16} className="hover:rotate-180 transition-all duration-300" />
      </div>
    </button>
  );
};


export default SwapSeparator;