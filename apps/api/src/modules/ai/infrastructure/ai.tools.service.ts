import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { GetPropertiesUseCase } from '../../property/application/get-properties.use-case';
import { GetDashboardMetricsUseCase } from '../../report/application/get-dashboard-metrics.use-case';
import { CreatePaymentUseCase } from '../../payment/application/create-payment.use-case';
import { PaymentMethod, UtilityType } from '@propiedades/types';

@Injectable()
export class AiToolsService {
  constructor(
    private readonly getPropertiesUseCase: GetPropertiesUseCase,
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
    private readonly createPaymentUseCase: CreatePaymentUseCase,
  ) {}

  getTools(userId: string, organizationId: string) {
    return [
      new DynamicStructuredTool({
        name: 'consultar_propiedades',
        description: 'Obtiene el listado de todas las propiedades de la organización con sus detalles.',
        schema: z.object({}),
        func: async () => {
          const props = await this.getPropertiesUseCase.execute(organizationId);
          return JSON.stringify(props);
        },
      }),

      new DynamicStructuredTool({
        name: 'consultar_estado_financiero',
        description: 'Obtiene métricas clave como ingresos mensuales, tasa de ocupación e historial financiero de la organización.',
        schema: z.object({}),
        func: async () => {
          const metrics = await this.getDashboardMetricsUseCase.execute(organizationId);
          return JSON.stringify(metrics);
        },
      }),

      new DynamicStructuredTool({
        name: 'registrar_pago_arriendo',
        description: 'Registra un nuevo pago de arriendo para un arrendatario específico.',
        schema: z.object({
          propertyTenantId: z.string().describe('ID de la ocupación/relación propiedad-arrendatario'),
          amount: z.number().describe('Monto pagado'),
          paymentMethod: z.nativeEnum(PaymentMethod).describe('Método de pago (TRANSFER, CASH, etc.)'),
          paymentDate: z.string().describe('Fecha del pago en formato YYYY-MM-DD'),
          notes: z.string().optional().describe('Notas adicionales sobre el pago'),
        }),
        func: async (input) => {
          try {
            const payment = await this.createPaymentUseCase.execute(userId, organizationId, input as any);
            return `Pago registrado exitosamente. ID: ${payment.id}`;
          } catch (e) {
            return `Error al registrar el pago: ${e.message}`;
          }
        },
      }),
    ];
  }
}
