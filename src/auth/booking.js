import { headers } from "../headers";
import { BOOKINGS_CREATE } from "../constants";

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