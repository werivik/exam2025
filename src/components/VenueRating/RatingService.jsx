export const RatingService = {
  getUserRating: (venueId) => {
    try {
      const storedRatings = sessionStorage.getItem('userVenueRatings');
      if (storedRatings) {
        const ratings = JSON.parse(storedRatings);
        return ratings[venueId] || 0;
      }
      return 0;
    } 
    catch (error) {
      console.error('Error retrieving user rating:', error);
      return 0;
    }
  },

  saveUserRating: (venueId, rating) => {
    try {
      const storedRatings = sessionStorage.getItem('userVenueRatings') || '{}';
      const ratings = JSON.parse(storedRatings);
      ratings[venueId] = rating;
      sessionStorage.setItem('userVenueRatings', JSON.stringify(ratings));
    } 
    catch (error) {
      console.error('Error saving user rating locally:', error);
    }
  },

submitRating: async (venueId, rating) => {
  if (!venueId || rating < 0 || rating > 5) {
    throw new Error('Invalid rating parameters');
  }

  try {
    RatingService.saveUserRating(venueId, rating);
    return {
      success: true,
      message: 'Rating saved locally.',
    };
  } 
  catch (error) {
    console.error('submitRating error:', error);
    throw error;
  }
}
};

export default RatingService;