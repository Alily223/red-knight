import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';

const clientId = 'YOUR_GOOGLE_CLIENT_ID';

const Authentication = () => {
  const handleSuccess = (credentialResponse) => {
    const data = jwtDecode(credentialResponse.credential);
    const { sub: id, name, email, picture } = data;
    const info = { id, name, email, picture };
    localStorage.setItem('googleCredential', JSON.stringify(info));
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    }).catch(() => {});
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
