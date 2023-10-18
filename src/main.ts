import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: ['debug','error','log','warn']
  });

  //Cors enable acess to the api from every place.
  //to be expecific place origin: www.example.com 
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
    transform: true,
    //white liste is to be able to recive more data them it is used without trow an error
    whitelist: true,
    forbidNonWhitelisted: false
  })
  );

app.setGlobalPrefix('api')

  await app.listen(3000);
}
bootstrap();
