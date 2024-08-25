// authUtils.ts
import { gapi } from 'gapi-script';
import { PublicClientApplication } from "@azure/msal-browser";


//-----------------------------------------------------------

export const handleGoogleLogin = async (
  setIsGoogleSignedIn: (signedIn: boolean) => void,
  loadGoogleEvents: (selectedDay: Date) => void,
  selectedDay: Date
) => {
  const authInstance = gapi.auth2.getAuthInstance();

  if (authInstance.isSignedIn.get()) {
    
    // Sign out if already signed in
    authInstance.signOut().then(() => {
      setIsGoogleSignedIn(false); // Set to false on sign-out
    });
  } else {
    console.log("before signing in")
    // Sign in if not signed in
    authInstance.signIn().then(() => {
      console.log("Hello..u are signed in")
      setIsGoogleSignedIn(true); // Set to true on sign-in
      loadGoogleEvents(selectedDay); // Load Google events
    });
  }
};

//-----------------------------------------------------------------

export const handleOutlookLogin = async (
    pca: PublicClientApplication | null,
    setIsOutlookSignedIn: (signedIn: boolean) => void,
    setAccessToken: (accessToken: string) => void
  ) => {
    if (!pca) {
      console.error('MSAL not initialized');
      return;
    }
  
    const activeAccount = pca.getActiveAccount();
  
    if (activeAccount) {
      // Sign out if already signed in
      await pca.logoutPopup({
        account: activeAccount,
        postLogoutRedirectUri: window.location.origin,
      });
      setIsOutlookSignedIn(false);
    } else {
      // Sign in if not signed in
      try {
        const loginResponse = await pca.loginPopup({
          scopes: ["User.Read", "Calendars.Read", "Calendars.ReadWrite"],
        });
  
        pca.setActiveAccount(loginResponse.account);
        setIsOutlookSignedIn(true);
        setAccessToken(loginResponse.accessToken); // Store the access token
      } catch (error) {
        console.error('Outlook login error:', error);
      }
    }
  };
