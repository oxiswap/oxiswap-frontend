'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Notification } from '@utils/interface';
import { useStores } from '@stores/useStores';
import { observer } from 'mobx-react';
import TickIcon from '@assets/icons/tickIcon';


const SwapNotification: React.FC = observer(() => {
  const { notificationStore } = useStores();
  const [openNotification, setOpenNotification] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const handleNotifications = useCallback(() => {
    const notificationLength = notificationStore.notifications.length;
    if (notificationLength > 0) {
      if (notificationLength > openNotification.length) {
        const newNotification = notificationStore.notifications[notificationLength - 1];
        setIsVisible(true);
        setTimeout(() => {
          setOpenNotification(prev => [...prev, { ...newNotification, open: false }]);
          setTimeout(() => {
            setOpenNotification(prev => prev.map((notif, index) => index === prev.length - 1 ? { ...notif, open: true } : notif));
          }, 50);
        }, 50);
        
      } else {
        const hasSucceed = notificationStore.notifications.some(notif => notif.type === 'succeed');
        const delay = hasSucceed ? 5000 : 10000;

        if (hasSucceed) {
          const submittedIndex = openNotification.findIndex(notif => notif.type === 'submitted');
          if (submittedIndex !== -1) {
            setOpenNotification(prev => {
              const newNotifications = [...prev];
              newNotifications.splice(submittedIndex, 1);
              return newNotifications;
            });
            notificationStore.removeNotification(notificationStore.notifications[submittedIndex].id);
          }
        }

        setTimeout(() => {
          setOpenNotification(prev => prev.map((notif, index) => index === 0 ? { ...notif, open: false } : notif));
          setTimeout(() => {
            setOpenNotification(prev => {
              const newNotifications = prev.slice(1);
              if (newNotifications.length === 0) {
                setIsVisible(false);
              }
              return newNotifications;
            });
            if (notificationStore.notifications.length > 0) {
              notificationStore.removeNotification(notificationStore.notifications[0].id);
            }
          }, 300);
        }, delay);
      }
    }

  }, [notificationStore.notifications.length, openNotification.length]);

  useEffect(() => {
    handleNotifications();
  }, [handleNotifications]);

  // Swap 20.0 USDT for 0.01 ETH
  const renderNotifiContent = (notif: Notification) => {
    const isSubmitted = notif.type === 'submitted';
    return (
      <div className="flex flex-row p-4 relative bg-white rounded-lg shadow-md mb-2">
        <button onClick={() => notificationStore.removeNotification(notif.id)}>
          {!isSubmitted && (
            <Image
              src="/close.svg"
              alt="close"
              width={16}
              height={16}
              className="absolute top-2 right-2"
            />
          )}
        </button>
        {isSubmitted ? (
          <Image src="/tx-pending.svg" alt="status" width={36} height={36} />
        ) : (
          <TickIcon size={36} color="#7ed321" />
        )}
        <div className="flex flex-col text-black text-xs ml-3 justify-center">
          <span>{isSubmitted ? "Submitted" : "Succeed"}</span>
          <span className="text-[10px]">{notif.message}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`
        fixed top-30 right-4 z-50 transition-all duration-300 ease-in-out flex flex-col
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
    >
      {openNotification.map((notif, index) => (
        <div 
          key={notif.id} 
          className={`
            transition-all duration-300 ease-in-out
            ${notif.open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
          `}
          style={{
            transitionDelay: `${index * 100}ms`
          }}
        >
          {renderNotifiContent(notif)}
        </div>
      ))}
    </div>
  );
});

export default SwapNotification;