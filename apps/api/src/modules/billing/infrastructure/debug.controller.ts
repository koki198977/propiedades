import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckExpirationsCron } from '../../notification/application/check-expirations.cron';

@ApiTags('Debug')
@Controller('debug')
export class DebugController {
  constructor(private readonly cronService: CheckExpirationsCron) {}

  @Get('trigger-cron')
  @Post('trigger-cron')
  @ApiOperation({ summary: 'FORZAR ejecución de cron de notificaciones (PÚBLICO PARA PRUEBAS)' })
  async triggerCronManually() {
    await this.cronService.handleCron();
    return { success: true, message: 'Cron job executed manually.' };
  }
}
