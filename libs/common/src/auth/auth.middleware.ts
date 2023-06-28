import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '@app/common/firebase/firebase-admin';

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const token = authorizationHeader.split(' ')[1];

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;
      // eslint-disable-next-line no-console
      console.log('UserID extracted from Firebase Token is: ' + userId);

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
}
