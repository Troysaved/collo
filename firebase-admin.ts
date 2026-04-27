import { getApps, getApp, App, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin/app";

function loadServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON env var is not set. " +
        "Paste the contents of your service account JSON into .env.local " +
        "(local) and the Vercel project settings (deploy).",
    );
  }
  return JSON.parse(raw) as ServiceAccount;
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
