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
          <h2>Holidaze</h2>
          <p>Elegance meets Comfort</p>
        </div>
        <div className={styles.footerRight}>
          <div className={styles.FooterLinks}>
            <Link><h3>Venues</h3></Link>
            <Link><p>All Venues</p></Link>
            <Link><p>Booked Venues</p></Link>
            <Link><p>Favorite Venues</p></Link>
          </div>
          <div className={styles.FooterLinks}>
            <Link><h3>Profile</h3></Link>
            <Link><p>Costumer</p></Link>
            <Link><p>Manager</p></Link>
          </div>
          <div className={styles.FooterLinks}>
            <Link><h3>About Us</h3></Link>
            <Link><p>About Us</p></Link>
            <Link><p>Contact Us</p></Link>
            <Link><p>Terms of Use</p></Link>
          </div>
        </div>
      </div>
      <img src={edge} className={styles.footerEdgeRight}></img>
    </footer>
  );
}

export default Footer;
