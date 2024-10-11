import Image from "next/image";

const Rewards = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center w-full">
      <Image src="/position.svg" alt="position" width={46} height={46} />
      <span className="text-xs text-text-100 ml-1">No results.</span>
    </div>
  );
};

export default Rewards;