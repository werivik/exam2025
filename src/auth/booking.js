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

export const validateDate = (date) => {
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};

export const handleBookingUpdate = async (bookingId, updatedValues, setShowBookingPopup, setPopupMessage) => {
  try {
    const token = localStorage.getItem('accessToken');

    const { dateFrom, dateTo, guests } = editValues;

    if (!validateDate(dateFrom) || !validateDate(dateTo)) {
    console.error('Invalid date(s)');
    return;
    }

    const requestBody = {
    dateFrom,
    dateTo,
    guests: Number(guests),
  };

    const response = await fetch(BOOKINGS_UPDATE.replace('<id>', bookingId), {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Booking update failed:", data);
      return;
    }

    console.log("Booking updated successfully:", data);

    return data;
  } 
  catch (error) {
    console.error("Booking update error:", error);
  }
};

export const handleDeleteBooking = async (bookingId, setUserBookings, toast = { success: console.log, error: console.error }) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error("You need to log in first.");
      return false;
    }

    const response = await fetch(BOOKINGS_DELETE.replace('<id>', bookingId), {
      method: 'DELETE',
      headers: headers(token),
    });

    if (response.status === 204) {
      if (typeof setUserBookings === 'function') {
        setUserBookings(prev => prev.filter(booking => booking.id !== bookingId));
      }
      toast.success("Booking deleted");
      return true;
    } 
    else {
      const data = await response.json();
      toast.error(data?.errors?.[0]?.message || "Something went wrong deleting the booking");
      return false;
    }
  } 
  catch (error) {
    console.error("Booking deletion error:", error);
    toast.error("Something went wrong deleting the booking");
    return false;
  }
};
