import { observer } from "mobx-react";

const SliderButton: React.FC<{ buttonName: string; onClick: () => void }> = observer(({ buttonName, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex-1 flex items-center justify-center py-2 px-4 rounded-2xl whitespace-nowrap text-xs text-text-200 border border-blue-200 hover:bg-button-100/20">
      {buttonName}
    </button>
  );
});

export default SliderButton;