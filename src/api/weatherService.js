/**
 * KisanMandi Real-Time Weather Service
 * Connects to Open-Meteo free live API (no API key required)
 * Provides real-time weather and 7-day agricultural forecasts for Sindh districts
 */

export const SINDH_DISTRICT_COORDS = {
  'Hyderabad': { lat: 25.3960, lon: 68.3578, name: 'Hyderabad' },
  'Karachi': { lat: 24.8607, lon: 67.0011, name: 'Karachi' },
  'Sukkur': { lat: 27.7052, lon: 68.8574, name: 'Sukkur' },
  'Mirpur Khas': { lat: 25.5276, lon: 69.0159, name: 'Mirpur Khas' },
  'Larkana': { lat: 27.5590, lon: 68.2120, name: 'Larkana' },
  'Shaheed Benazirabad (Nawabshah)': { lat: 26.2483, lon: 68.4096, name: 'Nawabshah' },
  'Nawabshah': { lat: 26.2483, lon: 68.4096, name: 'Nawabshah' },
  'Badin': { lat: 24.6560, lon: 68.8370, name: 'Badin' },
  'Khairpur': { lat: 27.5295, lon: 68.7592, name: 'Khairpur' },
  'Matiari': { lat: 25.5971, lon: 68.4467, name: 'Matiari' },
  'Tando Allahyar': { lat: 25.4605, lon: 68.7176, name: 'Tando Allahyar' },
  'Tando Muhammad Khan': { lat: 25.1238, lon: 68.5368, name: 'Tando Muhammad Khan' },
  'Dadu': { lat: 26.7329, lon: 67.7769, name: 'Dadu' },
  'Thatta': { lat: 24.7475, lon: 67.9236, name: 'Thatta' },
  'Ghotki': { lat: 28.0060, lon: 69.3161, name: 'Ghotki' },
  'Sanghar': { lat: 26.0466, lon: 68.9482, name: 'Sanghar' },
  'Shikarpur': { lat: 27.9556, lon: 68.6382, name: 'Shikarpur' },
  'Jacobabad': { lat: 28.2835, lon: 68.4388, name: 'Jacobabad' },
  'Umerkot': { lat: 25.3616, lon: 69.7362, name: 'Umerkot' },
  'Tharparkar': { lat: 24.7438, lon: 69.8000, name: 'Tharparkar' }
};

export const DEFAULT_DISTRICT = 'Hyderabad';

/**
 * Interpret WMO Weather Code
 */
export function getWeatherCondition(code, humidity = 40) {
  switch (code) {
    case 0:
      return {
        label: 'Clear Sky',
        condition: humidity > 60 ? 'Sunny - Humidity' : 'Sunny',
        icon: 'sun'
      };
    case 1:
      return {
        label: 'Mainly Clear',
        condition: humidity > 60 ? 'Sunny - Humidity' : 'Sunny',
        icon: 'sun'
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        condition: 'Semicloudy',
        icon: 'cloud-sun'
      };
    case 3:
      return {
        label: 'Overcast',
        condition: 'Cloudy',
        icon: 'cloud'
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        condition: 'Foggy',
        icon: 'cloud-fog'
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Light Drizzle',
        condition: 'Rainy cloudy',
        icon: 'cloud-drizzle'
      };
    case 61:
    case 63:
    case 65:
      return {
        label: 'Rain',
        condition: 'Rainy - Cloudy',
        icon: 'cloud-rain'
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        condition: 'Rainy cloudy',
        icon: 'cloud-rain'
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Thunderstorm',
        condition: 'Thunderstorm',
        icon: 'cloud-lightning'
      };
    default:
      return {
        label: 'Sunny',
        condition: 'Sunny',
        icon: 'sun'
      };
  }
}

/**
 * Format a Date object to "25 June" style (day and short month)
 */
export function formatDayMonth(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `${day} ${month}`;
}

/**
 * Format weekday and full date
 */
export function formatFullDay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format time string e.g. "2026-10-22T06:14" to "6:14 AM"
 */
function formatTime(isoStr) {
  if (!isoStr) return '--:--';
  const date = new Date(isoStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Generate farming advisories based on meteorological metrics
 */
export function calculateAgriAdvisory(current, todayDaily) {
  const wind = current.wind_speed_10m || 0;
  const rainProb = todayDaily?.precipitation_probability_max?.[0] || 0;
  const humidity = current.relative_humidity_2m || 0;
  const temp = current.temperature_2m || 30;

  let sprayStatus = 'Optimal';
  let sprayBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let sprayAdvice = 'Low wind speed and zero rain probability. Safe for chemical spraying.';
  if (wind > 15) {
    sprayStatus = 'Caution';
    sprayBadgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    sprayAdvice = `Wind speed is ${Math.round(wind)} km/h. High drift risk; spray early morning.`;
  }
  if (rainProb > 40) {
    sprayStatus = 'Avoid';
    sprayBadgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    sprayAdvice = `Rain probability is ${rainProb}%. Spray will wash off; delay application.`;
  }

  let harvestStatus = 'Excellent';
  let harvestBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let harvestAdvice = 'Dry conditions and favorable sunshine. Excellent for harvesting and threshing.';
  if (rainProb > 30 || humidity > 75) {
    harvestStatus = 'Caution';
    harvestBadgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    harvestAdvice = 'Higher moisture levels. Ensure harvested produce is covered or dried.';
  }

  let irrigationStatus = 'Normal';
  let irrigationAdvice = 'Maintain routine field watering schedule.';
  if (temp > 38 && humidity < 35) {
    irrigationStatus = 'High Need';
    irrigationAdvice = 'High evapotranspiration due to heat. Provide light evening irrigation.';
  } else if (rainProb > 60) {
    irrigationStatus = 'Postpone';
    irrigationAdvice = 'Substantial rain chance. Hold off irrigation to prevent waterlogging.';
  }

  return {
    spray: { status: sprayStatus, badgeColor: sprayBadgeColor, advice: sprayAdvice },
    harvest: { status: harvestStatus, badgeColor: harvestBadgeColor, advice: harvestAdvice },
    irrigation: { status: irrigationStatus, advice: irrigationAdvice }
  };
}

/**
 * Fetch real-time weather from Open-Meteo
 */
export async function getRealTimeWeather(districtOrCoords) {
  let lat = 25.3960;
  let lon = 68.3578;
  let districtName = DEFAULT_DISTRICT;

  if (typeof districtOrCoords === 'string') {
    const match = SINDH_DISTRICT_COORDS[districtOrCoords] ||
      Object.values(SINDH_DISTRICT_COORDS).find(d =>
        d.name.toLowerCase() === districtOrCoords.toLowerCase()
      );
    if (match) {
      lat = match.lat;
      lon = match.lon;
      districtName = match.name;
    } else {
      districtName = districtOrCoords;
    }
  } else if (districtOrCoords && typeof districtOrCoords === 'object') {
    if (districtOrCoords.lat && districtOrCoords.lon) {
      lat = districtOrCoords.lat;
      lon = districtOrCoords.lon;
      districtName = districtOrCoords.name || 'Current Location';
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather service returned HTTP ${res.status}`);
    }
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    const currentCondition = getWeatherCondition(
      current.weather_code,
      current.relative_humidity_2m
    );

    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // 4-day forecast for the 2x2 grid (days 1 through 4)
    const forecastDays = [];
    if (daily && daily.time) {
      for (let i = 1; i <= 4 && i < daily.time.length; i++) {
        const cond = getWeatherCondition(daily.weather_code[i], 50);
        forecastDays.push({
          date: formatDayMonth(daily.time[i]),
          fullDate: formatFullDay(daily.time[i]),
          temp: `${Math.round(daily.temperature_2m_max[i])}°`,
          minTemp: `${Math.round(daily.temperature_2m_min[i])}°`,
          condition: cond.condition,
          label: cond.label,
          icon: cond.icon,
          rainProb: daily.precipitation_probability_max?.[i] || 0,
          weatherCode: daily.weather_code[i]
        });
      }
    }

    // 7-day extended forecast for full weather page
    const sevenDayForecast = [];
    if (daily && daily.time) {
      for (let i = 0; i < 7 && i < daily.time.length; i++) {
        const cond = getWeatherCondition(daily.weather_code[i], 50);
        sevenDayForecast.push({
          dateStr: daily.time[i],
          dayName: i === 0 ? 'Today' : new Date(daily.time[i] + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
          formattedDate: formatDayMonth(daily.time[i]),
          maxTemp: Math.round(daily.temperature_2m_max[i]),
          minTemp: Math.round(daily.temperature_2m_min[i]),
          condition: cond.condition,
          label: cond.label,
          icon: cond.icon,
          rainProb: daily.precipitation_probability_max?.[i] || 0,
          uvIndex: daily.uv_index_max?.[i] || 6
        });
      }
    }

    // Next 24 hours hourly
    const hourlyData = [];
    if (hourly && hourly.time) {
      const currentIsoHour = new Date().toISOString().slice(0, 13);
      let startIndex = hourly.time.findIndex(t => t.startsWith(currentIsoHour));
      if (startIndex === -1) startIndex = 0;
      for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
        const hTime = hourly.time[i];
        const hHour = new Date(hTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true
        });
        const cond = getWeatherCondition(hourly.weather_code[i]);
        hourlyData.push({
          time: hHour,
          temp: Math.round(hourly.temperature_2m[i]),
          humidity: hourly.relative_humidity_2m[i],
          condition: cond.condition,
          icon: cond.icon,
          rainProb: hourly.precipitation_probability?.[i] || 0
        });
      }
    }

    const agriAdvisory = calculateAgriAdvisory(current, daily);

    return {
      success: true,
      district: districtName,
      coordinates: { lat, lon },
      lastUpdated: nowTime,
      today: {
        temp: Math.round(current.temperature_2m),
        tempFormatted: `${Math.round(current.temperature_2m)}°`,
        minTemp: Math.round(daily.temperature_2m_min[0]),
        maxTemp: Math.round(daily.temperature_2m_max[0]),
        highLowFormatted: `${Math.round(daily.temperature_2m_max[0])}° /${Math.round(daily.temperature_2m_min[0])}°`,
        condition: currentCondition.condition,
        label: currentCondition.label,
        icon: currentCondition.icon,
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        pressure: Math.round(current.surface_pressure),
        uvIndex: daily.uv_index_max?.[0] ?? 6,
        rainProb: daily.precipitation_probability_max?.[0] ?? 0,
        sunrise: formatTime(daily.sunrise?.[0]),
        sunset: formatTime(daily.sunset?.[0]),
        isDay: current.is_day === 1
      },
      forecastDays,
      sevenDayForecast,
      hourly: hourlyData,
      agriAdvisory
    };
  } catch (err) {
    console.warn('Real-time weather API error, falling back to cached local model:', err);
    return getFallbackWeather(districtName);
  }
}

/**
 * Fallback generator when offline
 */
export function getFallbackWeather(districtName = 'Hyderabad') {
  const today = new Date();
  const formatDay = (offset) => {
    const d = new Date();
    d.setDate(today.getDate() + offset);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`
    };
  };

  const f1 = formatDay(1);
  const f2 = formatDay(2);
  const f3 = formatDay(3);
  const f4 = formatDay(4);

  return {
    success: false,
    district: districtName,
    coordinates: { lat: 25.3960, lon: 68.3578 },
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    isFallback: true,
    today: {
      temp: 37,
      tempFormatted: '37°',
      minTemp: 23,
      maxTemp: 37,
      highLowFormatted: '37° /23°',
      condition: 'Rainy - Cloudy',
      label: 'Rainy - Cloudy',
      icon: 'cloud-rain',
      feelsLike: 39,
      humidity: 58,
      windSpeed: 12,
      pressure: 1012,
      uvIndex: 7,
      rainProb: 35,
      sunrise: '06:18 AM',
      sunset: '06:05 PM',
      isDay: true
    },
    forecastDays: [
      { date: f1.formattedDate, temp: '29°', minTemp: '21°', condition: 'Thunderstorm', label: 'Thunderstorm', icon: 'cloud-lightning', rainProb: 70 },
      { date: f2.formattedDate, temp: '32°', minTemp: '23°', condition: 'Rainy cloudy', label: 'Rainy cloudy', icon: 'cloud-drizzle', rainProb: 45 },
      { date: f3.formattedDate, temp: '39°', minTemp: '25°', condition: 'Semicloudy', label: 'Semicloudy', icon: 'cloud-sun', rainProb: 10 },
      { date: f4.formattedDate, temp: '42°', minTemp: '26°', condition: 'Sunny - Humidity', label: 'Sunny - Humidity', icon: 'sun', rainProb: 5 }
    ],
    sevenDayForecast: [
      { dayName: 'Today', formattedDate: formatDay(0).formattedDate, maxTemp: 37, minTemp: 23, condition: 'Rainy - Cloudy', label: 'Rainy - Cloudy', rainProb: 35 },
      { dayName: f1.dayName, formattedDate: f1.formattedDate, maxTemp: 29, minTemp: 21, condition: 'Thunderstorm', label: 'Thunderstorm', rainProb: 70 },
      { dayName: f2.dayName, formattedDate: f2.formattedDate, maxTemp: 32, minTemp: 23, condition: 'Rainy cloudy', label: 'Rainy cloudy', rainProb: 45 },
      { dayName: f3.dayName, formattedDate: f3.formattedDate, maxTemp: 39, minTemp: 25, condition: 'Semicloudy', label: 'Semicloudy', rainProb: 10 },
      { dayName: f4.dayName, formattedDate: f4.formattedDate, maxTemp: 42, minTemp: 26, condition: 'Sunny - Humidity', label: 'Sunny - Humidity', rainProb: 5 }
    ],
    hourly: [],
    agriAdvisory: {
      spray: { status: 'Caution', badgeColor: 'bg-amber-100 text-amber-800', advice: 'Moderate rain probability. Hold off spraying till tomorrow.' },
      harvest: { status: 'Caution', badgeColor: 'bg-amber-100 text-amber-800', advice: 'High humidity; protect harvested grain from damp ground.' },
      irrigation: { status: 'Normal', advice: 'Sufficient moisture in soil.' }
    }
  };
}

export const weatherService = {
  getRealTimeWeather,
  getFallbackWeather,
  SINDH_DISTRICT_COORDS,
  DEFAULT_DISTRICT
};

export default weatherService;
