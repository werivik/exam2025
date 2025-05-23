import React, { useState, useEffect } from 'react';
import styles from './CostumCalender.module.css';

const CustomCalender = ({ 
  value, 
  onDateChange, 
  bookedDates = [], 
  startDate = null, 
  endDate = null,
  isSelectingEnd = false,
  onSelectionComplete = null
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(startDate);
  const [selectedEnd, setSelectedEnd] = useState(endDate);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(!isSelectingEnd);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (startDate) {
      const parsedStart = typeof startDate === 'string' ? new Date(startDate) : startDate;
      if (parsedStart instanceof Date && !isNaN(parsedStart.getTime())) {
        setSelectedStart(parsedStart);
      }
    }
    if (endDate) {
      const parsedEnd = typeof endDate === 'string' ? new Date(endDate) : endDate;
      if (parsedEnd instanceof Date && !isNaN(parsedEnd.getTime())) {
        setSelectedEnd(parsedEnd);
      }
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setIsSelectingStartDate(!isSelectingEnd);
  }, [isSelectingEnd]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return null;
    
    if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
      return null;
    }
    
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return null;
  };

  // Helper function to safely format dates for display
  const formatDateForDisplay = (date) => {
    if (!date) return 'Select date';
    
    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Select date';
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Select date';
    }
    
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isDateBooked = (date) => {
    const dateStr = formatDate(date);
    return bookedDates.some(bookedDate => {
      if (bookedDate.startDate && bookedDate.endDate) {
        const start = new Date(bookedDate.startDate);
        const end = new Date(bookedDate.endDate);
        return date >= start && date <= end;
      }
      return false;
    });
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    
    if (isDateBooked(date)) return true;
    
    if (!isSelectingStartDate && selectedStart && date <= selectedStart) return true;
    
    return false;
  };

  const isDateInRange = (date) => {
    if (!selectedStart || !selectedEnd) return false;
    return date > selectedStart && date < selectedEnd;
  };

  const isDateSelected = (date) => {
    const dateStr = formatDate(date);
    if (!dateStr) return false;
    
    const startStr = selectedStart ? formatDate(selectedStart) : null;
    const endStr = selectedEnd ? formatDate(selectedEnd) : null;
    
    return dateStr === startStr || dateStr === endStr;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    
    const dateStr = formatDate(date);
    if (!dateStr) return;

    if (isSelectingStartDate) {
      setSelectedStart(date);
      onDateChange(dateStr);
      
      if (selectedEnd && date >= selectedEnd) {
        setSelectedEnd(null);
      }
      setIsSelectingStartDate(false);
    } 
    else {
      setSelectedEnd(date);
      onDateChange(dateStr);
      
      if (onSelectionComplete) {
        onSelectionComplete();
      }
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const resetSelection = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
    setIsSelectingStartDate(true);
  };

  const renderSelectionStatus = () => {
    return (
      <div className={styles.selectionStatus}>
      </div>
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isDisabled = isDateDisabled(date);
      const isSelected = isDateSelected(date);
      const inRange = isDateInRange(date);
      const isBooked = isDateBooked(date);

      let dayClasses = [styles.calendarDay];
      
      if (isDisabled) dayClasses.push(styles.disabled);
      if (isSelected) dayClasses.push(styles.selected);
      if (inRange) dayClasses.push(styles.inRange);
      if (isBooked) dayClasses.push(styles.booked);
      if (!isDisabled && !isSelected) dayClasses.push(styles.available);

      days.push(
        <div
          key={day}
          className={dayClasses.join(' ')}
          onClick={() => handleDateClick(date)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.calendarContainer}>
      {renderSelectionStatus()}
      
      <div className={styles.calendarHeader}>
        <button 
          className={styles.navButton}
          onClick={() => navigateMonth(-1)}
          type="button"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        
        <h3 className={styles.monthYear}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button 
          className={styles.navButton}
          onClick={() => navigateMonth(1)}
          type="button"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <div className={styles.weekdaysHeader}>
        {weekdays.map(day => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {renderCalendarDays()}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.availableColor}`}></div>
          <span>Available</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.selectedColor}`}></div>
          <span>Selected</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.rangeColor}`}></div>
          <span>Date Range</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.bookedColor}`}></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default CustomCalender;