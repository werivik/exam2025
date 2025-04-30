import { headers } from "../headers";
import { BOOKINGS_CREATE } from "../constants";

export const handleBookingSubmit = async (checkInDate, checkOutDate) => {
    try {
      const token = localStorage.getItem('accessToken');
  
      if (!token) {
        console.warn('No access token found in localStorage');
        alert('You need to log in first.');
        return;
      }
  
      const response = await fetch(BOOKINGS_CREATE, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({
          dateFrom: checkInDate,
          dateTo: checkOutDate,
          guests,
          venueId,
        }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("Booking submission failed with response:", errorResponse);
        throw new Error(`Booking submission failed: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Booking submitted successfully:", data);
      alert('Booking successful!');
    } 
    
    catch (error) {
      console.error("Booking API error:", error);
      alert('Booking submission failed. Please try again.');
    }
  };