/*
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
      <div className={styles.lane}>
        <div
          className={styles.stack}
          style={{ transform: `translateY(-${index * 100}vh)` }}
        >
{stack.map((s, i) => (
  <div className={styles.slice} key={`left-${i}`}>
    <div className={styles.leftWrapper}>
      <img src={s.img} alt={s.h1} className={styles.fullImage} />
    </div>
  </div>
))}
        </div>
      </div>
      <div className={`${styles.lane} ${styles.right}`}>
        <div
          className={`${styles.stack}`}
          style={{ transform: `translateY(${index * 100}vh)` }}
        >
{stack.map((s, i) => (
  <div className={styles.slice} key={`right-${i}`}>
    <div className={styles.rightWrapper}>
      <img src={s.img} alt={s.h1} className={styles.fullImage} />
    </div>
  </div>
))}
        </div>
      </div>
      <div className={styles.bannerText}>
        {activeSlide.h2 && <h2>{activeSlide.h2}</h2>}
        <h1>{activeSlide.h1}</h1>
        {activeSlide.p && <p>{activeSlide.p}</p>}
        {activeSlide.span && <span>{activeSlide.span}</span>}
      </div>
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
*/

import { useState, useEffect } from "react";
import styles from "./bannerSlideshow.module.css";

import img1 from "/media/images/banner2.png";
import img2 from "/media/images/beachBanner2.jpg";
import img3 from "/media/images/londonBanner2.jpg";
import img4 from "/media/images/parisBanner2.jpg";

const slides = [
  {
    img: img1,
    h1: "Holidaze",
    span: "Elegance meets Comfort"
  },
  {
    img: img2,
    h2: "Spain",
    h3: "Travel to",
    p: "...with Holidaze"
  },
  {
    img: img3,
    h2: "England",
    h3: "Travel to",
    p: "...with Holidaze"
  },
  {
    img: img4,
    h2: "Paris",
    h3: "Travel to",
    p: "...with Holidaze"
  }
];

export default function BannerSlideshow() {
  const [index, setIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.img;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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