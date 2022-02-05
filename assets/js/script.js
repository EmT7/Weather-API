var userFormEl = document.querySelector('#user-form');
var cityInputEl = document.querySelector('#cityname');
var forecastContainerEl = document.querySelector('#forecast-container');
var citySearchTermEl = document.querySelector('#city-search-term');
var pastSearchEl = document.querySelector('#past-search')
var fiveDayEl = document.querySelector('#five-day-forecast')
var forecastSquare = document.querySelector('#forecast-box')
var cities = [];

// Function to save localstorage
var saveCities = function () {
    localStorage.setItem("cities", JSON.stringify(cities));
};

// Function to load localStorage
var loadCities = function () {
    cities = JSON.parse(localStorage.getItem('cities')) || [];

    // Creating buttons with past searched cities that will persist on refresh from localstorage
    cities.forEach(city => {
        var savedCityButton = document.createElement('button');
        savedCityButton.textContent = city.text;
        savedCityButton.classList.add('btn');
        savedCityButton.style.backgroundColor = 'MediumTurquoise';
        pastSearchEl.appendChild(savedCityButton);

        // Click event to redisplay information from localstorage on refresh
        savedCityButton.addEventListener('click', function (event) {
            city = event.target.textContent;
            forecastSquare.setAttribute('style', 'display: block')
            getCityForecasts(city);
            getFiveDayForecast(city);
        })
    })

}

// Function to accept city inputs
var citySubmitHandler = function (event) {
    event.preventDefault();
    // User city input
    var cityName = cityInputEl.value.trim();

    // Conditional statement to run forecast and 5-day functions if value is present from form
    if (cityName) {
        getCityForecasts(cityName);
        getFiveDayForecast(cityName);
        forecastSquare.setAttribute('style', 'display:block');

        var savedCity = cityInputEl.value;
        var completeTask = {
            text: savedCity
        }
        cities.push(completeTask);
        saveCities()

        // Button elements created to display recent searches after click event from inital city search
        var savedCityButton = document.createElement('button');
        savedCityButton.textContent = savedCity;
        savedCityButton.classList.add('btn');
        savedCityButton.style.backgroundColor = 'MediumTurquoise';
        pastSearchEl.appendChild(savedCityButton);

        // Click event to display weather information from recent search buttons, before page refresh
        savedCityButton.addEventListener('click', function (event) {
            cityName = event.target.textContent;
            getCityForecasts(cityName);
            getFiveDayForecast(cityName);
        })

        cityInputEl.value = '';

    } else {
        alert('Please enter a city name to display forecasts');
    }
};

// API access to current weather forecasts from Openweathermap
var getCityForecasts = function (city) {
    var currentApiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=imperial&appid=9350589380da95bfd83dc5d2163f1485'

    fetch(currentApiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayWeather(data, city);
                getUv(data.coord.lat, data.coord.lon);
            });
        } else {
            alert('ERROR: ' + city + ' does not have a forecast. Please input name of real city.')
        }
    })
}

// API access to UV Index information from Openweathermap
var getUv = function (lat, lon) {
    var uvApiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=&appid=9350589380da95bfd83dc5d2163f1485'
    fetch(uvApiUrl).then(function (response) {
        if (response.ok) {
            // Building UV Index variable from separate API that will attach to current forecast box
            response.json().then(function (data) {
                var uviIndex = data.current.uvi;
                var uviEl = document.createElement('div');
                var uviContainer = document.createElement('span');
                var uviSpanNum = document.createElement('span')
                uviSpanNum.textContent = uviIndex
                uviContainer.textContent = 'UV Index: ' + uviSpanNum.textContent;
                uviEl.appendChild(uviContainer);
                forecastContainerEl.append(uviEl);
                // Conditional statements apply color correct UV Index definitions
                if (uviIndex >= 0 && uviIndex < 3) {
                    uviContainer.style.backgroundColor = 'green'
                    uviContainer.style.color = 'white'
                }
                else if (uviIndex >= 3 && uviIndex < 5) {
                    uviContainer.style.backgroundColor = 'Khaki'
                    uviContainer.style.color = 'white'
                }
                else if (uviIndex >= 5 && uviIndex < 7) {
                    uviSpanNum.style.backgroundColor = 'orange'
                    uviSpanNum.style.color = 'white'
                }
                else if (uviIndex >= 8 && uviIndex < 10) {
                    uviContainer.style.backgroundColor = 'orange'
                    uviContainer.style.color = 'white'
                }
                else {
                    uviContainer.style.backgroundColor = 'purple'
                    uviContainer.style.color = 'white'
                }
            })
        }

    })
}

// API access to 5-day forecast, updated every 3-hours from Openweathermap 
var getFiveDayForecast = function (city) {
    var fiveDayApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&units=imperial&appid=9350589380da95bfd83dc5d2163f1485'

    fetch(fiveDayApiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayFiveDay(data, city);
            })
        } else {
            alert('ERROR: ' + city + ' does not have five-day forecast. Please input name of real city.')
        }

    })
}

// Function to dynamically create elements from current weather API
var displayWeather = function (weather, searchTerm) {
    forecastContainerEl.textContent = ''

    // Small png weather image diplayed alongside listed city
    var weatherCartoon = weather.weather[0].icon;
    var weatherImage = document.createElement('img')
    weatherImage.src = 'https://openweathermap.org/img/w/' + weatherCartoon + '.png';
    var weatherHolder = document.createElement('span');
    weatherHolder.appendChild(weatherImage);
    // Listed city with current date using moment.js formatting
    citySearchTermEl.textContent = searchTerm + ' (' + moment().format('l') + ')';
    citySearchTermEl.appendChild(weatherHolder);

    // Created div to display current temperature
    var temp = weather.main.temp;
    var tempEl = document.createElement('div');
    var tempContainer = document.createElement("span");
    tempContainer.textContent = 'Temp: ' + temp + '°F';
    tempEl.appendChild(tempContainer);
    forecastContainerEl.appendChild(tempEl);

    // Created div to display current wind speed
    var wind = weather.wind.speed;
    var windEl = document.createElement('div');
    var windContainer = document.createElement('span');
    windContainer.textContent = 'Wind: ' + wind + ' MPH';
    windEl.appendChild(windContainer);
    forecastContainerEl.appendChild(windEl);

    // Created div to dispaly current humidity percentage
    var humidity = weather.main.humidity;
    var humidityEl = document.createElement('div');
    var humidityContainer = document.createElement('span');
    humidityContainer.textContent = 'Humidity: ' + humidity + '%';
    humidityEl.appendChild(humidityContainer);
    forecastContainerEl.appendChild(humidityEl);

};

// Function to dynamically create 5-day forecast elements from the 5-day forecast API
var displayFiveDay = function (weather) {
    fiveDayEl.textContent = '';

    // Iterating over array of three-hour weather forecast objects
    for (i = 0; i < weather.list.length; i++) {

        // Splitting time string from three-hour weather object to build variable
        var daytime = weather.list[i].dt_txt.split(" ");
        var time = daytime[1];
        var noon = weather.list[i]

        // Splitting date string from three-hour weather object to isolate day, month and year from specific objects
        var dateScript = weather.list[i].dt_txt.split(" ");
        var listDate = dateScript[0].split('-');
        var year = listDate[0];
        var month = listDate[1];
        var day = listDate[2];

        // Conditional statement to check object times against 12:00:00pm standard for dispaly 
        if (time === '12:00:00') {

            // Dynamically created div to hold weather information in aesthetic manner
            var weatherBox = document.createElement('div');
            weatherBox.style.border = 'solid black 2px';
            weatherBox.style.backgroundColor = 'SteelBlue';
            weatherBox.style.padding = '10px';
            fiveDayEl.appendChild(weatherBox);

            // Dynamically created span to hold concatenated current date string header
            var date = document.createElement('span');
            date.textContent = month + '/' + day + '/' + year;
            date.classList.add('h4');
            date.style.color = 'white';
            weatherBox.appendChild(date);

            // Dynamically created image and div to hold associated image to represent weather for day
            var weatherCartoon = noon.weather[0].icon;
            var weatherImage = document.createElement('img')
            weatherImage.src = 'https://openweathermap.org/img/w/' + weatherCartoon + '.png';
            var weatherHolder = document.createElement('div');
            weatherHolder.appendChild(weatherImage);
            weatherBox.appendChild(weatherHolder);

            // Dynamically created div to hold span that displays temperature for specified day
            var fiveTemp = noon.main.temp;
            var fiveTempEl = document.createElement('div');
            var fiveTempContainer = document.createElement("span");
            fiveTempContainer.textContent = 'Temp: ' + fiveTemp + '°F';
            fiveTempContainer.style.color = 'white';
            fiveTempEl.appendChild(fiveTempContainer);
            weatherBox.appendChild(fiveTempEl);

            // Dynamically created div to hold span that displays wind speed for specified day
            var fiveWind = noon.wind.speed;
            var fiveWindEl = document.createElement('div');
            var fiveWindContainer = document.createElement('span');
            fiveWindContainer.textContent = 'Wind: ' + fiveWind + ' MPH';
            fiveWindContainer.style.color = 'white'
            fiveWindEl.appendChild(fiveWindContainer);
            weatherBox.appendChild(fiveWindEl);

            // Dynamicaslly created div to hold span that displays humidity for specified day
            var fiveHumidity = noon.main.humidity;
            var fiveHumidityEl = document.createElement('div');
            var fiveHumidityContainer = document.createElement('span');
            fiveHumidityContainer.textContent = 'Humidity: ' + fiveHumidity + '%';
            fiveHumidityContainer.style.color = 'white';
            fiveHumidityEl.appendChild(fiveHumidityContainer);
            weatherBox.appendChild(fiveHumidityEl);
        }
    }
}

// Event listener to execute application on search click
userFormEl.addEventListener('submit', citySubmitHandler);
loadCities();