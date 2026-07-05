import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { MapPin, Navigation, Compass, AlertCircle, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import BackButton from '../components/BackButton';

const RoutePlanner = () => {
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR_PETROL');
  const [searching, setSearching] = useState(false);
  const [logging, setLogging] = useState(false);

  const [routeDetails, setRouteDetails] = useState(null);
  const [carbonResult, setCarbonResult] = useState(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);

  const vehicles = [
    { value: 'CAR_PETROL', label: 'Petrol/Gasoline Car 🚗' },
    { value: 'CAR_DIESEL', label: 'Diesel Car 🚙' },
    { value: 'CAR_ELECTRIC', label: 'Electric Vehicle (EV) ⚡' },
    { value: 'BUS', label: 'Bus Transit 🚌' },
    { value: 'TRAIN', label: 'Train Transit 🚆' },
    { value: 'WALK', label: 'Bicycle / Walking 🚲' }
  ];

  useEffect(() => {
    if (window.L && !mapRef.current) {
      const L = window.L;
      const map = L.map('route-map').setView([20.5937, 78.9629], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      mapRef.current = map;
      setMapLoaded(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (routeDetails) {
      const factors = {
        CAR_PETROL: 0.18,
        CAR_DIESEL: 0.17,
        CAR_ELECTRIC: 0.05,
        BUS: 0.08,
        TRAIN: 0.04,
        WALK: 0.0
      };
      const computedCarbon = routeDetails.distance * factors[vehicleType];
      setCarbonResult(parseFloat(computedCarbon.toFixed(2)));
    }
  }, [vehicleType, routeDetails]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!fromLoc.trim() || !toLoc.trim()) {
      toast.warn('Please fill in both Origin and Destination');
      return;
    }

    setSearching(true);
    try {
      const fromUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(fromLoc)}`;
      const fromRes = await fetch(fromUrl);
      const fromData = await fromRes.json();
      if (fromData.length === 0) {
        toast.error(`Origin location not found: "${fromLoc}"`);
        setSearching(false);
        return;
      }
      const startCoord = {
        lat: parseFloat(fromData[0].lat),
        lon: parseFloat(fromData[0].lon),
        name: fromData[0].display_name
      };

      const toUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(toLoc)}`;
      const toRes = await fetch(toUrl);
      const toData = await toRes.json();
      if (toData.length === 0) {
        toast.error(`Destination location not found: "${toLoc}"`);
        setSearching(false);
        return;
      }
      const endCoord = {
        lat: parseFloat(toData[0].lat),
        lon: parseFloat(toData[0].lon),
        name: toData[0].display_name
      };

      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord.lon},${startCoord.lat};${endCoord.lon},${endCoord.lat}?overview=full&geometries=geojson`;
      const routeRes = await fetch(routeUrl);
      const routeData = await routeRes.json();

      if (routeData.code !== 'Ok' || routeData.routes.length === 0) {
        toast.error('Could not compute a routing path between those locations.');
        setSearching(false);
        return;
      }

      const route = routeData.routes[0];
      const distance = route.distance / 1000; 
      const duration = route.duration / 60; 

      setRouteDetails({
        distance: parseFloat(distance.toFixed(1)),
        duration: Math.round(duration),
        startName: startCoord.name,
        endName: endCoord.name
      });

      if (mapRef.current && window.L) {
        const L = window.L;
        const map = mapRef.current;
        map.invalidateSize();

        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
        }

        const startMarker = L.marker([startCoord.lat, startCoord.lon]).addTo(map)
          .bindPopup(`<b>Start:</b> ${fromLoc}`);
        const endMarker = L.marker([endCoord.lat, endCoord.lon]).addTo(map)
          .bindPopup(`<b>Destination:</b> ${toLoc}`);

        markersRef.current.push(startMarker, endMarker);

        const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        const polyline = L.polyline(latLngs, { color: '#2E7D32', weight: 6, opacity: 0.85 }).addTo(map);
        routeLayerRef.current = polyline;

        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }

    } catch (err) {
      console.error(err);
      toast.error('Failed to compute route planner details');
    } finally {
      setSearching(false);
    }
  };

  const handleLogActivity = async () => {
    if (!routeDetails || carbonResult === null) return;
    if (vehicleType === 'WALK') {
      toast.info("Cycling and walking are zero-emission options! You don't need to record a footprint.");
      return;
    }

    setLogging(true);
    try {
      const payload = {
        category: 'TRANSPORT',
        activityType: vehicleType,
        quantity: routeDetails.distance,
        unit: 'km'
      };

      const response = await api.post('/api/activities', payload);
      if (response.data.success) {
        toast.success(`Logged ${routeDetails.distance} km journey to your carbon history!`);
      }
    } catch (err) {
      toast.error('Could not log trip activity.');
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const getAlternates = () => {
    if (!routeDetails) return [];
    const factors = {
      CAR_PETROL: 0.18,
      CAR_DIESEL: 0.17,
      CAR_ELECTRIC: 0.05,
      BUS: 0.08,
      TRAIN: 0.04,
      WALK: 0.0
    };

    const currentEmission = routeDetails.distance * factors[vehicleType];

    return Object.keys(factors)
      .filter(key => key !== vehicleType)
      .map(key => {
        const altEmission = routeDetails.distance * factors[key];
        const diff = currentEmission - altEmission;
        
        let label = '';
        if (key === 'CAR_PETROL') label = 'Petrol Car 🚗';
        else if (key === 'CAR_DIESEL') label = 'Diesel Car 🚙';
        else if (key === 'CAR_ELECTRIC') label = 'Electric Vehicle ⚡';
        else if (key === 'BUS') label = 'Bus Transit 🚌';
        else if (key === 'TRAIN') label = 'Train Transit 🚆';
        else if (key === 'WALK') label = 'Bicycle / Walk 🚲';

        return {
          vehicle: label,
          emissions: parseFloat(altEmission.toFixed(2)),
          savings: parseFloat(diff.toFixed(2))
        };
      });
  };

  const alternates = getAlternates();

  return (
    <>
      <BackButton />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2 text-slate-800 uppercase">
            <Navigation className="text-primary-500 animate-pulse" />
            <span>Route Carbon Planner</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Search for the shortest route, visualize it on Leaflet, estimate vehicle emissions, and discover ecological alternatives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Controls & Analytics */}
          <div className="lg:col-span-1 space-y-6">
            {/* SEARCH CARD */}
            <div className="bg-white border border-borderEco p-6 rounded-3xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center space-x-2 text-slate-800">
                <Compass size={18} className="text-primary-500" />
                <span>Route Plan</span>
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Origin (From)
                  </label>
                  <input
                    type="text"
                    value={fromLoc}
                    onChange={(e) => setFromLoc(e.target.value)}
                    placeholder="e.g. New York or Paris"
                    className="w-full px-4 py-2.5 rounded-xl border bg-bgEco border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-textEco"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Destination (To)
                  </label>
                  <input
                    type="text"
                    value={toLoc}
                    onChange={(e) => setToLoc(e.target.value)}
                    placeholder="e.g. Boston or Rome"
                    className="w-full px-4 py-2.5 rounded-xl border bg-bgEco border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-textEco"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Primary Vehicle
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-bgEco border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-textEco"
                  >
                    {vehicles.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={searching}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-98 transition duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  {searching ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Mapping Route...</span>
                    </>
                  ) : (
                    <span>Calculate Shortest Route</span>
                  )}
                </button>
              </form>
            </div>

            {/* DYNAMIC RESULTS ANALYTICS */}
            {routeDetails && (
              <div className="bg-white border border-borderEco p-6 rounded-3xl space-y-4 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-50 pb-2">
                  Trip Emission Analysis
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Distance</span>
                    <p className="text-xl font-black text-slate-850 mt-1">
                      {routeDetails.distance} <span className="text-xs font-semibold">km</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
                    <p className="text-xl font-black text-slate-855 mt-1">
                      {routeDetails.duration} <span className="text-xs font-semibold">min</span>
                    </p>
                  </div>
                </div>

                {/* Total Carbon footprint box */}
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                    Calculated Carbon Footprint
                  </span>
                  <p className="text-3xl font-black text-emerald-800 mt-1">
                    {carbonResult} <span className="text-sm font-semibold">kg CO₂e</span>
                  </p>
                </div>

                {/* Log Activity Button */}
                {vehicleType !== 'WALK' && (
                  <button
                    onClick={handleLogActivity}
                    disabled={logging}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold py-2.5 rounded-xl shadow-md transition duration-150 flex items-center justify-center space-x-2 text-sm"
                  >
                    {logging ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Logging...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Log this journey in activities</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Leaflet Map & Eco-Alternatives comparisons */}
          <div className="lg:col-span-2 space-y-6">
            {/* LEAFLET MAP ELEMENT */}
            <div className="bg-white border border-borderEco p-4 rounded-3xl relative shadow-sm">
              {!mapLoaded && (
                <div className="absolute inset-0 z-10 bg-slate-50 flex items-center justify-center rounded-3xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              )}
              <div 
                id="route-map" 
                className="w-full h-[400px] rounded-2xl z-0"
                style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}
              />
            </div>

            {/* ALTERNATIVE VEHICLE SAVINGS COMPARISONS */}
            {routeDetails && (
              <div className="bg-white border border-borderEco p-6 rounded-3xl space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-800">
                    <Eye size={18} className="text-emerald-500" />
                    <span>How to Save Emission on this route</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Compare alternate modes of transit and see how much CO₂ you could prevent from being released.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {alternates.map((alt, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border transition duration-300 flex flex-col justify-between
                        ${alt.savings > 0 
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                          : 'bg-red-50/50 border-red-100 text-red-800'
                        }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                          Compared to
                        </span>
                        <span className="font-extrabold text-sm text-slate-800">
                          {alt.vehicle}
                        </span>
                      </div>

                      <div className="mt-4 font-semibold">
                        {alt.savings > 0 ? (
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">You Save</p>
                            <p className="text-lg font-black text-emerald-600">
                              +{alt.savings} kg CO₂e
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Increases by</p>
                            <p className="text-lg font-black text-red-600">
                              {alt.savings} kg CO₂e
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ECO COMMUTING RECOMMENDATION TRICKS */}
                <div className="bg-slate-50 p-4 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed text-slate-600 border border-slate-100 font-semibold">
                  <AlertCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800">Eco-Commute Savings Trick:</span>
                    <p>
                      <strong>Tip:</strong> If using a fuel-powered vehicle for this {routeDetails.distance} km journey, maintain an even speed of 80–90 km/h (50–55 mph). Driving fast or aggressive acceleration increases engine load, which increases fuel consumption and carbon output by up to <strong>15%–30%</strong>!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoutePlanner;
