import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import styles from "./Header.module.css";
import headerLogo from "/media/logo/logo-default.png";
import headerLogoHover from "/media/logo/logo-hover.png";
import { VENUES, PROFILES_SINGLE } from "../../constants";
import { headers } from "../../headers";
import { isLoggedIn, getUserRole } from "../../auth/auth";

function Header() {
  const loginOrRegisterRoutes = ['/login-costumer', '/register-costumer']
  const [isHovered, setIsHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [venues, setVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('accessToken');
      const username = localStorage.getItem('username');
      
      if (!token || !username) return;

      try {
        const response = await fetch(PROFILES_SINGLE.replace('<name>', username), {
          method: 'GET',
          headers: headers(token),
        });
        const data = await response.json();
        if (response.ok) {
          setUserData(data.data);
        }
        
        else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      setUserRole(role);
    };
  
    if (isUserLoggedIn) {
      fetchUserRole();
    } 
    
    else {
      setUserRole(null);
    }
  
    if (location.pathname === "/") {
      const handleScroll = () => {
        const scrollThreshold = window.innerHeight * 0.025;
        setScrolled(window.scrollY > scrollThreshold);
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } 
    
    else {
      setScrolled(true);
    }
  }, [location.pathname, isUserLoggedIn]);
  

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(VENUES, {
          method: "GET",
          headers: headers(),
        });
        const data = await res.json();
        setVenues(data.data || []);
      } 
      catch (err) {
        console.error("Error fetching venues:", err);
      }
    };

    fetchVenues();
  }, []);

  const handleSearch = useCallback(
    debounce((input) => {
      const term = input.toLowerCase();
      if (!term) return setSuggestions([]);

      const unique = (arr) =>
        arr.filter((v, i, self) => v && self.indexOf(v) === i);

      const regions = unique(
        venues
          .map((v) => v.location?.continent)
          .filter((val) => val?.toLowerCase().startsWith(term))
      ).map((val) => ({ type: "Region", value: val }));

      const cities = unique(
        venues
          .map((v) => v.location?.city)
          .filter((val) => val?.toLowerCase().startsWith(term))
      ).map((val) => ({ type: "City", value: val }));

      const names = unique(
        venues
          .map((v) => v.name)
          .filter((val) => val?.toLowerCase().startsWith(term))
      ).map((val) => ({ type: "Venue", value: val }));

      const allSuggestions = [...regions, ...cities, ...names].slice(0, 10);

      setSuggestions(
        allSuggestions.length
          ? allSuggestions
          : [{ type: "None", value: "No matching results..." }]
      );
    }, 300),
    [venues]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const handleSelect = (item) => {
    if (item.type === "Venue") {
      const selectedVenue = venues.find(v => v.name === item.value);

      if (selectedVenue?.id) {
        navigate(`/venue-details/${selectedVenue.id}`);
      }
    } 
    else {
      navigate("/venues");
    }
  
    setSearchTerm("");
    setSuggestions([]);
  };

  const toggleSearchBar = () => {
    setIsSearchOpen((prevState) => !prevState);
  };

  const isSimpleHeader = loginOrRegisterRoutes.includes(location.pathname); 

  useEffect(() => {
    setIsUserLoggedIn(isLoggedIn());
  
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
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } 
    else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const pageContents = document.querySelectorAll('.pageContent');
    pageContents.forEach((el) => {
      if (isSidebarOpen) {
        el.classList.add('blurred');
      } 
      else {
        el.classList.remove('blurred');
      }
    });
  }, [isSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div ref={sidebarRef}>
      <header
        className={`${scrolled && !isSimpleHeader ? styles.scrolled : ""} ${
          isSimpleHeader ? styles.simpleHeader : ""
        }`}
      >
        <nav className={styles.nav}>

        <ul className={styles.menuLeftLinks}>
        {isUserLoggedIn ? (
  <>
    {userData?.venueManager ? (
      <>
        <Link to="/admin-profile">Profile</Link>
        <div className={`${styles.divideLine} ${isSearchOpen ? styles.divideLineActive : ""}`}></div>
        <Link to="/admin-profile">My Venues</Link>
      </>
    ) : (
      <>
        <Link to="/costumer-profile">Profile</Link>
        <div className={`${styles.divideLine} ${isSearchOpen ? styles.divideLineActive : ""}`}></div>
        <Link to="/costumer-profile">Bookings</Link>
      </>
    )}
  </>
) : (
    <>
      <Link to="/login-costumer">Login</Link>
      <div className={`${styles.divideLine} ${isSearchOpen ? styles.divideLineActive : ""}`}></div>
      <Link to="/register-costumer">Register</Link>
    </>
  )}
</ul>

          {!isSidebarOpen && (
            <button
              className={styles.menuOpen}
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fa-solid fa-ellipsis-vertical"></i> Menu
            </button>
          )}
  
  {isSidebarOpen && (
  <div className={styles.sidebarHeader}>
    <button
      className={styles.sidebarClose}
      onClick={() => setIsSidebarOpen(false)}
    >
      <i className="fa-solid fa-angles-left"></i> Hide Menu
    </button>

    <ul className={styles.menuLinks}>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/venues">Venues</Link></li>
    </ul>

    <div className={styles.divideLineLaying}></div>

    {isUserLoggedIn && (
      <ul className={styles.menuLinks}>
        {userData?.venueManager ? (
          <>
            <li><Link to="/admin-profile">My Venues</Link></li>
            <li><Link to="/admin-profile">My Profile</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/costumer-profile">My Bookings</Link></li>
            <li><Link to="/costumer-profile">My Profile</Link></li>
          </>
        )}
      </ul>
    )}

    <ul className={styles.menuLinks}>
      <li><Link to="/about">About Us</Link></li>
      <li><Link to="/contact">Contact Us</Link></li>
    </ul>

    <div className={styles.divideLineLaying}></div>

    {!isUserLoggedIn && (
      <ul className={styles.menuLinks}>
        <li><Link to="/login-costumer">Login</Link></li>
        <li><Link to="/register-costumer">Register</Link></li>
      </ul>
    )}
  </div>
)}
          <div
            className={`${styles.headerContent} ${
              isSidebarOpen ? styles.blurred : ""
            }`}
          >
            <Link to="/" className={styles.headerLogoContent}>
              <img
                src={isHovered ? headerLogoHover : headerLogo}
                alt="Logo"
                className={
                  isHovered ? styles.headerLogoHover : styles.headerLogo
                }
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              />
            </Link>
            <ul className={styles.headerRightLinks}>
              <li
                className={`${styles.searchContainer} ${
                  isSearchOpen ? styles.searchOpen : ""
                }`}
              >
                <div
                  className={styles.searchbarContent}
                  style={{ display: isSearchOpen ? "block" : "none" }}
                >
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search venues, cities, or countries..."
                    value={searchTerm}
                    onChange={handleInputChange}
                  />
                  {searchTerm && suggestions.length > 0 && (
                    <ul className={styles.suggestionsList}>
                      {suggestions.map((item, index) => (
                        <li
                          key={index}
                          className={styles.suggestionItem}
                          onClick={() => item.type !== "None" && handleSelect(item)}
                        >
                          {item.type !== "None" && (
                            <span className={styles.suggestionLabel}>{item.type}</span>
                          )}
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <i
                  className={`fa-solid fa-magnifying-glass ${
                    isSearchOpen ? styles.searchActive : styles.searchInactive
                  }`}
                  onClick={toggleSearchBar}
                />
              </li>
              <div
                className={`${styles.divideLine} ${
                  isSearchOpen ? styles.divideLineActive : ""
                }`}
              ></div>
              <li>
                <Link to="/venues">Venues</Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </div>
  );  
}

export default Header;
