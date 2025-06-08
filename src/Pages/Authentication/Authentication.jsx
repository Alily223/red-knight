import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const clientId = 'YOUR_GOOGLE_CLIENT_ID';

const Authentication = () => {
  const handleSuccess = (credentialResponse) => {
    localStorage.setItem('googleCredential', JSON.stringify(credentialResponse));
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Authentication;
