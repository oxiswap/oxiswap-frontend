import React from 'react';
import { observer } from 'mobx-react';
import { PopupModalProps } from '@utils/interface';


const PopupModal: React.FC<PopupModalProps> = observer(({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
});

export default PopupModal;