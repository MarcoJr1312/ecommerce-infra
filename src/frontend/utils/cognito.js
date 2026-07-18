import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
};

let userPool;
try {
  userPool = new CognitoUserPool(poolData);
} catch {
  userPool = null;
}

function getPool() {
  if (!userPool) throw new Error('Cognito not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID.');
  return userPool;
}

export function signUp(name, email, password) {
  return new Promise((resolve, reject) => {
    const pool = getPool();
    const attrs = [
      new CognitoUserAttribute({ Name: 'given_name', Value: name }),
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];
    pool.signUp(email, password, attrs, null, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const pool = getPool();
    const user = new CognitoUser({ Username: email, Pool: pool });
    user.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function resendCode(email) {
  return new Promise((resolve, reject) => {
    const pool = getPool();
    const user = new CognitoUser({ Username: email, Pool: pool });
    user.resendConfirmationCode((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function authenticate(email, password) {
  return new Promise((resolve, reject) => {
    const pool = getPool();
    const user = new CognitoUser({ Username: email, Pool: pool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve({ user, session }),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => reject(new Error('Password reset required')),
    });
  });
}

export function getUserAttributes(user) {
  return new Promise((resolve, reject) => {
    user.getUserAttributes((err, attrs) => {
      if (err) reject(err);
      else {
        const map = {};
        for (const a of attrs) map[a.Name] = a.Value;
        resolve(map);
      }
    });
  });
}

export function getSession(user) {
  return new Promise((resolve, reject) => {
    user.getSession((err, session) => {
      if (err) reject(err);
      else resolve(session);
    });
  });
}

export function signOut(user) {
  user.signOut();
}

export function getCachedUser() {
  try {
    const cached = getPool().getCurrentUser();
    return cached || null;
  } catch {
    return null;
  }
}
