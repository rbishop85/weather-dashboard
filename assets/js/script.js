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


// Function to load search History
var historyList = [];

populateSearchHistory();
function populateSearchHistory() {
    var storedHistory = JSON.parse(localStorage.getItem("historyList"));
    if (storedHistory !== null) {
        historyList = storedHistory;
        weatherHistoryEl.html("");
        historyList.forEach(function (historyItem) {
            weatherHistoryEl.append(`
            <input class="btn btn-secondary" type="button" data-loc="${historyItem.geo}" value="${historyItem.city}">
            `);
        })
    }
};

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


// Click event for Weather History Buttons
weatherHistoryEl.on("click", function(event) {
    if (event.target.matches(".btn")) {
        geoLocation = event.target.dataset.loc;
        cityLocation = event.target.value;
        var indexOfObject = historyList.findIndex(object => {
            return object.geo === geoLocation;
          });
        historyList.splice(indexOfObject, 1);
        addItemToHistory();
        findCoords();
    }

});
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
        cityLocation = (cityInputEl.val() + ", " + statesListEl.val());
    } else {TamuningSan
        geoLocation = (cityInputEl.val() + "," + countryListEl.val());
        cityLocation = (cityInputEl.val() + ", " + countryListEl.val());
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
            lon = (data[0].lon);
            addItemToHistory();
            pullWeatherData();
        }
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
        var uvColor = "";
        if (data.current.uvi <= 2) {
            uvColor = "green";
        } else if(data.current.uvi <= 5) {
            uvColor = "yellow";
        } else if(data.current.uvi <= 7) {
            uvColor = "orange";
        } else if(data.current.uvi <= 10) {
            uvColor = "red";
        } else {
            uvColor = "Purple";
        }
        weatherCurrentEl.html("");
        weatherCurrentEl.append(`
        <h2 class="text-center">${cityLocation} (${currentDate})</h2>
        <img src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png">
        <p>${currentWeatherDesc}</p>
        <p>Temp: ${Math.round(data.current.temp)}°F</p>
        <p><span class="text-warning">Hi: ${Math.round(data.daily[0].temp.max)}°F</span>, <span class="text-info">Lo: ${Math.round(data.daily[0].temp.min)}°F</span></p>
        <p>Wind: ${windDirection(windAngle)} at ${Math.round(data.current.wind_speed)}mph</p>
        <p>Humidity: ${data.current.humidity}%</p>
        <p style="background-color:${uvColor}">UV Index: ${data.current.uvi} </p>
        `)

        weather5DayEl.html("");
        weather5DayEl.append(`
        <h3 class="text-center">5-Day Forcast:</h3>
        <div class="d-flex justify-content-evenly" id="test">
        `);
        var testEl = $("#test")
        for (var i = 1; i < 6; i++){
            testEl.append(`
            <div class="bg-secondary p-2 mx-1">
            <p class="text-center fw-bold">${DateTime.fromSeconds(data.daily[i].dt).toLocaleString()}</p>
            <img src="http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}.png">
            <p>${(data.daily[i].weather[0].description).charAt(0).toUpperCase() + (data.daily[i].weather[0].description).slice(1)}</p>
            <p><span class="text-warning">Hi: ${Math.round(data.daily[i].temp.max)}°F</span>, <span class="text-info">Lo: ${Math.round(data.daily[i].temp.min)}°F</span></p>
            <p>Wind: ${windDirection(data.daily[i].wind_deg)} at ${Math.round(data.daily[i].wind_speed)}mph</p>
            <p>Humidity: ${data.daily[i].humidity}%</p>
            </div>
            `)
        }




                    // 
                    //     <div class="bg-primary p-2">
                    //         <p>Date</p>
                    //         <p>Weather Description & Icon</p>
                    //         <p>Temp Low/Hi</p>
                    //         <p>Wind Speed and Direction</p>
                    //         <p>Humidity</p>
                    //     </div>
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

function addItemToHistory () {
    if (!historyList.some(e => e.geo === geoLocation)) {
        var historyItem = {
            geo: geoLocation,
            city: cityLocation
            };
        historyList.unshift(historyItem);
        // History list is limited to 6 items, removing the last item on the list
        if (historyList.length > 6) {
            historyList.length = 6;
        }
        localStorage.setItem("historyList", JSON.stringify(historyList));
        populateSearchHistory();
      }
}

