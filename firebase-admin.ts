import { getApps, getApp, App, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin/app';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const serviceKey = require('@/service_key.json') as ServiceAccount;

let app: App;

if (getApps().length === 0) {
    app = initializeApp({
        credential: cert(serviceKey),
    });
} else {
    app = getApp();
}

const adminDb = getFirestore(app);
export { app as adminApp, adminDb };