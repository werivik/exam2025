import styles from "./BannerSlideshow.module.css";
import homeBanner from "/media/images/banner2.png";
import beachBanner from "/media/images/beachBanner2.jpg";
import londonBanner from "/media/images/londonBanner2.jpg";
import parisBanner from "/media/images/parisBanner2.jpg";

const slides = [
  { img: homeBanner,  h1:"Holidaze", h2:null,       span:"Elegance meets Comfort" },
  { img: parisBanner, h1:"Paris",    h2:"Travel to", p:"...with Holidaze" },
  { img: beachBanner, h1:"Spain",    h2:"Travel to", p:"...with Holidaze" },
  { img: londonBanner,h1:"England",  h2:"Travel to", p:"...with Holidaze" }
];
const stack = [...slides, slides[0]];

export default function BannerSlideshow(){
  return(
    <div className={styles.carouselViewport}>
      <div className={styles.lane}>
        <div className={styles.stack}>
          {stack.map((s,i)=>(
            <div className={styles.slice} key={i}>
              <img src={s.img} alt={s.title}/>
            <div className={styles.bannerText}>
              {s.h2 && <h2>{s.h2}</h2>}
              <h1>{s.h1}</h1>
              {s.p    && <p>{s.p}</p>}
              {s.span && <span>{s.span}</span>}
            </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`${styles.lane} ${styles.right}`}>
        <div className={styles.stack}>
          {stack.slice().reverse().map((s,i)=>(
            <div className={styles.slice} key={i}>
              <img src={s.img} alt={s.title}/>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.progressDots}>
        {slides.map((_,i)=>(
          <div key={i} className={i===0?styles.dotActive:styles.dot}/>
        ))}
      </div>
    </div>
  );
}






