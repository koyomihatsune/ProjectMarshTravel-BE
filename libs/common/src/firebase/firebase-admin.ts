// import * as admin from 'firebase-admin';
import { OAuth2Client } from 'google-auth-library';

// const serviceAccount = JSON.parse(process.env.FIREBASE_SA);

const client = new OAuth2Client();

export const firebaseAdmin = client;
