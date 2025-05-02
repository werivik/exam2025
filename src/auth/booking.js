import { headers } from "../headers";
import { BOOKINGS_CREATE } from "../constants";

export const handleBookingSubmit = async (checkInDate, checkOutDate, guests, venueId) => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('You need to log in first.');
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
      throw new Error(data.errors?.[0]?.message || "Booking failed");
    }

    console.log("Booking submitted successfully:", data);
    alert('Booking successful!');
    return data;

  } 
  
  catch (error) {
    console.error("Booking API error:", error);
    alert('Booking submission failed. Please try again.');
  }
};
