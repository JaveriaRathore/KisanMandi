import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getRealTimeWeather,
  SINDH_DISTRICT_COORDS,
  DEFAULT_DISTRICT
} from '../api/weatherService';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  Sunrise,
  Sunset,
  RefreshCw,
  MapPin,
  Navigation,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sprout
} from 'lucide-react';

export const WeatherPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const userDistrict = currentUser?.district || DEFAULT_DISTRICT;
  const [selectedDistrict, setSelectedDistrict] = useState(userDistrict);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [isUsingGps, setIsUsingGps] = useState(false);

  // Load weather
  const loadWeather = useCallback(async (target, isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const data = await getRealTimeWeather(target);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedDistrict);
  }, [selectedDistrict, loadWeather]);

  // Handle GPS Auto-detect
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsUsingGps(true);
        loadWeather({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: 'My GPS Location'
        });
      },
      (err) => {
        setIsLoading(false);
        setGeoError('Unable to retrieve your location: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Weather Icon helper
  const renderWeatherIcon = (iconType, className = 'w-6 h-6') => {
    switch (iconType) {
      case 'sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'cloud-sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'cloud':
        return <Cloud className={`${className} text-slate-400`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-sky-500`} />;
      case 'cloud-drizzle':
        return <CloudDrizzle className={`${className} text-sky-400`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-amber-500`} />;
      case 'cloud-fog':
        return <CloudFog className={`${className} text-slate-400`} />;
      default:
        return <Sun className={`${className} text-amber-500`} />;
    }
  };

  const today = weatherData?.today;
  const advisory = weatherData?.agriAdvisory;
  const forecastDays = weatherData?.sevenDayForecast || [];
  const hourly = weatherData?.hourly || [];

  return (
    <div className="space-y-5 font-sans pb-10">
      {/* Top Bar: Back to Dashboard & Live status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EDF2EA] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#1E231F] tracking-tight">
                Sindh Weather Forecast
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-[#6E7570]">
              Real-time meteorological & agricultural weather intelligence
            </p>
          </div>
        </div>

        {/* Location selector & GPS */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:flex-initial">
            <MapPin className="w-3.5 h-3.5 text-[#1E231F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={isUsingGps ? '' : selectedDistrict}
              onChange={(e) => {
                setIsUsingGps(false);
                setSelectedDistrict(e.target.value);
              }}
              className="pl-8 pr-8 py-1.5 bg-[#EDF2EA] hover:bg-[#e4ece0] text-xs font-bold text-[#1E231F] rounded-xl border-none focus:ring-2 focus:ring-[#DEF768] cursor-pointer appearance-none transition-colors"
            >
              {isUsingGps && <option value="">My GPS Location</option>}
              {Object.keys(SINDH_DISTRICT_COORDS).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUseGps}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isUsingGps
                ? 'bg-[#DEF768] text-[#1E231F] border-[#DEF768]'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Auto-detect current GPS location"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GPS</span>
          </button>

          <button
            onClick={() => loadWeather(isUsingGps ? weatherData?.coordinates : selectedDistrict, true)}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors disabled:opacity-50"
            title="Refresh weather data now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {geoError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>{geoError}</span>
          <button onClick={() => setGeoError(null)} className="text-amber-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Popular Districts Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 mr-1">
          Districts:
        </span>
        {['Hyderabad', 'Sukkur', 'Karachi', 'Mirpur Khas', 'Larkana', 'Nawabshah', 'Badin'].map((dist) => (
          <button
            key={dist}
            onClick={() => {
              setIsUsingGps(false);
              setSelectedDistrict(dist);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              !isUsingGps && selectedDistrict === dist
                ? 'bg-[#1E231F] text-[#DEF768] shadow-sm'
                : 'bg-white hover:bg-slate-100 text-[#516155] border border-[#EDF2EA]'
            }`}
          >
            {dist}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-3xl border border-[#EDF2EA] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-600">Fetching real-time weather...</p>
        </div>
      ) : today ? (
        <>
          {/* Main Hero Weather Card matching mockup palette */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#D7EEDC] border border-[#C8E7CF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              {/* Left Column: Big Temperature & Condition */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1E231F] text-[#DEF768] text-[10px] font-bold uppercase tracking-wider">
                    {weatherData.district}
                  </span>
                  <span className="text-xs text-[#516155] font-semibold">
                    Updated {weatherData.lastUpdated}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-5xl sm:text-6xl font-black text-[#1E231F] tracking-tight">
                    {today.tempFormatted}
                  </span>
                  <div className="text-sm sm:text-base font-bold text-[#516155]">
                    <span>{today.highLowFormatted}</span>
                    <span className="block text-xs font-medium text-[#637066]">
                      Feels like {today.feelsLike}°
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-lg sm:text-xl font-bold text-[#1E231F]">
                    {today.condition}
                  </span>
                  <span className="text-xs text-[#516155] font-medium">
                    • {today.label}
                  </span>
                </div>
              </div>

              {/* Right Column: 3D Thermometer + Sun Graphic & Key Quick Stats */}
              <div className="flex items-center gap-6 sm:gap-8 self-center md:self-auto">
                {/* 3D Thermometer + Sun Visual matching dashboard card */}
                <div className="flex items-center shrink-0">
                  <svg width="28" height="54" viewBox="0 0 22 42" fill="none">
                    <rect x="7" y="2" width="8" height="30" rx="4" fill="#FFFFFF" fillOpacity="0.9" stroke="#BFD7C4" strokeWidth="1.2" />
                    <circle cx="11" cy="33" r="7" fill="#FFFFFF" fillOpacity="0.9" stroke="#BFD7C4" strokeWidth="1.2" />
                    <rect x="9" y="12" width="4" height="21" rx="2" fill="#EF4444" />
                    <circle cx="11" cy="33" r="5" fill="#EF4444" />
                    <line x1="13" y1="8" x2="15" y2="8" stroke="#8CA392" strokeWidth="1" strokeLinecap="round" />
                    <line x1="13" y1="12" x2="15" y2="12" stroke="#8CA392" strokeWidth="1" strokeLinecap="round" />
                    <line x1="13" y1="16" x2="15" y2="16" stroke="#8CA392" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  <svg width="36" height="36" viewBox="0 0 28 28" fill="none" className="-ml-2 -mt-4 animate-[spin_20s_linear_infinite]">
                    <circle cx="14" cy="14" r="6" fill="#F59E0B" />
                    <g stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="14" y1="2" x2="14" y2="5" />
                      <line x1="14" y1="23" x2="14" y2="26" />
                      <line x1="2" y1="14" x2="5" y2="14" />
                      <line x1="23" y1="14" x2="26" y2="14" />
                      <line x1="5.5" y1="5.5" x2="7.5" y2="7.5" />
                      <line x1="20.5" y1="20.5" x2="22.5" y2="22.5" />
                      <line x1="5.5" y1="22.5" x2="7.5" y2="20.5" />
                      <line x1="20.5" y1="7.5" x2="22.5" y2="5.5" />
                    </g>
                  </svg>
                </div>

                {/* Quick 2x2 mini stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/70 backdrop-blur-sm p-2.5 rounded-xl border border-white/80">
                    <span className="text-[10px] text-slate-500 block font-medium">Humidity</span>
                    <span className="text-sm font-extrabold text-[#1E231F]">{today.humidity}%</span>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm p-2.5 rounded-xl border border-white/80">
                    <span className="text-[10px] text-slate-500 block font-medium">Wind</span>
                    <span className="text-sm font-extrabold text-[#1E231F]">{today.windSpeed} km/h</span>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm p-2.5 rounded-xl border border-white/80">
                    <span className="text-[10px] text-slate-500 block font-medium">Rain Chance</span>
                    <span className="text-sm font-extrabold text-[#1E231F]">{today.rainProb}%</span>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm p-2.5 rounded-xl border border-white/80">
                    <span className="text-[10px] text-slate-500 block font-medium">UV Index</span>
                    <span className="text-sm font-extrabold text-[#1E231F]">{today.uvIndex} Max</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Kisan Agri-Advisory Section */}
          {advisory && (
            <div className="bg-white rounded-3xl p-5 border border-[#EDF2EA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-[#1E231F] tracking-tight">
                  Kisan Field Advisory (Sindh Agriculture Guidance)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Harvesting Status */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Harvesting Window</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${advisory.harvest.badgeColor}`}>
                      {advisory.harvest.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {advisory.harvest.advice}
                  </p>
                </div>

                {/* 2. Spraying Status */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Spraying & Fertilizing</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${advisory.spray.badgeColor}`}>
                      {advisory.spray.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {advisory.spray.advice}
                  </p>
                </div>

                {/* 3. Irrigation Status */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Irrigation Scheduling</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-sky-50 text-sky-800 border-sky-200">
                      {advisory.irrigation.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {advisory.irrigation.advice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 24-Hour Hourly Forecast */}
          {hourly.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-[#EDF2EA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <h2 className="text-sm font-bold text-[#1E231F] tracking-tight">
                    Hourly Forecast (Next 24 Hours)
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Scroll for timeline →
                </span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {hourly.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-between p-3 rounded-2xl bg-[#F7FAF6] border border-[#EDF2EA] min-w-[76px] h-28 shrink-0 hover:border-slate-300 transition-colors"
                  >
                    <span className="text-[11px] font-semibold text-slate-600">{h.time}</span>
                    <div className="my-1">{renderWeatherIcon(h.icon, 'w-5 h-5')}</div>
                    <span className="text-sm font-black text-[#1E231F]">{h.temp}°</span>
                    {h.rainProb > 0 ? (
                      <span className="text-[9px] font-bold text-sky-600">{h.rainProb}% rain</span>
                    ) : (
                      <span className="text-[9px] font-medium text-slate-400">0% rain</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Extended Forecast */}
          <div className="bg-white rounded-3xl p-5 border border-[#EDF2EA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-[#1E231F] tracking-tight">
                7-Day Extended Agricultural Forecast
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {forecastDays.map((day, idx) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  {/* Day & Date */}
                  <div className="w-24 sm:w-28 shrink-0">
                    <span className="text-xs font-bold text-[#1E231F] block">
                      {day.dayName}
                    </span>
                    <span className="text-[10px] text-[#9AA19C] block">
                      {day.formattedDate}
                    </span>
                  </div>

                  {/* Weather Icon & Condition */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {renderWeatherIcon(day.icon, 'w-5 h-5 shrink-0')}
                    <div className="truncate">
                      <span className="text-xs font-bold text-[#1E231F] block truncate">
                        {day.condition}
                      </span>
                      {day.rainProb > 0 && (
                        <span className="text-[10px] text-sky-600 font-semibold block">
                          {day.rainProb}% precipitation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* High / Low Temp Bar */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 font-semibold w-8 text-right">
                      {day.minTemp}°
                    </span>
                    <div className="hidden sm:block w-24 h-1.5 bg-[#EDF2EA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#DEF768] to-[#10A349] rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(30, (day.maxTemp / 48) * 100))}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-extrabold text-[#1E231F] w-9 text-right">
                      {day.maxTemp}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-[#EDF2EA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                <span>Sunrise</span>
              </div>
              <div className="text-base font-black text-[#1E231F]">{today.sunrise}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#EDF2EA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                <Sunset className="w-3.5 h-3.5 text-orange-500" />
                <span>Sunset</span>
              </div>
              <div className="text-base font-black text-[#1E231F]">{today.sunset}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#EDF2EA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pressure</span>
              </div>
              <div className="text-base font-black text-[#1E231F]">{today.pressure} hPa</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#EDF2EA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                <span>Humidity</span>
              </div>
              <div className="text-base font-black text-[#1E231F]">{today.humidity}%</div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default WeatherPage;
