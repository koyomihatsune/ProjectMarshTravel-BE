import * as admin from 'firebase-admin';

import * as serviceAccount from '../firebaseServiceAccount.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  // Add any additional configuration options if required
});

export const firebaseAdmin = admin;
