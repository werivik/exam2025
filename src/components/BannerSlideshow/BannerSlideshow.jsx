import { useState, useEffect, useRef } from "react";
import styles from "./BannerSlideshow.module.css";

import backup from "/public/media/slideshow/homeBanner.png";
import img1 from "/public/media/slideshow/exotic.mp4";
import img2 from "/public/media/slideshow/spainBanner.png";
import img3 from "/public/media/slideshow/irelandBanner.png";
import img4 from "/public/media/slideshow/parisBanner.jpg";
import img5 from "/public/media/slideshow/japanBanner.png";

/* 
Video by <a href="https://pixabay.com/users/delmagrom_photography-32857503/?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=146632">Jor Delmagro</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=146632">Pixabay</a> 
// */

const slides = [
  {
    img: img1,
    alt: "Video by https://pixabay.com/users/delmagrom_photography-32857503/?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=146632 Jor Delmagro from https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=146632 Pixabay",
    isVideo: true,
    h1: "Holidaze",
    span: "Elegance meets Comfort"
  },
  {
    img: img4,
    isVideo: false,
    h2: "Paris",
    h3: "Travel to",
    p: "...with Holidaze"
  },
  {
    img: img2,
    isVideo: false,
    h2: "Spain",
    h3: "Travel to",
    p: "...with Holidaze"
  },
  {
    img: img3,
    isVideo: false,
    h2: "Ireland",
    h3: "Travel to",
    p: "...with Holidaze"
  },
  {
    img: img5,
    isVideo: false,
    h2: "Japan",
    h3: "Travel to",
    p: "...with Holidaze"
  }
];

export default function BannerSlideshow() {
  const [index, setIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isDotClicked, setIsDotClicked] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    slides.forEach((slide) => {
      if (!slide.isVideo) {
        const img = new Image();
        img.src = slide.img;
      }
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
    resetTimer();
    setIsDotClicked(true);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    startTimer();
  };

  useEffect(() => {
    setShowContent(false);
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (isDotClicked) {
      setTimeout(() => {
        setIsDotClicked(false);
      }, 1000);
    }
  }, [isDotClicked]);

  const handleVideoError = () => {
    setVideoLoadError(true);
  };

  const renderMedia = (slide, slideIndex, side) => {
    if (slide.isVideo && !videoLoadError) {
      return (
        <video
          src={slide.img}
          className={styles.fullImage}
          autoPlay
          muted
          loop
          playsInline
          onError={handleVideoError}
          onLoadStart={() => setVideoLoadError(false)}
          key={`video-${side}-${slideIndex}`}
        />
      );
    } 
    else if (slide.isVideo && videoLoadError) {
      return (
        <img
          src={backup}
          alt={`Slide ${slideIndex} (backup)`}
          className={styles.fullImage}
        />
      );
    } 
    else {
      return (
        <img
          src={slide.img}
          alt={`Slide ${slideIndex}`}
          className={styles.fullImage}
        />
      );
    }
  };

  return (
    <section className={styles.slideshowWrapper}>
      <div className={styles.splitSlideshow}>
        <div className={styles.lane}>
          <div
            className={styles.stack}
            style={{ transform: `translateY(-${index * 100}vh)` }}
          >
            {slides.map((slide, i) => (
              <div className={styles.slice} key={`left-${i}`}>
                <div className={styles.leftWrapper}>
                  {renderMedia(slide, i, 'left')}
                </div>
              </div>
            ))}
          </div>
        </div>
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
                    {renderMedia(slide, i, 'right')}
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

            {index === 4 && (
              <>
                <h3>{slides[4].h3}</h3>
                <h2>{slides[4].h2}</h2>
                <p>{slides[4].p}</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}