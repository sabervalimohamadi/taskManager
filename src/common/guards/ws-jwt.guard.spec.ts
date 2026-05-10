import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { WsJwtGuard } from './ws-jwt.guard';

function makeSocket(token?: string, authHeader?: string) {
  return {
    handshake: {
      auth: token ? { token } : {},
      headers: authHeader ? { authorization: authHeader } : {},
    },
    data: {} as Record<string, unknown>,
  } as any;
}

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  const mockJwt = { verify: jest.fn() };
  const mockConfig = { get: jest.fn().mockReturnValue('test-secret') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsJwtGuard,
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    guard = module.get(WsJwtGuard);
    jest.clearAllMocks();
  });

  it('throws WsException when no token is provided at all', () => {
    expect(() => guard.validateClient(makeSocket())).toThrow(WsException);
  });

  it('throws WsException when JWT verification fails', () => {
    mockJwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });
    expect(() => guard.validateClient(makeSocket('bad-token'))).toThrow(WsException);
  });

  it('sets client.data.userId from a valid handshake.auth token', () => {
    mockJwt.verify.mockReturnValue({ sub: 'user-123', email: 'a@test.com' });
    const client = makeSocket('valid-token');
    guard.validateClient(client);
    expect(client.data.userId).toBe('user-123');
    expect(client.data.email).toBe('a@test.com');
  });

  it('accepts a valid token from the Authorization header', () => {
    mockJwt.verify.mockReturnValue({ sub: 'user-456', email: 'b@test.com' });
    const client = makeSocket(undefined, 'Bearer header-token');
    guard.validateClient(client);
    expect(client.data.userId).toBe('user-456');
  });

  it('prefers handshake.auth.token over Authorization header', () => {
    mockJwt.verify.mockReturnValue({ sub: 'auth-user', email: 'c@test.com' });
    const client = makeSocket('auth-token', 'Bearer header-token');
    guard.validateClient(client);
    expect(mockJwt.verify).toHaveBeenCalledWith('auth-token', expect.anything());
  });
});
