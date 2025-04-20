import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import styles from "./Header.module.css";
import headerLogo from "/media/logo/logo-default.png";
import headerLogoHover from "/media/logo/logo-hover.png";
import { VENUES } from "../../constants";
import { headers } from "../../headers";
import { isLoggedIn, logout } from "../../auth/auth";

function Header() {
  const [isHovered, setIsHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [venues, setVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());
  
  useEffect(() => {
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
  }, [location.pathname]);

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
        navigate(`/hotel-details/${selectedVenue.id}`);
      }
    } 
    
    else {
      navigate("/hotels");
    }
  
    setSearchTerm("");
    setSuggestions([]);
  };
  
  const toggleSearchBar = () => {
    setIsSearchOpen((prevState) => !prevState);
  };

  const loginOrRegisterRoutes = [
    "/login-admin",
    "/login-costumer",
    "/register-admin",
    "/register-costumer",
  ];
  
  const isSimpleHeader = loginOrRegisterRoutes.includes(location.pathname); 

  const handleLogout = () => {
    logout();
    setIsUserLoggedIn(false);
    navigate("/");
  };
  
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
  
  return (
    <div ref={sidebarRef}>
      <header
        className={`${scrolled && !isSimpleHeader ? styles.scrolled : ""} ${
          isSimpleHeader ? styles.simpleHeader : ""
        }`}
      >
        <nav className={styles.nav}>
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
              <li className={styles.menuLinks}>
                <Link to="/">Home</Link>
                <Link to="/hotels">Venues</Link>
                {isUserLoggedIn && (
  <Link to="/costumer-profile">My Bookings</Link>
)}
              </li>
              <li className={styles.menuLinks}>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li className={styles.menuLinks}>
                {isUserLoggedIn ? (
                  <>
                    <Link to="/profile-costumer">My Profile</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login-costumer">Login</Link>
                    <Link to="/register-costumer">Register</Link>
                  </>
                )}
              </li>
            </div>
          )}

          <div
            className={`${styles.headerContent} ${
              isSidebarOpen ? styles.blurred : ""
            }`}
          >
            <Link to="/">
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
              <li>
                <Link to="/hotels">Venues</Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </div>
  );  
}

export default Header;
