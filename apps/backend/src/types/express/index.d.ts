// src/types/express/index.d.ts

import { UserPayload } from '../user'; // تأكد من مسار UserPayload الصحيح

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}