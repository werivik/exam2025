    export function isLoggedIn() {
    return Boolean(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
  }

  export function login({ accessToken, remember }) {
    (remember ? localStorage : sessionStorage).setItem("accessToken", accessToken);
    window.dispatchEvent(new Event("authchange"));
  }
  
  export function logout() {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    window.dispatchEvent(new Event("authchange"));
  }

    
  export function getToken() {
    return localStorage.getItem('userToken');
  }