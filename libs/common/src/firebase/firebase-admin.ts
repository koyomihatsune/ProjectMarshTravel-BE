import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SA);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  // Add any additional configuration options if required
});

export const firebaseAdmin = admin;
