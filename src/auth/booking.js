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

    const { dateFrom, dateTo, guests } = updatedValues;

    if (!validateDate(dateFrom) || !validateDate(dateTo)) {
      console.error('Invalid date(s)');
      setPopupMessage('Invalid date(s) provided.');
      setShowBookingPopup(true);
      return;
    }

    const response = await fetch(BOOKINGS_UPDATE.replace('<id>', bookingId), {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
        guests: Number(guests),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Booking update failed:", data);
      setPopupMessage(data.errors?.[0]?.message || "Booking update failed");
      setShowBookingPopup(true);
      return;
    }

    console.log("Booking updated successfully:", data);
    setPopupMessage("Booking updated!");
    setShowBookingPopup(true);
    return data;
  } 
  catch (error) {
    console.error("Booking update error:", error);
    setPopupMessage("Something went wrong updating the booking");
    setShowBookingPopup(true);
  }
};

export const handleDeleteBooking = async (bookingId) => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error("No token found");
  console.log(bookingId);

  const url = BOOKINGS_DELETE.replace('<id>', bookingId);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete booking");
  }

  return true;
};
