/**
 * KrishiAI Weather Controller
 * Proxies request payloads to weather services, aggregates indices, and handles cache tables.
 */

const Joi = require('joi');

const weatherQuerySchema = Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lon: Joi.number().min(-180).max(180).required(),
    region: Joi.string().allow('')
});

const weatherController = {
    /**
     * Proxies weather payload requests to public meteorological APIs.
     */
    async getWeatherForecast(req, res) {
        const { error, value } = weatherQuerySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { lat, lon } = value;
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code&timezone=auto`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`OpenMeteo service returned status: ${response.status}`);
            }

            const data = await response.json();
            return res.status(200).json({
                source: "KrishiAI API Weather Proxy",
                lat,
                lon,
                weatherData: data
            });

        } catch (e) {
            console.error("[WeatherController] Proxy request crash:", e);
            return res.status(502).json({
                error: "Failed to load weather forecast. Weather proxy server failed to resolve coordinate metrics."
            });
        }
    }
};

module.exports = weatherController;
