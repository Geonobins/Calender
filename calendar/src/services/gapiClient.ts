// gapiClient.ts
import { gapi } from 'gapi-script';

export const initializeGapi = (CLIENT_ID: string, API_KEY: string, DISCOVERY_DOCS: string[], SCOPES: string, onSuccess: () => void) => {
  const start = () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    }).then(() => {
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance.isSignedIn.get()) {
        onSuccess();  // Load events or any other task after successful login
      } else {
        authInstance.signIn().then(onSuccess);
      }
    }).catch((error: any) => {
      console.error("Error initializing gapi:", error);
    });
  };

  gapi.load('client:auth2', start);
};
