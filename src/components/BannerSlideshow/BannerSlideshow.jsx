import { useState, useEffect, useRef } from "react";
import styles from "./bannerSlideshow.module.css";

import img1 from "/media/images/homeBanner.png";
import img2 from "/media/images/spainBanner.png";
import img3 from "/media/images/irelandBanner2.png";
import img4 from "/media/images/parisBanner.jpg";

const slides = [
  {
    img: img1,
    h1: "Holidaze",
    span: "Elegance meets Comfort"
  },
  {
    img: img4,
    h2: "Paris",
    h3: "Travel to",
    p: "...with Holidaze"
  },
  {
    img: img2,
    h2: "Spain",
    h3: "Travel to",
    p: "...with Holidaze"
  },
  {
    img: img3,
    h2: "Ireland",
    h3: "Travel to",
    p: "...with Holidaze"
  }
];

export default function BannerSlideshow() {
  const [index, setIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.img;
    });
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
  };

  const handleDotClick = (i) => {
    if (i === index) return;
    setIndex(i);
  };

  useEffect(() => {
    setShowContent(false);
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <section className={styles.slideshowWrapper}>
      <div className={styles.splitSlideshow}>
        {/* Left Lane */}
        <div className={styles.lane}>
          <div
            className={styles.stack}
            style={{ transform: `translateY(-${index * 100}vh)` }}
          >
            {slides.map((slide, i) => (
              <div className={styles.slice} key={`left-${i}`}>
                <div className={styles.leftWrapper}>
                  <img src={slide.img} alt={`Slide ${i}`} className={styles.fullImage} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Lane */}
        <div className={`${styles.lane} ${styles.right}`}>
          <div
            className={styles.stack}
            style={{ transform: `translateY(-${(slides.length - 1 - index) * 100}vh)` }}
          >
            {slides
              .slice()
              .reverse()
              .map((slide, i) => (
                <div className={styles.slice} key={`right-${i}`}>
                  <div className={styles.rightWrapper}>
                    <img src={slide.img} alt={`Slide ${i}`} className={styles.fullImage} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className={styles.paginationDots}>
  {slides.map((_, i) => (
    <div
      key={`dot-${i}`}
      onClick={() => handleDotClick(i)}
      className={`${styles.slideDot} ${index === i ? styles.active : ""}`}
    />
  ))}
</div>

        {showContent && (
          <div className={styles.bannerText}>
            {index === 0 && (
              <>
                <h1>{slides[0].h1}</h1>
                <span>{slides[0].span}</span>
              </>
            )}

            {index === 1 && (
              <>
                <h3>{slides[1].h3}</h3>
                <h2>{slides[1].h2}</h2>
                <p>{slides[1].p}</p>
              </>
            )}

            {index === 2 && (
              <>
                <h3>{slides[2].h3}</h3>
                <h2>{slides[2].h2}</h2>
                <p>{slides[2].p}</p>
              </>
            )}

            {index === 3 && (
              <>
                <h3>{slides[3].h3}</h3>
                <h2>{slides[3].h2}</h2>
                <p>{slides[3].p}</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}