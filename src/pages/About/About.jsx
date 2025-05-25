import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './About.module.css';
import { motion } from 'framer-motion';
import Buttons from "../../components/Buttons/Buttons";

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Chief Executive Officer",
    image: "../../../public/media/staff/female1.jpg",
    bio: "Sarah founded Holidaze in 2018 with a vision to connect travelers with unique accommodations around the world."
  },
  {
    name: "Marcus Chen",
    role: "Head of Operations",
    image: "../../../public/media/staff/male1.jpg",
    bio: "With 15 years in hospitality, Marcus ensures every Holidaze experience meets our high standards."
  },
  {
    name: "Elena Rodriguez",
    role: "Customer Experience Director",
    image: "../../../public/media/staff/female2.jpg",
    bio: "Elena leads our support team with her signature blend of efficiency and warmth."
  },
  {
    name: "Thomas Nielsen",
    role: "Head of Technology",
    image: "../../../public/media/staff/male2.jpg",
    bio: "Thomas oversees our digital platform, making sure your booking experience is seamless."
  }
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <motion.div
      className={styles.aboutContent}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className={styles.aboutStyle}>
        <div className={styles.heroSection}>
          <div className={styles.heroOverlay}>
            <h1>About Holidaze</h1>
            <p>Creating memorable stays since 2018</p>
          </div>
        </div>

        <div className={styles.aboutContainer}>
          <section className={styles.missionSection}>
            <div className={styles.sectionContent}>
              <h2>Our Mission</h2>
              <div className={styles.dividerLine}></div>
              <p>
                At Holidaze, we believe that where you stay is more than just accommodation—it's part of your journey.
                Our mission is to connect travelers with unique and authentic places to stay, creating memorable experiences
                that go beyond the ordinary hotel stay.
              </p>
              <p>
                Whether you're looking for a cozy cabin in the mountains, a stylish apartment in the heart of the city,
                or a beachfront villa for your family vacation, Holidaze is your gateway to exceptional stays worldwide.
              </p>
            </div>
            <div className={styles.imageContainer}>
              <img src="/media/staff/staffGoal.jpg" alt="Holidaze experience" className={styles.aboutImage} />
            </div>
          </section>

          <div className={styles.dividerLine}></div>

          <section className={styles.valuesSection}>
            <h2>Our Values</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <i className="fa-solid fa-handshake"></i>
                </div>
                <h3>Trust</h3>
                <p>We build relationships based on transparency and reliability, ensuring both hosts and guests feel secure.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <i className="fa-solid fa-globe"></i>
                </div>
                <h3>Diversity</h3>
                <p>We celebrate unique properties and experiences that reflect local cultures and environments.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <i className="fa-solid fa-leaf"></i>
                </div>
                <h3>Sustainability</h3>
                <p>We promote responsible travel practices and eco-friendly accommodations.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <i className="fa-solid fa-star"></i>
                </div>
                <h3>Excellence</h3>
                <p>We strive for exceptional quality in every aspect of our service and platform.</p>
              </div>
            </div>
          </section>

          <div className={styles.dividerLine}></div>

          <section className={styles.storySection}>
            <div className={styles.imageContainer}>
              <img src="/media/staff/staffGroup.jpg" alt="Holidaze journey" className={styles.aboutImage} />
            </div>
            <div className={styles.sectionContent}>
              <h2>Our Story</h2>
              <div className={styles.dividerLine}></div>
              <p>
                Holidaze began in 2018 when our founder Sarah Johnson noticed a gap in the market
                for a platform that truly understood what makes a stay special. With a background in both
                hospitality and technology, Sarah assembled a team of passionate professionals who shared her vision.
              </p>
              <p>
                What started as a small collection of handpicked properties in Norway has grown into
                a global platform connecting travelers with thousands of unique accommodations. Despite our growth,
                we've maintained our commitment to quality and personal touch that makes Holidaze different.
              </p>
            </div>
          </section>

          <div className={styles.dividerLine}></div>

          <section className={styles.teamSection}>
            <h2>Meet Our Team</h2>
            <p className={styles.teamIntro}>
              The passionate individuals behind Holidaze are committed to making your travel experience extraordinary.
            </p>
            <div className={styles.teamGrid}>
              {teamMembers.map((member, index) => (
                <div key={index} className={styles.teamCard}>
                  <img src={member.image} alt={member.name} className={styles.teamMemberImage} />
                  <h3>{member.name}</h3>
                  <p className={styles.teamMemberRole}>{member.role}</p>
                  <p className={styles.teamMemberBio}>{member.bio}</p>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.dividerLine}></div>

          <section className={styles.joinUsSection}>
            <div className={styles.joinUsContent}>
              <h2>Start Your Holidaze Journey</h2>
              <p>
                Whether you're looking for the perfect place to stay or interested in listing your property,
                Holidaze offers a platform where memorable experiences begin.
              </p>
              <div className={styles.joinUsButtons}>
                <Buttons
                size='large'
                version='v1'
                >
                    Browse Venues
                </Buttons>
                <Buttons
                size='large'
                version='v2'
                >
                    Join Holidaze
                </Buttons>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default About;