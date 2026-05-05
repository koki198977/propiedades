import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, UseGuards, Request } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Deshabilitado para fix en Vercel
import { RegisterUseCase } from '../application/register.use-case';
import { LoginUseCase } from '../application/login.use-case';
import { GetProfileUseCase } from '../application/get-profile.use-case';
import { UpdateProfileUseCase } from '../application/update-profile.use-case';
import { RegisterDto, LoginDto, UpdateProfileDto } from '@propiedades/types';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';

// @ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Post('register')
  // @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  // @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Iniciar sesión' })
  // @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente' })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.getProfileUseCase.execute(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.updateProfileUseCase.execute(req.user.id, dto);
  }
}
