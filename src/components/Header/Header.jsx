import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import styles from "./Header.module.css";
import headerLogo from "/media/logo/logo-default.png";
import headerLogoHover from "/media/logo/logo-hover.png";
import { VENUES, PROFILES_SINGLE, PROFILES_SEARCH, VENUES_SEARCH } from "../../constants";
import { headers } from "../../headers";
import { isLoggedIn, getUserRole } from "../../auth/auth";

const Logo = memo(({ isHovered, setIsHovered }) => (
  <Link to="/" className={styles.headerLogoContent}>
    <img
      src={isHovered ? headerLogoHover : headerLogo}
      alt="Logo"
      className={isHovered ? styles.headerLogoHover : styles.headerLogo}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  </Link>
));

const SearchBar = memo(({ 
  isSearchOpen, 
  filters, 
  setFilters, 
  suggestions, 
  handleSearch, 
  handleSelect 
}) => (
  <div
    className={styles.searchbarContent}
    style={{ display: isSearchOpen ? "block" : "none" }}
  >
    <input
      type="text"
      className={styles.searchInput}
      placeholder="Search venues, profiles, or locations..."
      value={filters.destination}
      onChange={(e) => {
        const value = e.target.value;
        setFilters({ destination: value });
        handleSearch(value);
      }}
    />
    {filters.destination && suggestions.length > 0 && (
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
));

const MenuLinks = memo(({ isUserLoggedIn, userData }) => (
  <ul className={styles.menuLeftLinks}>
    {isUserLoggedIn ? (
      <>
        {userData?.venueManager ? (
          <>
            <Link to="/admin-profile">Profile</Link>
            <div className={styles.divideLine}></div>
            <Link to="/admin-profile">My Venues</Link>
          </>
        ) : (
          <>
            <Link to="/costumer-profile">Profile</Link>
            <div className={styles.divideLine}></div>
            <Link to="/costumer-profile">Bookings</Link>
          </>
        )}
      </>
    ) : (
      <>
        <Link to="/login-costumer">Login</Link>
        <div className={styles.divideLine}></div>
        <Link to="/register-costumer">Register</Link>
      </>
    )}
  </ul>
));

const SidebarMenu = memo(({ 
  isOpen, 
  onClose, 
  isUserLoggedIn, 
  userData 
}) => (
  isOpen && (
    <div className={styles.sidebarHeader}>
      <button
        className={styles.sidebarClose}
        onClick={onClose}
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
  )
));

function Header() {
  const loginOrRegisterRoutes = ['/login-costumer', '/register-costumer', '/login-admin', '/register-admin'];
  const specialRoutes = ['/']; // Add more special routes here as needed
  const [isHovered, setIsHovered] = useState(false);
  const [isSpecialPage, setIsSpecialPage] = useState(false);
  const [venues, setVenues] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ destination: "" });
  const [userData, setUserData] = useState(null);

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

    const isLoginOrRegister = loginOrRegisterRoutes.includes(location.pathname);
    const isHome = location.pathname === "/";
    const isSpecial = specialRoutes.includes(location.pathname);

    const handleScroll = () => {
      if (isSpecial || isLoginOrRegister) {
        const scrollThreshold = window.innerHeight * 0.025;
        setIsSpecialPage(window.scrollY <= scrollThreshold);
      } 
      else {
        setIsSpecialPage(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Set initial state
    setIsSpecialPage(isSpecial || isLoginOrRegister);

    return () => window.removeEventListener("scroll", handleScroll);
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
    debounce(async (input) => {
      if (!input) {
        setSuggestions([]);
        return;
      }

      try {
        const venuesRes = await fetch(`${VENUES_SEARCH}`, {
          headers: headers()
        });
        const venuesData = await venuesRes.json();

        const locationMatches = (venuesData.data || []).flatMap((v) => {
          const locs = [];
          if (v.location?.city) locs.push({ type: "City", value: v.location.city });
          if (v.location?.country) locs.push({ type: "Country", value: v.location.country });
          if (v.location?.continent) locs.push({ type: "Region", value: v.location.continent });
          return locs;
        });

        const venueMatches = (venuesData.data || []).map((v) => ({
          type: "Venue",
          value: v.name,
          id: v.id,
        }));

        const profilesRes = await fetch(`${PROFILES_SEARCH}`, {
          headers: headers()
        });
        const profilesData = await profilesRes.json();

        const profileMatches = (profilesData.data || []).map((p) => ({
          type: "Profile",
          value: p.name,
        }));

        const combined = [...venueMatches, ...locationMatches, ...profileMatches];
        const unique = Array.from(
          new Map(combined.map((item) => [`${item.type}:${item.value}`, item])).values()
        ).slice(0, 10);

        setSuggestions(unique.length ? unique : [{ type: "None", value: "No matching results..." }]);
      } 
      catch (err) {
        console.error("Search error:", err);
        setSuggestions([{ type: "None", value: "Error searching..." }]);
      }
    }, 300),
    []
  );

  const handleSelect = useCallback((item) => {
    if (item.type === "Venue" && item.id) {
      navigate(`/venue-details/${item.id}`);
    } 
    else if (item.type === "Profile") {
      navigate(`/venue-details/${item.value}`);
    } 
    else if (["City", "Country", "Region"].includes(item.type)) {
      navigate("/venues", {
        state: { filters: { destination: item.value } },
      });
    }
    setFilters({ destination: "" });
    setSuggestions([]);
    setIsSearchOpen(false);
  }, [navigate]);

  const toggleSearchBar = useCallback(() => {
    setIsSearchOpen(prev => !prev);
  }, []);

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

  const headerClassName = `${isSpecialPage ? styles.special : styles.default}`;

  return (
    <div ref={sidebarRef}>
      <header className={headerClassName}>
        <nav className={styles.nav}>
          <MenuLinks isUserLoggedIn={isUserLoggedIn} userData={userData} />

          {!isSidebarOpen && (
            <button
              className={styles.menuOpen}
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fa-solid fa-ellipsis-vertical"></i> Menu
            </button>
          )}          
          <SidebarMenu 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            isUserLoggedIn={isUserLoggedIn}
            userData={userData}
          />
          <div className={`${styles.headerContent} ${isSidebarOpen ? styles.blurred : ""}`}>
            <Logo isHovered={isHovered} setIsHovered={setIsHovered} />
            <ul className={styles.headerRightLinks}>
              <li className={`${styles.searchContainer} ${isSearchOpen ? styles.searchOpen : ""}`}>
                <SearchBar 
                  isSearchOpen={isSearchOpen}
                  filters={filters}
                  setFilters={setFilters}
                  suggestions={suggestions}
                  handleSearch={handleSearch}
                  handleSelect={handleSelect}
                />
                <i
                  className={`fa-solid fa-magnifying-glass ${
                    isSearchOpen ? styles.searchActive : styles.searchInactive
                  }`}
                  onClick={toggleSearchBar}
                />
              </li>
              <div className={`${styles.divideLine} ${isSearchOpen ? styles.divideLineActive : ""}`}>
              </div>
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

export default memo(Header);