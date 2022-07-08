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
var apiKey = "3b1598e13550c0d6619df609201a1c27";

// Shortens future luxon calls
var DateTime = luxon.DateTime;

// Variable for Location to be searched for
var geoLocation = "";
var cityLocation = "";

// Function to load search History
var historyList = [];

pageStart();

function populateSearchHistory() {
    var storedHistory = JSON.parse(localStorage.getItem("historyList"));
    if (storedHistory !== null) {
        historyList = storedHistory;
        weatherHistoryEl.html("");
        historyList.forEach(function (historyItem) {
            weatherHistoryEl.append(`
            <div class="col-5 col-md-4 col-lg-10 my-1 px-2">
            <input class="btn btn-secondary col-12" type="button" data-loc="${historyItem.geo}" value="${historyItem.city}">
            </div>
            `);
        })
    }
};

// Fetches an API list of all 250 countries.  Pulls all country names and country codes and creates an array of objects for each.  Sorts that Array alphabetically by country name.  Appends each country into the dropdown list, setting the United States as the default selection.
function pageStart() {
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
    states.forEach(function (state) {
        statesListEl.append(`<option value="${state.abbreviation}">${state.name}</option>`);
    })
    populateSearchHistory();
}


// Pulls from state list in other js file and appends each state into the dropdown list

    
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
        console.log(data.timezone);
        printWeather(data.current, data.daily, data.timezone);
    })
}

function printWeather(current, daily, timezone) {
    // Converts dt variable from data into a readable Date
    var currentDate = DateTime.fromSeconds(current.dt, {zone: timezone}).toFormat("EEE, M/d/y");
    var currentWeatherDesc = current.weather[0].description;
    currentWeatherDesc = currentWeatherDesc.charAt(0).toUpperCase() + currentWeatherDesc.slice(1);        
    var uvColor = uvBackColor(current.uvi);

    weatherCurrentEl.html("");
    weatherCurrentEl.addClass("border border-2 border-dark rounded");
    weatherCurrentEl.append(`
        <h2 class="text-center mb-0 mb-md-4">${cityLocation} (${currentDate})</h2>
        <h3 class="text-center">Current time: ${DateTime.fromSeconds(current.dt, {zone: timezone}).toFormat("h:mma")}</h3>
        <div class="row justify-content-center">
            <div class="col-auto">
                <img src="http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png">
                <p>${currentWeatherDesc}</p>
            </div>
            <div class="col-0 col-md-2">
            </div>
            <div class="col-auto text-center"
                <p>Temp: ${Math.round(current.temp)}°F</p>
                <p><span class="text-warning">Hi: ${Math.round(daily[0].temp.max)}°F</span>, <span class="text-info">Lo: ${Math.round(daily[0].temp.min)}°F</span></p>
                <p>Wind: ${windDirection(current.wind_deg)} at ${Math.round(current.wind_speed)}mph</p>
                <p>Humidity: ${current.humidity}%</p>
                <span class="p-1 rounded"style="background-color:${uvColor}; margin: auto">UV Index: ${current.uvi} </span>
            </div>
        </div>
        `);

    weather5DayEl.html("");
    weather5DayEl.append(`
        <h3 class="text-center">5-Day Forcast:</h3>
        <div class="d-flex flex-wrap justify-content-evenly" id="fiveDayForcast">
    `);
    var testEl = $("#fiveDayForcast")
    for (var i = 1; i < 6; i++){
    testEl.append(`
        <div class="bg-secondary col-12 col-md-2 p-2 m-1 text-center">
            <p class="fw-bold mt-2" style="line-height:.25">${DateTime.fromSeconds(daily[i].dt).toFormat("EEEE")}</p>
            <p class="fw-bold" style="line-height:.25">${DateTime.fromSeconds(daily[i].dt).toFormat("(M/d/yy)")}</p>
            <img src="http://openweathermap.org/img/wn/${daily[i].weather[0].icon}.png">
            <p>${(daily[i].weather[0].description).charAt(0).toUpperCase() + (daily[i].weather[0].description).slice(1)}</p>
            <p><span class="text-warning">Hi: ${Math.round(daily[i].temp.max)}°F</span>, <span class="text-info">Lo: ${Math.round(daily[i].temp.min)}°F</span></p>
            <p>Wind: ${windDirection(daily[i].wind_deg)} at ${Math.round(daily[i].wind_speed)}mph</p>
            <p>Humidity: ${daily[i].humidity}%</p>
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
      

   