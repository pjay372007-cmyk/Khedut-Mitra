/**
 * iKhedut Krushi Mitra — Weather Service Integration Module
 */

window.app = window.app || {};

Object.assign(window.app, {
    fetchLiveWeather(regionKey, updateDashboardOnly = false) {
        if (typeof WeatherService !== 'undefined') {
            WeatherService.fetchLiveWeather(regionKey, updateDashboardOnly, this);
        }
    },

    showHourlyForecast(dayIndex) {
        if (typeof WeatherService !== 'undefined') {
            WeatherService.showHourlyForecast(dayIndex);
        }
    },

    getWeatherInfoFromCode(code) {
        if (typeof WeatherService !== 'undefined') {
            return WeatherService.getWeatherInfoFromCode(code);
        }
        return { cond: "Overcast", icon: "fa-cloud", color: "#4b5563" };
    }
});
