'use client';
import React from 'react';
import { ButtonProps } from '@utils/interface';
import { observer } from 'mobx-react';
import { useStores } from '@stores/useStores';

const SwapButton: React.FC<Pick<ButtonProps, 'onAction'>> = observer(({ onAction }) => {
    const { buttonStore } = useStores();
    return (
      <button
        onClick={onAction}
        disabled={buttonStore.swapButton.disabled}
        className={`
          border border-transparent text-base px-4 py-2 mt-2 rounded-2xl flex items-center justify-center transition-colors 
          ${buttonStore.swapButton.className}
        `}>
        <span>{buttonStore.swapButton.text}</span>
      </button>
    );
  }
);

export default SwapButton;
