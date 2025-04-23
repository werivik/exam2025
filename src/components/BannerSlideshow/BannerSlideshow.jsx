import { useState, useEffect, useRef } from "react";
import styles from "./BannerSlideshow.module.css";

import homeBanner   from "/media/images/banner2.png";
import beachBanner  from "/media/images/beachBanner2.jpg";
import londonBanner from "/media/images/londonBanner2.jpg";
import parisBanner  from "/media/images/parisBanner2.jpg";

const baseSlides = [
  { img: homeBanner,  h1:"Holidaze", h2:null,       span:"Elegance meets Comfort" },
  { img: parisBanner, h1:"Paris",    h2:"Travel to", p:"...with Holidaze" },
  { img: beachBanner, h1:"Spain",    h2:"Travel to", p:"...with Holidaze" },
  { img: londonBanner,h1:"England",  h2:"Travel to", p:"...with Holidaze" }
];

const slides = [...baseSlides, baseSlides[0]];

export default function BannerSlideshow() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef();
  const stackRef = useRef();

  useEffect(() => {
    restartTimer();
    return () => clearInterval(timerRef.current);
  }, [index]);

  function restartTimer() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 15000);
  }

  function nextSlide() {
    setIndex(i => i + 1);
  }

  useEffect(() => {
    if (index === slides.length - 1) {
      const id = setTimeout(() => {
        const stack = stackRef.current;
        stack.style.transition = "none";
        setIndex(0);
        stack.style.transform = "translateY(0)";
        requestAnimationFrame(() => {
          stack.style.transition = "transform 0.55s ease-in-out";
        });
      }, 550);
      return () => clearTimeout(id);
    }
  }, [index]);

  const stackStyle = { transform: `translateY(-${index * 100}vh)` };

  return (
    <div className={styles.carouselViewport}>
      <div
        className={styles.slideStack}
        style={stackStyle}
        ref={stackRef}
      >
        {slides.map((s, i) => (
          <div className={styles.slide} key={i}>
            <img src={s.img} alt={s.h1} />
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
        {baseSlides.map((_, i) => (
          <div
            key={i}
            className={i === (index % baseSlides.length) ? styles.dotActive : styles.dot}
            onClick={() => {
              setIndex(i);
              restartTimer();
            }}
          />
        ))}
      </div>
    </div>
  );
}
