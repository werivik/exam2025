import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './CostumCalender.module.css';

const getMonthName = (month, year) => {
  return new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
};

const generateCalendar = (month, year) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const days = [];
  const offset = (firstDay + 6) % 7;

  for (let i = offset; i > 0; i--) {
    days.push({ date: prevMonthDays - i + 1, faded: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, faded: false });
  }
  while (days.length % 7 !== 0) {
    days.push({ date: days.length - daysInMonth - offset + 1, faded: true });
  }

  return days;
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const CostumCalender = ({ onDateChange }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [days, setDays] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const calendarRef = useRef(null);

  useEffect(() => {
    setDays(generateCalendar(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateClick = (day) => {
    if (day.faded) return;
    const selected = new Date(currentYear, currentMonth, day.date);
    setSelectedDate(selected);
    if (onDateChange) onDateChange(formatDate(selected));
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const quickSelect = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
    setSelectedDate(d);
    if (onDateChange) onDateChange(formatDate(d));
  };

  const isToday = (day) => {
    const d = new Date();
    return !day.faded && d.getDate() === day.date && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const isSelected = (day) =>
    selectedDate &&
    !day.faded &&
    selectedDate.getDate() === day.date &&
    selectedDate.getMonth() === currentMonth &&
    selectedDate.getFullYear() === currentYear;

  return isVisible ? (
    <div ref={calendarRef} className={styles.calendarContainer}>
      <div className={styles.datePicker}>
        <div className={styles.datePickerTop}>
          <button className={styles.arrow} onClick={() => changeMonth(-1)}>
          <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span className={styles.monthName}>{getMonthName(currentMonth, currentYear)}</span>
          <button className={styles.arrow} onClick={() => changeMonth(1)}>
          <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        <div className={styles.datePickerCalender}>
          <div className={styles.daysOfWeek}>
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <span key={day} className={styles.dayOfMonth}>{day}</span>
            ))}
          </div>
          <div className={styles.days}>
            {days.map((day, idx) => (
              <button
                key={idx}
                className={`
                  ${styles.date}
                  ${day.faded ? styles.faded : ''}
                  ${isToday(day) ? styles['current-day'] : ''}
                  ${isSelected(day) ? styles.selected : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                {day.date}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

CostumCalender.propTypes = {
  onDateChange: PropTypes.func,
};

export default CostumCalender;