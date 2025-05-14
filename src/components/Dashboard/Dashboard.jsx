import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import Buttons from '../Buttons/Buttons';

const Dashboard = ({
  showDashboard,
  toggleDashboard,
}) => {

  return (
    <>
      {showDashboard && <div className={styles.backdrop} onClick={toggleDashboard}></div>}
      <div className={`${styles.filterSidebar} ${showDashboard ? styles.showDashboard : ''}`}>
        <div className={styles.filterSidebarContent}>
          <Buttons size='closeButton'
          onClick={toggleDashboard}
          >
          &times;
          </Buttons>

          <h2>Dashboard</h2>

          <div className={styles.dashboardLink}>
            <h3>Venues</h3>
            <button>My Venues</button>
            <button>Create Venue</button>
            <button>Edit Venue</button>
          </div>

          <div className={styles.divideLine}></div>

          <div className={styles.dashboardLink}>
            <h3>Profile</h3>
            <button>View Profile</button>
            <button>Edit Profile</button>
          </div>

          <div className={styles.divideLine}></div>

          <div className={styles.dashboardLink}>
            <button>Sign out</button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
