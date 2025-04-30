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
        </div>
      </div>
      <img src={edge} className={styles.footerEdgeRight}></img>
    </footer>
  );
}

export default Footer;
