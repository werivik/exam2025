import { useState, useEffect, useRef } from "react";
import styles from "./BannerSlideshow.module.css";
import homeBanner from "/media/images/banner2.png";
import beachBanner from "/media/images/beachBanner2.jpg";
import londonBanner from "/media/images/londonBanner2.jpg";
import parisBanner from "/media/images/parisBanner2.jpg";

const slides = [
  { img: homeBanner, h1: "Holidaze", h2: null, span: "Elegance meets Comfort" },
  { img: parisBanner, h1: "Paris", h2: "Travel to", p: "...with Holidaze" },
  { img: beachBanner, h1: "Spain", h2: "Travel to", p: "...with Holidaze" },
  { img: londonBanner, h1: "England", h2: "Travel to", p: "...with Holidaze" },
];

const stack = [...slides, slides[0]];

export default function BannerSlideshow() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleDotClick = (i) => {
    clearInterval(timerRef.current);
    setIndex(i);
  };

  const activeSlide = slides[index];

  return (
    <div className={styles.carouselViewport}>
      {/* LEFT - scroll up */}
      <div className={styles.lane}>
        <div
          className={styles.stack}
          style={{ transform: `translateY(-${index * 100}vh)` }}
        >
          {stack.map((s, i) => (
            <div className={styles.slice} key={`left-${i}`}>
              <div className={styles.leftWrapper}>
                <img src={s.img} alt={s.h1} className={`${styles.fullImage} ${styles.leftImage}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - scroll down */}
      <div className={`${styles.lane} ${styles.right}`}>
        <div
          className={styles.stack}
          style={{ transform: `translateY(${index * 100}vh)` }}
        >
          {stack.map((s, i) => (
            <div className={styles.slice} key={`right-${i}`}>
              <div className={styles.rightWrapper}>
                <img src={s.img} alt={s.h1} className={`${styles.fullImage} ${styles.rightImage}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text */}
      <div className={styles.bannerText}>
        {activeSlide.h2 && <h2>{activeSlide.h2}</h2>}
        <h1>{activeSlide.h1}</h1>
        {activeSlide.p && <p>{activeSlide.p}</p>}
        {activeSlide.span && <span>{activeSlide.span}</span>}
      </div>

      {/* Dots */}
      <div className={styles.progressDots}>
        {slides.map((_, i) => (
          <div
            key={i}
            className={i === index ? styles.dotActive : styles.dot}
            onClick={() => handleDotClick(i)}
          />
        ))}
      </div>
    </div>
  );
}
