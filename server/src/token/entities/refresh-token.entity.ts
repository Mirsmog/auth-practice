export class RefreshToken {
  token: string;
}

export class RefreshTokenPayload {
  sub: string;
  jti: string;
  email: string;
  exp: number;
}
