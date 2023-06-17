$(document).ready(function () {
    var apiKey = 'bd770aac7e708a8931e6388ba9263b79'

    var cityHistory = []
    if (localStorage.getItem('cityHistory')) {
      cityHistory = JSON.parse(localStorage.getItem('cityHistory'))
      createHistoryList(cityHistory)
    }
  
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
          $('#main').removeAttr('style')
          getCurrentFromCoordinates(position.coords.latitude, position.coords.longitude)
        },
        function (error) {
          if (error.code === error.PERMISSION_DENIED) {
            $('#main').removeAttr('style')
            if (cityHistory[0]) {
              getCurrentWeather(cityHistory[(cityHistory.length - 1)])
              getFiveDayForecast(cityHistory[(cityHistory.length - 1)])
            } else {
              getCurrentWeather('New York')
              getFiveDayForecast('New York')
            }
          }
        })
    } else {
      $('#main').removeAttr('style')
      if (cityHistory[0]) {
        getCurrentWeather(cityHistory[cityHistory.length -1])
        getFiveDayForecast(cityHistory[cityHistory.length-1])
      } else {
        getCurrentWeather('New York')
        getFiveDayForecast('New York')
      }
    }
  
    function createHistoryList(historyArray) {
      for (var i = 0; i < historyArray.length; i++) {
        var newA = $('<a>')
        newA.attr('class', 'panel-block')
        newA.text(historyArray[i])
        newA.attr('id', historyArray[i])
        $('#cityHistoryContainer').prepend(newA)
      }
    }
  
    function getCurrentFromCoordinates(lat, lon) {
      $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/weather?' + 'lat=' + lat + '&lon=' + lon + '&units=imperial' + '&APPID=' + apiKey,
        method: 'GET',
      }).then(function (response) {
        getFiveDayForecast(response.name)
        getUVIndex(response.coord.lat, response.coord.lon)
        $('#currentCity').text(response.name)
        $('#currentDate').text(moment().format('MMMM Do, YYYY'))
        $('#currentTemperature').text('Current Temperature: ' + (response.main.temp.toFixed()) + '°')
        $('#currentHumidity').text('Humidity: ' + response.main.humidity + '%')
        $('#currentWindSpeed').text('Wind Speed: ' + response.wind.speed + ' mph')
      })
    }
  
    function getCurrentWeather(cityName) {
      $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=imperial' + '&APPID=' + apiKey,
        method: 'GET',
      }).then(function (response) {
        getUVIndex(response.coord.lat, response.coord.lon)
        $('#currentCity').text(response.name)
        $('#currentDate').text(moment().format('MMMM Do, YYYY'))
        $('#currentTemperature').text('Current Temperature: ' + (response.main.temp.toFixed()) + '°')
        $('#currentHumidity').text('Humidity: ' + response.main.humidity + '%')
        $('#currentWindSpeed').text('Wind Speed: ' + response.wind.speed + ' mph')
      })
    }
  
    function getFiveDayForecast(cityName) {
      $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/forecast?q=' + cityName + '&units=imperial' + '&APPID=' + apiKey,
        method: 'GET',
      }).then(function (response) {
        var fiveDayForecast = []
        for (var i = 0; i < response.list.length; i++) {
          var hr = (response.list[i].dt_txt.split(' '))[1]
          if (hr === '18:00:00') {
            fiveDayForecast.push(response.list[i])
          }
        }
        for (var j = 0; j < fiveDayForecast.length; j++) {
          $('#day' + (j + 1)).empty()
          var newDayOfWeek = $('<div>')
          newDayOfWeek.text(moment(fiveDayForecast[j].dt_txt).format('dddd'))
          newDayOfWeek.attr('style', 'font-weight:600')
          var newDivDate = $('<div>')
          newDivDate.text((moment(fiveDayForecast[j].dt_txt).format('MM/DD/YYYY')))
          var newImgIcon = $('<img>').attr('src', 'https://openweathermap.org/img/wn/' + fiveDayForecast[j].weather[0].icon + '@2x.png')
          var newDivTemp = $('<div>')
          newDivTemp.text((fiveDayForecast[j].main.temp.toFixed()) + '°')
          var newDivHumidity = $('<div>')
          newDivHumidity.text(fiveDayForecast[j].main.humidity + '% Humidity')
          $('#day' + (j + 1)).append(newDayOfWeek, newDivDate, newImgIcon, newDivTemp, newDivHumidity)
        }
      })
    }
  
    function getUVIndex(lat, lon) {
      $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/uvi/forecast?&lat=' + lat + '&lon=' + lon + '&cnt=1' + '&APPID=' + apiKey,
        method: 'GET',
      }).then(function (response) {
        $('#currentUVIndex').text('UV Index: ' + response[0].value)
      })
    }
  
    function addToHistory(cityName) {
      cityHistory.push(cityName)
      localStorage.setItem('cityHistory', JSON.stringify(cityHistory))
      var newA = $('<a>')
      newA.attr('class', 'panel-block')
      newA.text(cityName)
      newA.attr('id', cityName)
      $('#cityHistoryContainer').prepend(newA)
    }
  
    function clear() {
      $('#cityHistoryContainer').text('')
      localStorage.clear()
    }
  
    $('#citySearch').on('keydown', function (e) {
      if (e.keyCode == 13) {
        e.preventDefault()
        var cityName = $(this).val()
        $(this).val('')
        addToHistory(cityName)
        getCurrentWeather(cityName)
        getFiveDayForecast(cityName)
      }
    })
  
    $('#cityHistoryContainer').on('click', function (e) {
      if (e.target.matches('a')) {
        e.preventDefault()
        var cityName = (e.target.id)
        getCurrentWeather(cityName)
        getFiveDayForecast(cityName)
      }
    })
  
    $('#clear').on('click', function (e) {
      clear()
    })
})