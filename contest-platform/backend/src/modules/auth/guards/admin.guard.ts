import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (user.globalRole !== 'ADMIN' && user.globalRole !== 'SUPER_ADMIN')) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
