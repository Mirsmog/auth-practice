import { Injectable } from '@nestjs/common';
import { CookieOptions, Response } from 'express';

@Injectable()
export class CookieService {
  private defaultOptions: CookieOptions = {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    domain: 'localhost',
  };

  setCookie(res: Response, name: string, value: string, opts?: CookieOptions) {
    res.cookie(name, value, { ...this.defaultOptions, ...opts });
  }

  clearCookie(res: Response, name: string, opts?: CookieOptions) {
    res.clearCookie(name, { ...this.defaultOptions, ...opts });
  }
}
