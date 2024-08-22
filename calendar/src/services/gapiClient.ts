// src/utils/gapiClient.ts

import { gapi } from 'gapi-script';

const initGapiClient = async (apiKey: string, clientId: string, discoveryDocs: string[], scope: string) => {
  return new Promise<void>((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey,
        clientId,
        discoveryDocs,
        scope,
      }).then(() => {
        resolve();
      }).catch((error: any) => {
        reject(error);
      });
    });
  });
};

export default initGapiClient;
