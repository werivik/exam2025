import { headers } from "../headers";
import { BOOKINGS_CREATE, BOOKINGS_UPDATE, BOOKINGS_DELETE } from "../constants";

export const handleBookingSubmit = async (checkInDate, checkOutDate, guests, venueId, setShowBookingPopup, setPopupMessage) => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setPopupMessage("You need to log in first.");
      setShowBookingPopup(true);
      return;
    }

    const response = await fetch(BOOKINGS_CREATE, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        dateFrom: new Date(checkInDate).toISOString(),
        dateTo: new Date(checkOutDate).toISOString(),
        guests: parseInt(guests, 10),
        venueId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Booking failed:", data);
      setPopupMessage(data.errors?.[0]?.message || "Booking failed");
      setShowBookingPopup(true);
      return;
    }

    console.log("Booking submitted successfully:", data);
    setPopupMessage("Booking successful!");
    setShowBookingPopup(true);

    return data;
  } 
  
  catch (error) {
    console.error("Booking API error:", error);
    setPopupMessage("Booking submission failed. Please try again.");
    setShowBookingPopup(true);
  }
};

export const handleBookingUpdate = async (
  bookingId, 
  bookingData, 
  setPopupMessage, 
  setShowBookingPopup
) => {
  console.log('handleBookingUpdate called with:', { bookingId, bookingData });
  if (!bookingId) {
    console.error('No booking ID provided');
    if (setPopupMessage) setPopupMessage('Invalid booking ID');
    if (setShowBookingPopup) setShowBookingPopup(true);
    return null;
  }
  if (!bookingData.dateFrom || !bookingData.dateTo) {
    console.error('Missing date information');
    if (setPopupMessage) setPopupMessage('Please provide both check-in and check-out dates');
    if (setShowBookingPopup) setShowBookingPopup(true);
    return null;
  }
  if (!validateDate(bookingData.dateFrom) || !validateDate(bookingData.dateTo)) {
    console.error('Invalid date format');
    if (setPopupMessage) setPopupMessage('Invalid dates. Please check your dates.');
    if (setShowBookingPopup) setShowBookingPopup(true);
    return null;
  }
  const guests = parseInt(bookingData.guests, 10);
  if (isNaN(guests) || guests < 1) {
    console.error('Invalid number of guests:', bookingData.guests);
    if (setPopupMessage) setPopupMessage('Please enter a valid number of guests (minimum 1)');
    if (setShowBookingPopup) setShowBookingPopup(true);
    return null;
  }
  const dateFrom = new Date(bookingData.dateFrom);
  const dateTo = new Date(bookingData.dateTo);
  if (dateTo <= dateFrom) {
    console.error('Check-out date must be after check-in date');
    if (setPopupMessage) setPopupMessage('Check-out date must be after check-in date');
    if (setShowBookingPopup) setShowBookingPopup(true);
    return null;
  }
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      if (setPopupMessage) setPopupMessage("You need to log in first.");
      if (setShowBookingPopup) setShowBookingPopup(true);
      return null;
    }
    const requestBody = {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      guests: guests,
    };

    console.log('Sending PUT request with body:', requestBody);

    const response = await fetch(`${BOOKINGS_UPDATE.replace('<id>', bookingId)}`, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Booking update failed:", data);
      console.error("Response status:", response.status);
      console.error("Response headers:", [...response.headers.entries()]);
      if (setPopupMessage) {
        const errorMessage = data.errors?.[0]?.message || 
                           data.message || 
                           `Booking update failed (${response.status})`;
        setPopupMessage(errorMessage);
      }
      if (setShowBookingPopup) setShowBookingPopup(true);
      return null;
    }
    console.log("Booking updated successfully:", data);
    if (setPopupMessage) setPopupMessage("Booking updated successfully!");
    if (setShowBookingPopup) setShowBookingPopup(true);
    return data;
  } 
  catch (error) {
    console.error("Booking update API error:", error);
    if (setPopupMessage) setPopupMessage("Booking update failed. Please try again.");
    if (setShowBookingPopup) setShowBookingPopup(true);
    return null;
  }
};

export const handleBookingDelete = async (
  bookingId, 
  setPopupMessage, 
  setShowBookingPopup
) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      if (setPopupMessage) setPopupMessage("You need to log in first.");
      if (setShowBookingPopup) setShowBookingPopup(true);
      return false;
    }
    
    const response = await fetch(`${BOOKINGS_DELETE.replace('<id>', bookingId)}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    
    if (!response.ok) {
      console.error("Booking deletion failed");
      if (setPopupMessage) setPopupMessage("Failed to cancel booking");
      if (setShowBookingPopup) setShowBookingPopup(true);
      return false;
    }
    
    console.log("Booking deleted successfully");
    if (setPopupMessage) setPopupMessage("Booking cancelled successfully!");
    if (setShowBookingPopup) setShowBookingPopup(true);
    
    return true;
  } 
  catch (error) {
    console.error("Booking deletion API error:", error);
    if (setPopupMessage) setPopupMessage("Failed to cancel booking. Please try again.");
    if (setShowBookingPopup) setShowBookingPopup(true);
    return false;
  }
};

export const validateDate = (date) => {
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};