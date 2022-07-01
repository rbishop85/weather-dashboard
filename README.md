# weather-dashboard
Browser based Weather Dashboard utilizing Third Party APIs.






// Class Notes

make a variable for API key to easily call it

form submit event for city name

Geo location service on city name

api.openweathermap.org/geo

return latitude and longitude

take first result, don't worry about various cities with same name
- maybe try and create dropdown for country and state (if US)?

use that info to make second request for weather date via onecall

exclude minutely and hourly, only retrieve daily

2 apis to use
One Call API 1.0 <- for weather>
Geocoding API <- find location of lat and long of city>
-Direct Geocoding

Insomnia app to test API URL's and see what data we get back
- Rewatch week 6 day 2 pre class for walkthrough


Use local storage to save searched Cities to array list that is displayed for quickly reloading


// Submit the form (current search) to fetch weather information
// Handle button clicks (past searches) to fetch weather information

// function to fetch Geolocation Data for city (Geocoding API)
https://openweathermap.org/api/geocoding-api
// FUnction to Fetch WEather Data (Oncecall)

