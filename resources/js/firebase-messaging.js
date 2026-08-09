import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission denied.");
            return null;
        }

        const messaging = await getFirebaseMessaging();

        if (!messaging) {
            console.log("Firebase Messaging is not supported.");
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        console.log("FCM Token:", token);

        return token;
    } catch (error) {
        console.error("Error getting token:", error);
        return null;
    }
};

export const listenForMessages = async () => {
    const messaging = await getFirebaseMessaging();

    if (!messaging) return;

    onMessage(messaging, (payload) => {
        console.log("Foreground Message:", payload);

        alert(
            `${payload.notification?.title}\n${payload.notification?.body}`
        );
    });
};
