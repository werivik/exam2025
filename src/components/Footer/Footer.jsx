import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import headerLogo from "/media/logo/logo-default.png"

function Footer() {

  return (
    <footer>
      <div className={styles.footerBorder}>
        <div className={styles.footerTitles}>
          <h2>Restelle</h2>
          <p>Elegance meet Comfort</p>
        </div>
        <div className={styles.footerRight}>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
