import { getApps, getApp, App, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin/app";

function loadServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    return JSON.parse(raw) as ServiceAccount;
  }
  // Local fallback: service_key.json sits next to this file (gitignored).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./service_key.json") as ServiceAccount;
}

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(loadServiceAccount()),
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
export { app as adminApp, adminDb };
