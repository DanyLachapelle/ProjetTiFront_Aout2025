import { provideServerRouting } from '@angular/ssr';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRouting(serverRoutes)]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
