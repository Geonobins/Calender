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
        // Optional: handle cases where sign-in might be needed but not automatically
        console.log('User is not signed in. Consider prompting the user to sign in.');
      }
    }).catch((error: any) => {
      console.error("Error initializing gapi:", error);
    });
  };

  gapi.load('client:auth2', start);
};
