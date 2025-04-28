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

  export const updateUserProfile = async (userId, { bio, avatar, banner, venueManager }) => {
    try {
      const response = await fetch(`/holidaze/profiles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          bio,
          avatar: avatar ? { url: avatar.url, alt: avatar.alt } : undefined,
          banner: banner ? { url: banner.url, alt: banner.alt } : undefined,
          venueManager,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
  
      const data = await response.json();
      console.log('Profile updated:', data);
      return data;
    } 
    
    catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };