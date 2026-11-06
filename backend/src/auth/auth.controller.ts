import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Post('login')
  login(@Body() body: { rfc: string; password: string }) {
    return this.svc.login(body.rfc, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: unknown }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIM')
  @Get('users')
  listUsers() {
    return this.svc.listUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIM')
  @Get('users/search')
  searchUsers(@Query('q') q: string) {
    return this.svc.searchUsers(q ?? '');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIM')
  @Get('roles')
  getRoles() {
    return this.svc.getAllRoles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIM')
  @Post('users/:id/roles')
  assignRole(@Param('id', ParseIntPipe) id: number, @Body() body: { role: string }) {
    return this.svc.assignRole(id, body.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIM')
  @Delete('users/:id/roles/:role')
  removeRole(@Param('id', ParseIntPipe) id: number, @Param('role') role: string) {
    return this.svc.removeRole(id, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIM')
  @Get('permissions')
  getPermissions() {
    return this.svc.getAllPermissions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIM')
  @Post('users/:id/permissions')
  assignPermission(@Param('id', ParseIntPipe) id: number, @Body() body: { permission: string }) {
    return this.svc.assignPermission(id, body.permission);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIM')
  @Delete('users/:id/permissions/:permission')
  removePermission(@Param('id', ParseIntPipe) id: number, @Param('permission') permission: string) {
    return this.svc.removePermission(id, permission);
  }
}
