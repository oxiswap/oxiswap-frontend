
const DrawAssetIcon = ({ assetName, className }: { assetName: string, className?: string }) => {
  return (
    <div className={`${className}`}>
      {assetName.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default DrawAssetIcon;
