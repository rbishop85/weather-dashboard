// Main page Elements
var cityInputEl = $("#cityInput");
var countryListEl = $("#countries");
var statesListEl = $("#states");
var searchButtonEl = $("#searchButton");
var weatherCurrentEl = $("#weatherCurrent");
var weather5DayEl = $("#weather5Day");
var weatherAlertEl = $("#weatherAlert");
var weatherHistoryEl = $("#weatherHistory");

// API web addresses
var apiCountries = "https://restcountries.com/v3.1/all";
var apiGeo = "http://api.openweathermap.org/geo/1.0/direct";
var apiOneCall = "https://api.openweathermap.org/data/2.5/onecall";

var DateTime = luxon.DateTime;

var lat = "";
var lon = "";


// Variable for Location to be searched for
var geoLocation = "";
var apiKey = "3b1598e13550c0d6619df609201a1c27";
var cityLocation = "";

// Variables for calculating wind direction
var directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
var windAngle = "";


// Fetches an API list of all 250 countries.  Pulls all country names and country codes and creates an array of objects for each.  Sorts that Array alphabetically by country name.  Appends each country into the dropdown list, setting the United States as the default selection.
fetch(apiCountries)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        var countryList = [];
        data.forEach(function (country) {
            var countryObject = {name: country.name.common, value: country.cca2}
            countryList.push(countryObject);
        })
        countryList.sort((a, b) => (a.name > b.name) ? 1 : -1)
        countryList.forEach(function (country) {
            if(country.value === "US") {
                countryListEl.append(`<option value="${country.value}" selected>${country.name}</option>`);
            } else
            countryListEl.append(`<option value="${country.value}">${country.name}</option>`);
        })
    });

// Pulls from state list in other js file and appends each state into the dropdown list
states.forEach(function (state) {
    statesListEl.append(`<option value="${state.abbreviation}">${state.name}</option>`);
})
    
// Display states list when country list is set to United States
countryListEl.change(function() {
    if (countryListEl.val() == "US") {
        document.getElementById('states').style.display = '';
    } else {
        document.getElementById('states').style.display = 'none';
}});

// What happens when the search button is clicked
searchButtonEl.on("click", function(event) {
    event.preventDefault();
    if(cityInputEl.val() === "") {
        alert("Please enter a city name.");
        return;
    } else if(countryListEl.val() === "US" && statesListEl.val() === null) {
        alert("Please select a state.");
        return;
    } else if(countryListEl.val() === "US") {
        geoLocation = (cityInputEl.val() + "," + statesListEl.val() + "," + countryListEl.val());
        console.log(geoLocation);
        cityLocation = (cityInputEl.val() + ", " + statesListEl.val());
        console.log(cityLocation);
    } else {
        geoLocation = (cityInputEl.val() + "," + countryListEl.val());
        console.log(geoLocation);
        cityLocation = (cityInputEl.val() + ", " + countryListEl.val());
        console.log(cityLocation);
    }
    findCoords();
});


function findCoords() {
    fetch(`${apiGeo}?q=${geoLocation}&appid=${apiKey}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
        if(!data[0]) {
            alert("City not found, please check info entered.")
            return;
        } else {
            lat = (data[0].lat);
            console.log("lat: " + lat);
            lon = (data[0].lon);
            console.log("lon: " + lon);
            pullWeatherData();
        }
    weatherHistoryEl.append(`
    <input class="btn btn-secondary" type="button" data-loc="${geoLocation}" value="${cityLocation}">
    `)
         
})};

function pullWeatherData() {
    fetch(`${apiOneCall}?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        // Converts dt variable from data into a readable Date
        var currentDate = DateTime.fromSeconds(data.current.dt).toLocaleString();
        var currentWeatherDesc = data.current.weather[0].description;
        currentWeatherDesc = currentWeatherDesc.charAt(0).toUpperCase() + currentWeatherDesc.slice(1);
        // var currentTemp = Math.round(data.current.temp);
        windAngle = data.current.wind_deg;

        weatherCurrentEl.html("");
        weatherCurrentEl.append(`
        <p>${cityLocation} (${currentDate})</p>
        <img src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png">
        <p>${currentWeatherDesc}</p>
        <p>Temp: ${Math.round(data.current.temp)}°F</p>
        <p>Hi: ${Math.round(data.daily[0].temp.max)}°F, Lo: ${Math.round(data.daily[0].temp.min)}°F</p>
        <p>Wind: ${windDirection(windAngle)} at ${Math.round(data.current.wind_speed)}mph</p>
        <p>Humidity: ${data.current.humidity}%</p>
        <p>UV Index</p>
        `)
    })
}

function printWeather5Day() {

}

function printWeatherAlert() {

}

// Determines wind direction from wind angle given
function windDirection(windAngle) {
   var index = Math.round(((windAngle %= 360) < 0 ? windAngle + 360 : windAngle) / 45) % 8;
   return directions[index]
}
