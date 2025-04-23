import { useState, useEffect, useRef } from "react";
import styles from "./BannerSlideshow.module.css";

import homeBanner   from "/media/images/banner2.png";
import beachBanner  from "/media/images/beachBannerWalking.png";
import londonBanner from "/media/images/londonBanner.png";
import parisBanner  from "/media/images/parisBanner.png";

const slides = [
  { img: homeBanner,  h1:"Holidaze", h2:null,       span:"Elegance meets Comfort" },
  { img: parisBanner, h1:"Paris",    h2:"Travel to", p:"...with Holidaze" },
  { img: beachBanner, h1:"Spain",    h2:"Travel to", p:"...with Holidaze" },
  { img: londonBanner,h1:"England",  h2:"Travel to", p:"...with Holidaze" }
];

export default function BannerSlideshow() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [index]);

  function startTimer() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % slides.length);
    }, 15000);
  }

  const stackStyle = {
    transform: `translateY(-${index * 100}vh)`
  };

  return (
    <div className={styles.carouselViewport}>
      <div className={styles.slideStack} style={stackStyle}>
        {slides.map((s, i) => (
          <div className={styles.slide} key={i}>
            <img src={s.img} alt={s.h1}/>
            <div className={styles.bannerText}>
              {s.h2 && <h2>{s.h2}</h2>}
              <h1>{s.h1}</h1>
              {s.p    && <p>{s.p}</p>}
              {s.span && <span>{s.span}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.progressDots}>
        {slides.map((_, i) => (
          <div
            key={i}
            className={i === index ? styles.dotActive : styles.dot}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
