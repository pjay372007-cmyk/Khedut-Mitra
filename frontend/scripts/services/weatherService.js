/**
 * KrishiAI - Weather Advisory Service
 * Coordinates request payloads to weather APIs and computes spraying suitability advisories.
 */

const WeatherService = {
    // Current cache of loaded weather details
    currentWeatherData: null,

    // Regional coordinate bounds for major Gujarat agricultural areas
    regions: {
        ahmedabad: { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
        rajkot:    { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
        surat:     { name: "Surat", lat: 21.1702, lon: 72.8311 },
        vadodara:  { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
        junagadh:  { name: "Junagadh", lat: 21.5204, lon: 70.4579 },
        bhuj:      { name: "Bhuj (Kutch)", lat: 23.2420, lon: 69.6669 },
        mehsana:   { name: "Mehsana", lat: 23.5880, lon: 72.3693 },
        anand:     { name: "Anand", lat: 22.5645, lon: 72.9289 }
    },

    /**
     * Fetches live meteorological metrics.
     * @param {string} regionKey - Key of target region
     * @param {boolean} updateDashboardOnly - Whether request is targeting dashboard card only
     * @param {Object} delegate - Parent app facade delegator
     */
    fetchLiveWeather(regionKey, updateDashboardOnly = false, delegate) {
        const region = this.regions[regionKey] || this.regions.rajkot;

        // Toggle load status spinners
        const loadingOverlay = document.getElementById('weather-loading');
        if (loadingOverlay && !updateDashboardOnly) {
            loadingOverlay.style.display = 'flex';
        }

                const backendUrl = `${(window.KrishiConstants && window.KrishiConstants.APP_CONFIG && window.KrishiConstants.APP_CONFIG.BACKEND_URL) ? window.KrishiConstants.APP_CONFIG.BACKEND_URL : 'http://localhost:5000/api'}/weather/forecast?lat=${region.lat}&lon=${region.lon}`;
        const fallbackUrl = `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code&timezone=auto`;

        return fetch(backendUrl)
            .then(res => {
                if (!res.ok) throw new Error("Backend weather proxy down");
                return res.json();
            })
            .then(json => json.weatherData)
            .catch(err => {
                console.warn("[WeatherService] Backend proxy failed, calling OpenMeteo directly:", err.message);
                return fetch(fallbackUrl).then(res => res.json());
            })
            .then(data => {
                this.currentWeatherData = data;
                if (delegate) delegate.currentWeatherData = data;

                const currentTemp = Math.round(data.current.temperature_2m);
                const currentHumidity = data.current.relative_humidity_2m;
                const currentWind = Math.round(data.current.wind_speed_10m);
                const currentCode = data.current.weather_code;
                const currentInfo = this.getWeatherInfoFromCode(currentCode);

                // 1. Synchronize Dashboard Widget Elements
                const dashTemp = document.getElementById('dash-weather-temp');
                const dashIcon = document.getElementById('dash-weather-icon');
                const dashDesc = document.getElementById('dash-weather-desc');
                const dashRegion = document.getElementById('dash-weather-region');
                const dashHumidity = document.getElementById('dash-weather-humidity');
                const dashWind = document.getElementById('dash-weather-wind');
                const dashSpray = document.getElementById('dash-spray-status');

                if (dashRegion) dashRegion.textContent = region.name;
                if (dashTemp) dashTemp.textContent = `${currentTemp}°C`;
                if (dashIcon) {
                    dashIcon.className = `fa-solid ${currentInfo.icon}`;
                    dashIcon.style.color = currentInfo.color;
                }
                if (dashHumidity) dashHumidity.textContent = `${currentHumidity}% Humidity`;
                if (dashWind) dashWind.textContent = `${currentWind} km/h Wind`;

                // Calculate spray parameters suitability
                let sprayStatus = 'Good';
                let sprayColor = '#34d399';
                if (currentCode >= 51 && currentCode <= 95) {
                    sprayStatus = 'Avoid Rain'; sprayColor = '#f87171';
                } else if (currentWind > 18) {
                    sprayStatus = 'Too Windy'; sprayColor = '#fbbf24';
                } else if (currentHumidity > 80) {
                    sprayStatus = 'High Humidity'; sprayColor = '#fbbf24';
                }
                if (dashSpray) {
                    dashSpray.textContent = `Spray: ${sprayStatus}`;
                    dashSpray.style.color = sprayColor;
                }

                let dashTip = `Mostly clear. Good time to fertilize fields.`;
                if (currentCode >= 51 && currentCode <= 67) {
                    dashTip = `Rainy weather. Hold pesticide spraying to avoid washing.`;
                } else if (currentCode >= 95) {
                    dashTip = `Thunderstorms. Avoid working in fields; keep livestock sheltered.`;
                } else if (currentTemp > 38) {
                    dashTip = `High heat alert. Irrigate early morning to prevent heat stress.`;
                }
                if (dashDesc) dashDesc.textContent = dashTip;

                if (updateDashboardOnly) return data;

                // 2. Synchronize Detailed Weather Screen Elements
                const tempEl = document.getElementById('weather-temp');
                const condEl = document.getElementById('weather-cond');
                const iconEl = document.getElementById('weather-icon');
                const humEl = document.getElementById('weather-humidity');
                const windEl = document.getElementById('weather-wind');
                const adviceEl = document.getElementById('weather-advice');

                if (tempEl) tempEl.textContent = `${currentTemp}°`;
                if (condEl) condEl.textContent = currentInfo.cond;
                if (iconEl) {
                    iconEl.className = `fa-solid ${currentInfo.icon}`;
                    iconEl.style.color = currentInfo.color;
                }
                if (humEl) humEl.textContent = `Humidity: ${currentHumidity}%`;
                if (windEl) windEl.textContent = `Wind: ${currentWind} km/h`;

                let detailsAdvice = "Good weather conditions for agricultural activities. Ensure proper watering according to your crop schedules.";
                if (currentCode >= 51 && currentCode <= 67) {
                    detailsAdvice = "Rain is expected. Avoid harvesting or spraying pesticides for the next 48 hours to prevent runoff. Ensure proper drainage.";
                } else if (currentCode >= 95) {
                    detailsAdvice = "Severe weather warning. Postpone all outdoor activities. Ensure farm animals are in secure, covered shelters.";
                } else if (currentTemp > 38) {
                    detailsAdvice = "Severe heat. Irrigate soil adequately. Consider light mulching to preserve moisture in vegetable crops.";
                } else if (currentCode >= 45 && currentCode <= 48) {
                    detailsAdvice = "Foggy conditions. Driving and visual activities restricted. Monitor crops for fungal buildup due to high moisture.";
                }
                if (adviceEl) adviceEl.textContent = detailsAdvice;

                // Render 7-day forecast cards
                const forecastList = document.getElementById('weather-forecast-list');
                if (forecastList) {
                    forecastList.innerHTML = '';
                    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                    data.daily.time.forEach((timeStr, index) => {
                        const date = new Date(timeStr);
                        const dayName = daysOfWeek[date.getDay()];
                        const dayNum = date.getDate();
                        const monthName = date.toLocaleString('en-US', { month: 'short' });
                        const displayDate = `${dayName} (${dayNum} ${monthName})`;

                        const codeVal = data.daily.weather_code[index];
                        const tempMax = Math.round(data.daily.temperature_2m_max[index]);
                        const tempMin = Math.round(data.daily.temperature_2m_min[index]);
                        const dailyInfo = this.getWeatherInfoFromCode(codeVal);

                        const isActive = index === 0 ? 'active' : '';

                        const item = document.createElement('div');
                        item.className = `forecast-item ${isActive}`;
                        item.setAttribute('onclick', `app.showHourlyForecast(${index})`);
                        item.innerHTML = `
                            <span class="f-day" style="font-weight: 600; min-width: 110px;">${displayDate}</span>
                            <i class="fa-solid ${dailyInfo.icon}" style="color: ${dailyInfo.color}; font-size: 20px; text-align: center; width: 30px;"></i>
                            <span class="f-temp" style="font-weight: 500;">${tempMax}°/${tempMin}°</span>
                        `;
                        forecastList.appendChild(item);
                    });
                }

                // Show default hourly index (0 = today)
                this.showHourlyForecast(0);
                return data;
            })
            .catch(err => {
                console.error("[WeatherService] Fetch error:", err);
                const condEl = document.getElementById('weather-cond');
                if (condEl) condEl.textContent = "Error loading weather data";
            })
            .finally(() => {
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }
            });
    },

    /**
     * Renders suitability metrics by hour for a selected calendar day.
     * @param {number} dayIndex - Selected day list offset
     */
    showHourlyForecast(dayIndex) {
        const data = this.currentWeatherData;
        if (!data || !data.hourly) return;

        const hourlyContainer = document.getElementById('hourly-forecast-section');
        const hourlyList = document.getElementById('weather-hourly-list');
        const hourlyDayLabel = document.getElementById('hourly-forecast-day');
        const hourlyBestTime = document.getElementById('hourly-best-time');

        if (!hourlyContainer || !hourlyList) return;

        // Toggle selected styling classes on target row nodes
        document.querySelectorAll('.forecast-item').forEach((item, idx) => {
            if (idx === dayIndex) {
                item.classList.add('selected', 'active');
            } else {
                item.classList.remove('selected', 'active');
            }
        });

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDateStr = data.daily.time[dayIndex];
        const date = new Date(selectedDateStr);
        const dayName = daysOfWeek[date.getDay()];
        const dayNum = date.getDate();
        const monthName = date.toLocaleString('en-US', { month: 'short' });

        let labelText = `${dayName}, ${dayNum} ${monthName}`;
        if (dayIndex === 0) labelText = `Today (${dayName})`;
        if (dayIndex === 1) labelText = `Tomorrow (${dayName})`;

        if (hourlyDayLabel) hourlyDayLabel.textContent = labelText;
        hourlyList.innerHTML = '';

        const hourlyIndices = [];
        data.hourly.time.forEach((timeStr, idx) => {
            if (timeStr.startsWith(selectedDateStr)) {
                hourlyIndices.push(idx);
            }
        });

        let optimalHours = [];
        let marginalHours = [];

        hourlyIndices.forEach(i => {
            const timeStr = data.hourly.time[i];
            const timePart = timeStr.split('T')[1];
            const hoursVal = parseInt(timePart.split(':')[0]);

            const ampm = hoursVal >= 12 ? 'PM' : 'AM';
            let displayHour = hoursVal % 12;
            displayHour = displayHour ? displayHour : 12;
            const displayTime = `${displayHour} ${ampm}`;

            const temp = Math.round(data.hourly.temperature_2m[i]);
            const rainProb = data.hourly.precipitation_probability[i];
            const wind = Math.round(data.hourly.wind_speed_10m[i]);
            const code = data.hourly.weather_code[i];
            const info = this.getWeatherInfoFromCode(code);

            let statusText = 'Optimal';
            let statusClass = 'status-good';
            const isDaylight = hoursVal >= 6 && hoursVal <= 18;

            if (rainProb >= 40) {
                statusText = 'Avoid (Rain)';
                statusClass = 'status-avoid';
            } else if (wind >= 18) {
                statusText = 'Avoid (Windy)';
                statusClass = 'status-avoid';
            } else if (rainProb < 15 && wind < 12) {
                statusText = 'Optimal';
                statusClass = 'status-good';
                if (isDaylight) optimalHours.push(hoursVal);
            } else {
                statusText = 'Marginal';
                statusClass = 'status-warning';
                if (isDaylight) marginalHours.push(hoursVal);
            }

            const item = document.createElement('div');
            item.className = 'hourly-item';

            const currentHour = new Date().getHours();
            if (dayIndex === 0 && hoursVal === currentHour) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <span class="hourly-time">${displayTime}</span>
                <i class="fa-solid ${info.icon} hourly-icon" style="color: ${info.color}"></i>
                <span class="hourly-temp">${temp}°C</span>
                <span class="hourly-rain"><i class="fa-solid fa-droplet" style="font-size:8px;"></i> ${rainProb}%</span>
                <span class="hourly-wind"><i class="fa-solid fa-wind" style="font-size:8px;"></i> ${wind} km/h</span>
                <span class="hourly-status ${statusClass}">${statusText}</span>
            `;
            hourlyList.appendChild(item);
        });

        // Compute spray window output guidelines text
        let bestWindowText = 'Avoid Spraying Today';
        if (optimalHours.length > 0) {
            const minHour = Math.min(...optimalHours);
            const maxHour = Math.max(...optimalHours);
            bestWindowText = `Spray Window: ${formatHour(minHour)} - ${formatHour(maxHour + 1)}`;
        } else if (marginalHours.length > 0) {
            const minHour = Math.min(...marginalHours);
            const maxHour = Math.max(...marginalHours);
            bestWindowText = `Marginal Spray: ${formatHour(minHour)} - ${formatHour(maxHour + 1)}`;
        }

        if (hourlyBestTime) {
            hourlyBestTime.textContent = bestWindowText;
            if (optimalHours.length > 0) {
                hourlyBestTime.style.background = 'rgba(15, 125, 62, 0.1)';
                hourlyBestTime.style.color = 'var(--primary)';
            } else if (marginalHours.length > 0) {
                hourlyBestTime.style.background = 'rgba(217, 119, 6, 0.1)';
                hourlyBestTime.style.color = '#D97706';
            } else {
                hourlyBestTime.style.background = 'rgba(239, 68, 68, 0.1)';
                hourlyBestTime.style.color = '#EF4444';
            }
        }

        hourlyContainer.style.display = 'block';

        function formatHour(h) {
            const ampm = h >= 12 ? 'PM' : 'AM';
            let formattedH = h % 12;
            formattedH = formattedH ? formattedH : 12;
            return `${formattedH} ${ampm}`;
        }
    },

    /**
     * Maps WMO weather code digits to descriptive weather state structures.
     * @param {number} code - WMO weather state code
     */
    getWeatherInfoFromCode(code) {
        if (code === 0) return { cond: "Clear Sky", icon: "fa-sun", color: "#f59e0b" };
        if ([1, 2, 3].includes(code)) return { cond: "Partly Cloudy", icon: "fa-cloud-sun", color: "#6b7280" };
        if ([45, 48].includes(code)) return { cond: "Foggy", icon: "fa-smog", color: "#9ca3af" };
        if ([51, 53, 55, 56, 57].includes(code)) return { cond: "Drizzle", icon: "fa-cloud-rain", color: "#3b82f6" };
        if ([61, 63, 65, 66, 67].includes(code)) return { cond: "Rainy", icon: "fa-cloud-showers-heavy", color: "#2563eb" };
        if ([71, 73, 75, 77].includes(code)) return { cond: "Snowy", icon: "fa-snowflake", color: "#93c5fd" };
        if ([80, 81, 82].includes(code)) return { cond: "Showers", icon: "fa-cloud-showers-water", color: "#1d4ed8" };
        if ([85, 86].includes(code)) return { cond: "Snow Showers", icon: "fa-snowflake", color: "#60a5fa" };
        if (code >= 95) return { cond: "Thunderstorm", icon: "fa-cloud-bolt", color: "#4b5563" };
        return { cond: "Overcast", icon: "fa-cloud", color: "#4b5563" };
    }
};

// Export globally
window.WeatherService = WeatherService;
