import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import headerLogo from "/media/logo/logo-default.png";
import edge from "/media/images/dark-edge.png";
import { isLoggedIn, getUserRole } from "../../auth/auth";

function Footer() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await getUserRole();
        setUserData({ 
          venueManager: role === "admin" || role === "venueManager"
        });
      } 
      catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    if (isUserLoggedIn) {
      fetchUserRole();
    } 
    else {
      setUserData(null);
    }

    const handleAuthChange = () => setIsUserLoggedIn(isLoggedIn());
  
    const handleStorage = (e) => {
      if (e.key === "accessToken") handleAuthChange();
    };
  
    window.addEventListener("authchange", handleAuthChange);
    window.addEventListener("storage", handleStorage);
  
    return () => {
      window.removeEventListener("authchange", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [isUserLoggedIn]);

  const profilePath = isUserLoggedIn 
    ? (userData?.venueManager ? "/admin-profile" : "/costumer-profile") 
    : "/login-costumer";

  return (
    <footer>
      <img src={edge} className={styles.footerEdgeLeft} alt="Footer edge" />
      <div className={styles.footerBorder}>
        <div className={styles.footerTitles}>
          <Link to="/"><h2>Holidaze</h2></Link>
          <p>Elegance meets Comfort</p>
        </div>
        <div className={styles.footerRight}>
          <div className={styles.FooterLinks}>
            <Link to="/venues"><h3>Venues</h3></Link>
            <Link to="/venues"><p>All Venues</p></Link>
            {isUserLoggedIn && !userData?.venueManager && (
              <Link to="/costumer-profile"><p>Booked Venues</p></Link>
            )}
            {isUserLoggedIn && userData?.venueManager && (
              <Link to="/admin-profile"><p>My Venues</p></Link>
            )}
          </div>
          <div className={styles.divideLine}></div>
          <div className={styles.FooterLinks}>
            <h3>Profile</h3>
            {isUserLoggedIn ? (
              <>
                <Link to={profilePath}><p>My Profile</p></Link>
                {userData?.venueManager ? (
                  <Link to="/admin-profile"><p>My Venues</p></Link>
                ) : (
                  <Link to="/costumer-profile"><p>My Bookings</p></Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login-costumer"><p>Login</p></Link>
                <Link to="/register-costumer"><p>Register</p></Link>
              </>
            )}
          </div>
          <div className={styles.divideLine}></div>
          <div className={styles.FooterLinks}>
            <Link to="/about"><h3>About Us</h3></Link>
            <Link to="/about"><p>About Us</p></Link>
            <Link to="/contact"><p>Contact Us</p></Link>
          </div>
        </div>
      </div>
      <img src={edge} className={styles.footerEdgeRight} alt="Footer edge" />
    </footer>
  );
}

export default Footer;