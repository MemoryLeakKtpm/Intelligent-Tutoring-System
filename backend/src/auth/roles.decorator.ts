import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/user.entity';

// Used by RolesGuard (roles.guard.ts) to identify which roles are required for a given route.
export const ROLES_KEY = 'roles';

/**
 * Custom decorator for access control by role.
 * @example
 * // Apply to a method to allow only instructors
 * @Roles(UserRole.INSTRUCTOR)
 * @Get('/')
 * findAll() { ... }
 *
 * @example
 * // Apply to a class to allow multiple roles for all its methods
 * @Roles(UserRole.INSTRUCTOR, UserRole.STUDENT)
 * @Controller('content')
 * export class ContentController { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
