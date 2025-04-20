import { useState, useEffect } from 'react';
import styles from './CustomCalendar.module.css';

const CustomCalendar = ({ unavailableDates, onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);

    useEffect(() => {
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const days = [];

        for (let day = startOfMonth; day <= endOfMonth; day.setDate(day.getDate() + 1)) {
            days.push(new Date(day));
        }
        setDaysInMonth(days);
    }, [currentMonth]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    const renderDays = () => {
        return daysInMonth.map((date, index) => {
            const formattedDate = date.toISOString().split('T')[0];
            const isUnavailable = unavailableDates.includes(formattedDate);
            const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

            return (
                <div
                    key={index}
                    className={`${styles.day} ${isUnavailable ? styles.unavailable : ''} ${isToday ? styles.today : ''}`}
                    onClick={() => !isUnavailable && handleDateSelect(formattedDate)}
                >
                    {date.getDate()}
                </div>
            );
        });
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    };

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.monthNavigation}>
                <button onClick={handlePrevMonth}>Prev</button>
                <h2>{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</h2>
                <button onClick={handleNextMonth}>Next</button>
            </div>
            <div className={styles.calendarGrid}>
                {renderDays()}
            </div>
        </div>
    );
};

export default CustomCalendar;
