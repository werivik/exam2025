import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import headerLogo from "/media/logo/logo-default.png"

import edge from "/media/images/dark-edge.png";

function Footer() {

  return (
    <footer>
      <img src={edge} className={styles.footerEdgeLeft}></img>
      <div className={styles.footerBorder}>
        <div className={styles.footerTitles}>
          <Link to="/"><h2>Holidaze</h2></Link>
          <p>Elegance meets Comfort</p>
        </div>
        <div className={styles.footerRight}>
          <div className={styles.FooterLinks}>
            <Link to="/venues"><h3>Venues</h3></Link>
            <Link to="/venues"><p>All Venues</p></Link>
            <Link to="/costumer-profile"><p>Booked Venues</p></Link>
          </div>
          <div className={styles.FooterLinks}>
            <Link to="/login-costumer"><h3>Profile</h3></Link>
            <Link  to="/costumer-profile"><p>Costumer</p></Link>
            <Link to="/admin-profile"><p>Manager</p></Link>
          </div>
          <div className={styles.FooterLinks}>
            <Link to="/about"><h3>About Us</h3></Link>
            <Link to="about"><p>About Us</p></Link>
            <Link to="contact"><p>Contact Us</p></Link>
            <Link to="about"><p>Terms of Use</p></Link>
          </div>
        </div>
      </div>
      <img src={edge} className={styles.footerEdgeRight}></img>
    </footer>
  );
}

export default Footer;
