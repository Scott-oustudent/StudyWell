// A simple service to handle browser notifications

/**
 * Requests permission from the user to show notifications.
 * @returns {Promise<boolean>} A promise that resolves to true if permission is granted, false otherwise.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

/**
 * Shows a notification to the user.
 * @param {string} title - The title of the notification.
 * @param {NotificationOptions} [options] - Optional settings for the notification (e.g., body text).
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    new Notification(title, options);
};

/**
 * Checks the current notification permission status.
 * @returns {NotificationPermission} The current permission status.
 */
export const getNotificationPermissionStatus = (): NotificationPermission => {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
};
