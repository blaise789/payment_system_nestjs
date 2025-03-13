import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
// import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  // app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(bodyParser.raw({ type: 'application/json' }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: configService.get<string>('NATS_URL') || 'nats://localhost:4222',
    },
  });
  const port = configService.get<number>('PAYMENT_SERVICE_PORT') || 3002;

  console.log(`Payment microservice running on port ${port}`);
  await app.listen(port);
  app.startAllMicroservices();
}
bootstrap();
