// Main page Elements
var cityInputEl = $("#cityInput");
var countryListEl = $("#countries");
var statesListEl = $("#states");
var searchButtonEl = $("#searchButton");
var weatherCurrentEl = $("#weatherCurrent");
var weather5DayEl = $("#weather5Day");
var weatherHistoryEl = $("#weatherHistory");

// API web addresses
var apiCountries = "https://restcountries.com/v3.1/all";
var apiGeo = "http://api.openweathermap.org/geo/1.0/direct";
var apiOneCall = "https://api.openweathermap.org/data/2.5/onecall";

var DateTime = luxon.DateTime;

// Variable for Location to be searched for
var geoLocation = "";
var apiKey = "3b1598e13550c0d6619df609201a1c27";
var cityLocation = "";

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
        // Button clicked is removed from history list and then re-added to move it to top of the list
        historyList.splice(indexOfObject, 1);
        addItemToHistory();
        findCoords();
    }

});
// What happens when the search button is clicked
searchButtonEl.on("click", function(event) {
    event.preventDefault();
    if(cityInputEl.val() === "") {
        displayModal("Please enter a city name.");
        return;
    } else if(countryListEl.val() === "US" && statesListEl.val() === null) {
        displayModal("Please select a state.");
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
            displayModal("City not found, please check info entered.");
            return;
        } else {
            addItemToHistory();
            pullWeatherData(data[0].lat, data[0].lon);
        }
})};

function pullWeatherData(lat, lon) {
    fetch(`${apiOneCall}?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        printWeather(data);
    })
}

function printWeather(data) {
    // Converts dt variable from data into a readable Date
    var currentDate = DateTime.fromSeconds(data.current.dt).toLocaleString();
    var currentWeatherDesc = data.current.weather[0].description;
    currentWeatherDesc = currentWeatherDesc.charAt(0).toUpperCase() + currentWeatherDesc.slice(1);        
    var uvColor = uvBackColor(data.current.uvi);

    weatherCurrentEl.html("");
    weatherCurrentEl.addClass("border border-2 border-dark rounded");
    weatherCurrentEl.append(`
        <h2 class="text-center mb-5">${cityLocation} (${currentDate})</h2>
        <div class="row justify-content-center">
        <div class="col-auto"
        <p>Temp: ${Math.round(data.current.temp)}°F</p>
        <p><span class="text-warning">Hi: ${Math.round(data.daily[0].temp.max)}°F</span>, <span class="text-info">Lo: ${Math.round(data.daily[0].temp.min)}°F</span></p>
        <p>Wind: ${windDirection(data.current.wind_deg)} at ${Math.round(data.current.wind_speed)}mph</p>
        <p>Humidity: ${data.current.humidity}%</p>
        <span class="p-1 rounded"style="background-color:${uvColor}; margin: auto">UV Index: ${data.current.uvi} </span>
        </div>
        <div class="col-2">
        </div>
        <div class="col-auto">
        <img src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png">
        <p>${currentWeatherDesc}</p>
        </div>
        </div>
        `);

    weather5DayEl.html("");
    weather5DayEl.append(`
    <h3 class="text-center">5-Day Forcast:</h3>
    <div class="d-flex justify-content-evenly" id="fiveDayForcast">
    `);
    var testEl = $("#fiveDayForcast")
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

}


// Determines wind direction from wind angle given
function windDirection(angle) {
    var directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    var index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
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

function uvBackColor(uvi) {
    if (uvi <= 2) {
        uvColor = "green";
    } else if(uvi <= 5) {
        uvColor = "yellow";
    } else if(uvi <= 7) {
        uvColor = "orange";
    } else if(uvi <= 10) {
        uvColor = "red";
    } else {
        uvColor = "Purple";
    }
    return uvColor;
}

function displayModal(text) {
    $("#error").html(text);
    $('#myModal').modal("show");
};
      

   