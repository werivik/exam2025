export function isLoggedIn() {
    return Boolean(localStorage.getItem('userToken'));
  }
  
  export function login(token) {
    localStorage.setItem('userToken', token);
  }
  
  export function logout() {
    localStorage.removeItem('userToken');
  }
  
  export function getToken() {
    return localStorage.getItem('userToken');
  }
  