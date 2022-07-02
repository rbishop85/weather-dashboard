// Country List Dropdown
var countryListEl = $("#countries");
var countriesApi = "https://restcountries.com/v3.1/all";
var statesListEl = $("#states");


// Fetches an API list of all 250 countries.  Pulls all country names and country codes and creates an array of objects for each.  Sorts that Array alphabetically by country name.  Appends each country into the dropdown list, setting the United States as the default selection.
fetch(countriesApi)
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


// Display states list when country list is set to United States
countryListEl.change(function() {
    console.log(countryListEl.val())
    if (countryListEl.val() == "US") {
        document.getElementById('states').style.display = '';
    } else {
        document.getElementById('states').style.display = 'none';
}
});