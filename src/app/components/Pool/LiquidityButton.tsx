import React from 'react';
import { ButtonProps } from '@utils/interface';
import { useStores } from '@stores/useStores';
import { observer } from 'mobx-react';

const LiquidityButton: React.FC<Pick<ButtonProps, 'onAction'>> = observer(({ onAction }) => {
  const { buttonStore } = useStores();

  return (
    <button
      onClick={onAction}
      disabled={buttonStore.positionButtonDisabled}
      className={`
        text-sm w-full px-4 py-2 mt-2 mb-1 rounded-lg flex items-center justify-center transition-colors 
        ${buttonStore.positionButtonClassName}
      `}>
      <span>{buttonStore.positionButtonName}</span>
    </button>
  );
});

export default LiquidityButton;