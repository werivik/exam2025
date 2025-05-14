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

const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const parts = dateString.split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parts[1];
      const year = parseInt(parts[2]);
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthIndex = monthNames.findIndex(m => m === month);
      
      if (monthIndex !== -1) {
        return new Date(year, monthIndex, day);
      }
    }
  } 
  catch (e) {
    console.error("Error parsing date:", e);
  }
  return null;
};

const CustomCalender = ({ value, onDateChange }) => {
  const today = new Date();
  const initialDate = value ? parseDate(value) : null;

  const [currentMonth, setCurrentMonth] = useState(initialDate ? initialDate.getMonth() : today.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate ? initialDate.getFullYear() : today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [days, setDays] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    setDays(generateCalendar(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const parsedDate = parseDate(value);
    if (parsedDate) {
      setSelectedDate(parsedDate);
      setCurrentMonth(parsedDate.getMonth());
      setCurrentYear(parsedDate.getFullYear());
    }
  }, [value]);

  const handleDateClick = (day) => {
    if (day.faded) return;
    const selected = new Date(currentYear, currentMonth, day.date);
    setSelectedDate(selected);
    if (onDateChange) {
      const formattedDate = formatDate(selected);
      onDateChange(formattedDate);
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
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

  return (
    <div ref={calendarRef} className={styles.calendarContainer}>
      <div className={styles.datePicker}>
        <div className={styles.datePickerTop}>
          <button className={styles.arrow} onClick={() => changeMonth(-1)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className={styles.monthName}>{getMonthName(currentMonth, currentYear)}</span>
          <button className={styles.arrow} onClick={() => changeMonth(1)}>
            <i className="fa-solid fa-chevron-right"></i>
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
  );
};

CustomCalender.propTypes = {
  value: PropTypes.string,
  onDateChange: PropTypes.func
};

export default CustomCalender;