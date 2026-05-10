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
    const auth = client.handshake.auth as Record<string, unknown>;
    const token =
      (auth['token'] as string | undefined) ||
      client.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('Missing token');
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );
      (client.data as Record<string, unknown>)['userId'] = payload.sub;
      (client.data as Record<string, unknown>)['email'] = payload.email;
    } catch (err) {
      this.logger.warn(`WS auth failed: ${(err as Error).message}`);
      throw new WsException('Invalid token');
    }
  }
}
