import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  rfc: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'siaplem_secret_key'),
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      rfc: payload.rfc,
      name: payload.name,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
