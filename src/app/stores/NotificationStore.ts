import { makeObservable, observable, action } from "mobx";
import  RootStore from "@stores/RootStore";
import { Notification } from "@utils/interface";


class NotificationStore {
  @observable notificationVisible: boolean = false;
  @observable notifications: Notification[] = [];
  @observable addLiquidityNotificationVisible: boolean = false;
  @observable notificationStates: { [key: string]: boolean } = {
    general: false,
    addLiquidity: false
  };


  constructor(rootStore: RootStore) {
    makeObservable(this);
  }

  
  @action
  setNotificationVisible(key: string, visible: boolean) {
    this.notificationStates[key] = visible;
  }

  @action
  setAddLiquidityNotificationVisible(visible: boolean) {
    this.addLiquidityNotificationVisible = visible;
  }

  @action
  addNotification(notification: Omit<Notification, 'id'> & { id?: string }) {
    const id = notification.id || Date.now().toString();
    this.notifications.push({ ...notification, id });
    return id; 
  }

  @action
  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  @action
  clearNotifications() {
    this.notifications = [];
  }

  @action
  updateNotification(id: string, updates: Partial<Notification>) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index] = { ...this.notifications[index], ...updates };
    }
  }

  @action
  transitionNotificationState(id: string, newType: 'submitted' | 'succeed' | 'error', newMessage?: string) {
    const notification = this.getNotification(id);
    if (notification) {
      this.updateNotification(id, { type: newType, message: newMessage || notification.message });
    }
  }

  getNotification(id: string): Notification | undefined {
    return this.notifications.find(n => n.id === id);
  }
}


export default NotificationStore;