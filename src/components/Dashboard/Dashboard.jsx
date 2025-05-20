import styles from './Dashboard.module.css';
import Buttons from '../Buttons/Buttons';

const Dashboard = ({
  showDashboard,
  toggleDashboard,
  userRole,
  onScrollToProfileTop,
  onScrollToProfileEdit,
  onScrollToVenues,
  onSignOut,
}) => {

  return (
    <>
      {showDashboard && <div className={styles.backdrop} onClick={toggleDashboard}></div>}
      <div className={`${styles.filterSidebar} ${showDashboard ? styles.showDashboard : ''}`}>
        <div className={styles.filterSidebarContent}>
          <Buttons size='close'
          onClick={toggleDashboard}
          >
          &times;
          </Buttons>
<h2>Dashboard</h2>
{userRole === 'admin' && (
  <div className={styles.dashboardLink}>
    <h3>Venues</h3>
    <button onClick={onScrollToVenues}>My Venues</button>
    <button onClick={() => { toggleDashboard(); window.location.href = "/create-venue"; }}>Create Venue</button>
    <button onClick={onScrollToVenues}>Edit Venue</button>
  </div>
)}
{userRole === 'customer' && (
  <div className={styles.dashboardLink}>
    <h3>Bookings</h3>
    <button onClick={() => scrollToSection(bookingsRef)}>View My Bookings</button>
    <button onClick={() => scrollToSection(bookingsRef)}>Edit Bookings</button>
  </div>
)}
<div className={styles.divideLine}></div>
<div className={styles.dashboardLink}>
  <h3>Profile</h3>
  <button onClick={onScrollToProfileTop}>View Profile</button>
  <button onClick={onScrollToProfileEdit}>Edit Profile</button>
</div>
<div className={styles.divideLine}></div>
  <Buttons size="medium" version="v2" onClick={onSignOut}>
    Sign Out
  </Buttons>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
