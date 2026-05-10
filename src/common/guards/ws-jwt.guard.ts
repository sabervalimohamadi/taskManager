import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  validateClient(client: Socket): void {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.headers.authorization as string)?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('Missing token');
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
      client.data.email = payload.email;
    } catch (err) {
      this.logger.warn(`WS auth failed: ${(err as Error).message}`);
      throw new WsException('Invalid token');
    }
  }
}
