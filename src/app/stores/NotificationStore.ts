import { makeObservable, observable, action } from "mobx";
import { Notification } from "@utils/interface";

class NotificationStore {
  @observable notifications: Notification[] = [];

  constructor() {
    makeObservable(this);
  }

  @action
  addNotification(notification: Omit<Notification, 'id'>): string {
    const id = `${Date.now()}-${performance.now().toFixed(3)}`;
    this.notifications.push({ ...notification, id });
    return id;
  }

  @action
  updateNotification(id: string, updates: Partial<Notification>) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index] = { ...this.notifications[index], ...updates };
    }
  }

  @action
  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  @action
  async handleMultiStepTransactionNotification(
    initialMessage: string,
    transactionPromise: Promise<any>,
    onAction?: () => void
  ) {
    const submittedId = this.addNotification({
      open: true,
      type: 'submitted',
      message: `${initialMessage}`
    });

    try {
      const result = await transactionPromise;
      this.removeNotification(submittedId);

      if (result.success) {
        this.addNotification({
          open: true,
          type: 'succeed',
          message: `${initialMessage}`
        });
        onAction && onAction();
      } else if (result.userCancelled) {
        this.addNotification({
          open: true,
          type: 'error',
          message: 'Transaction Cancelled by user'
        });
      } else {
        this.addNotification({
          open: true,
          type: 'error',
          message: 'Transaction Failed'
        });
      }

      return result;
    } catch (error) {
      this.removeNotification(submittedId);

      this.addNotification({
        open: true,
        type: 'error',
        message: `Transaction Failed`
      });
      throw error;
    }
  }
}

export default NotificationStore;