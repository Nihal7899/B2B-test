import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Navigation, MapPin, X, Loader2, Check, AlertCircle, Crosshair } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onConfirm: (location: {
    latitude: number;
    longitude: number;
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    place_id: string | null;
  }) => void;
  onCancel: () => void;
}

interface PlaceSuggestion {
  description: string;
  place_id: string;
  main_text: string;
  secondary_text: string;
}

interface ResolvedAddress {
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  place_id: string | null;
  formatted_address: string;
}

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export function LocationPicker({ initialLat, initialLng, onConfirm, onCancel }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [address, setAddress] = useState<ResolvedAddress | null>(null);
  const [lat, setLat] = useState(initialLat ?? DEFAULT_LAT);
  const [lng, setLng] = useState(initialLng ?? DEFAULT_LNG);

  const reverseGeocode = useCallback(async (latVal: number, lngVal: number) => {
    setGeocoding(true);
    setLocationError(null);
    try {
      const { data, error } = await supabase.functions.invoke('maps', {
        body: { action: 'reverse_geocode', lat: latVal, lng: lngVal },
      });
      if (error) throw error;
      if (data?.address) {
        const a = data.address;
        setAddress({
          line1: a.line1 || a.formatted_address || '',
          city: a.city || '',
          state: a.state || '',
          postal_code: a.postal_code || '',
          place_id: a.place_id ?? null,
          formatted_address: a.formatted_address ?? '',
        });
      } else {
        setAddress(null);
      }
    } catch (err) {
      console.error('Reverse geocode failed', err);
      setLocationError('Could not fetch address for this location.');
      setAddress(null);
    }
    setGeocoding(false);
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('maps', {
        body: { action: 'autocomplete', query: query.trim() },
      });
      if (error) throw error;
      if (data?.predictions && Array.isArray(data.predictions)) {
        setSuggestions(
          data.predictions.map((p: any) => ({
            description: p.description ?? '',
            place_id: p.place_id ?? '',
            main_text: p.structured_formatting?.main_text ?? p.description ?? '',
            secondary_text: p.structured_formatting?.secondary_text ?? '',
          }))
        );
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Place search failed', err);
      setSuggestions([]);
    }
    setSearching(false);
  }, []);

  const selectPlace = useCallback(
    async (placeId: string, description: string) => {
      setShowSuggestions(false);
      setSearchQuery(description);
      setSuggestions([]);
      setGeocoding(true);
      setLocationError(null);
      try {
        const { data, error } = await supabase.functions.invoke('maps', {
          body: { action: 'search', query: description },
        });
        if (error) throw error;
        if (data?.address) {
          const a = data.address;
          const latVal = a.latitude ?? lat;
          const lngVal = a.longitude ?? lng;
          setLat(latVal);
          setLng(lngVal);
          mapInstanceRef.current?.panTo({ lat: latVal, lng: lngVal });
          markerRef.current?.setPosition({ lat: latVal, lng: lngVal });
          setAddress({
            line1: a.line1 || a.formatted_address || '',
            city: a.city || '',
            state: a.state || '',
            postal_code: a.postal_code || '',
            place_id: a.place_id ?? null,
            formatted_address: a.formatted_address ?? '',
          });
        } else {
          setLocationError('Could not find this place. Try a different search.');
        }
      } catch (err) {
        console.error('Place selection failed', err);
        setLocationError('Could not find this place. Try a different search.');
      }
      setGeocoding(false);
    },
    [lat, lng]
  );

  const useCurrentLocation = useCallback(() => {
    setLocating(true);
    setLocationError(null);
    if (!('geolocation' in navigator)) {
      setLocationError('Location services are not available on this device.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        mapInstanceRef.current?.panTo({ lat: latitude, lng: longitude });
        markerRef.current?.setPosition({ lat: latitude, lng: longitude });
        void reverseGeocode(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Enable location access in your browser settings, or search for a place instead.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('Your location could not be determined. Try searching for a place instead.');
        } else if (err.code === err.TIMEOUT) {
          setLocationError('Location request timed out. Try again or search for a place.');
        } else {
          setLocationError('Could not get your location. Try searching for a place instead.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }, [reverseGeocode]);

  // Fetch API key from edge function on mount
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('maps', {
          body: { action: 'get_api_key' },
        });
        if (cancelled) return;
        if (error) {
          console.error('Failed to get maps API key', error);
          setKeyError(true);
          return;
        }
        if (data?.api_key) {
          setApiKey(data.api_key as string);
        } else {
          setKeyError(true);
        }
      } catch (err) {
        console.error('Maps edge function error', err);
        if (!cancelled) setKeyError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load Google Maps JS SDK once we have the API key
  useEffect(() => {
    if (!apiKey) return;

    if (typeof google !== 'undefined' && google.maps) {
      setupMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => setupMap();
    script.onerror = () => {
      console.error('Failed to load Google Maps SDK');
      setKeyError(true);
    };
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        void searchPlaces(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  function setupMap() {
    if (!mapRef.current || typeof google === 'undefined' || !google.maps) return;

    const center = { lat, lng };
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
    });

    markerRef.current = new google.maps.Marker({
      position: center,
      map: mapInstanceRef.current,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    // Drag pin
    google.maps.event.addListener(markerRef.current, 'dragend', () => {
      const pos = markerRef.current?.getPosition();
      if (pos) {
        const lt = pos.lat();
        const ln = pos.lng();
        setLat(lt);
        setLng(ln);
        void reverseGeocode(lt, ln);
      }
    });

    // Tap/click on map to drop pin
    mapInstanceRef.current.addListener('click', (e: any) => {
      if (e.latLng) {
        markerRef.current?.setPosition(e.latLng);
        setLat(e.latLng.lat());
        setLng(e.latLng.lng());
        void reverseGeocode(e.latLng.lat(), e.latLng.lng());
      }
    });

    setMapReady(true);

    // Reverse geocode initial position if no initial coords provided
    if (!initialLat || !initialLng) {
      void reverseGeocode(center.lat, center.lng);
    } else {
      void reverseGeocode(initialLat, initialLng);
    }
  }

  const handleConfirm = () => {
    onConfirm({
      latitude: lat,
      longitude: lng,
      line1: address?.line1 ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      postal_code: address?.postal_code ?? '',
      place_id: address?.place_id ?? null,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-ink-100 shrink-0">
        <button onClick={onCancel} className="h-9 w-9 flex items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50">
          <X size={20} />
        </button>
        <h2 className="text-base font-bold text-ink-900">Select location</h2>
      </div>

      {/* Search bar */}
      <div className="relative px-4 py-3 border-b border-ink-100 shrink-0">
        <div className="flex items-center gap-2 bg-ink-50 rounded-xl h-11 px-3 border border-ink-200 focus-within:border-brand-500">
          <Search size={17} className="text-ink-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Search for a place or address..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {searching && <Loader2 size={16} className="animate-spin text-brand-600" />}
          {searchQuery && !searching && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
            >
              <X size={15} className="text-ink-400" />
            </button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-white border border-ink-200 rounded-xl shadow-lg max-h-64 overflow-y-auto z-20">
            {suggestions.map((s) => (
              <button
                key={s.place_id || s.description}
                onClick={() => void selectPlace(s.place_id, s.description)}
                className="w-full text-left px-3 py-2.5 hover:bg-ink-50 border-b border-ink-50 last:border-0 flex items-start gap-2"
              >
                <MapPin size={15} className="text-ink-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-800 truncate">{s.main_text}</p>
                  <p className="text-[11px] text-ink-400 truncate">{s.secondary_text}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map area */}
      <div className="relative flex-1 min-h-[300px]">
        {!mapReady && !keyError && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin text-brand-600" />
              <p className="text-xs text-ink-400">Loading map...</p>
            </div>
          </div>
        )}

        {keyError && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-50 px-6">
            <div className="flex flex-col items-center gap-3 text-center max-w-[280px]">
              <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                <AlertCircle size={28} />
              </div>
              <p className="text-sm font-bold text-ink-800">Map unavailable</p>
              <p className="text-xs text-ink-500">
                The map service could not be loaded. You can still search for a place above to set your location.
              </p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="absolute inset-0" />

        {mapReady && (
          <button
            onClick={useCurrentLocation}
            disabled={locating}
            className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white shadow-lg border border-ink-200 flex items-center justify-center text-brand-600 tap-highlight active:scale-90 transition-transform z-10"
            aria-label="Use current location"
          >
            {locating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} />}
          </button>
        )}

        {geocoding && mapReady && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 flex items-center gap-2 z-10">
            <Loader2 size={14} className="animate-spin text-brand-600" />
            <span className="text-xs font-semibold text-ink-700">Fetching address...</span>
          </div>
        )}
      </div>

      {/* Error banner */}
      {locationError && (
        <div className="shrink-0 px-4 py-2 bg-red-50 border-t border-red-100 flex items-start gap-2">
          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 flex-1">{locationError}</p>
          <button onClick={() => setLocationError(null)} className="text-red-400 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Bottom panel with address + confirm */}
      <div className="shrink-0 border-t border-ink-100 px-4 py-3 space-y-3 bg-white">
        {address ? (
          <div className="flex items-start gap-2.5">
            <MapPin size={17} className="text-brand-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-800 truncate">{address.line1 || 'Selected location'}</p>
              <p className="text-xs text-ink-500 mt-0.5 truncate">
                {address.city && address.state ? `${address.city}, ${address.state}` : ''}{' '}
                {address.postal_code ? `- ${address.postal_code}` : ''}
              </p>
              <p className="text-[10px] text-ink-400 mt-0.5">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
            </div>
          </div>
        ) : !geocoding && mapReady ? (
          <div className="flex items-start gap-2.5">
            <MapPin size={17} className="text-ink-300 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-400">No address resolved</p>
              <p className="text-xs text-ink-400 mt-0.5">
                Drag the pin or tap on the map to set your location.
              </p>
              <p className="text-[10px] text-ink-400 mt-0.5">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
            </div>
          </div>
        ) : null}
        <button
          onClick={handleConfirm}
          disabled={!mapReady}
          className="w-full h-12 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Check size={18} /> Confirm location
        </button>
      </div>
    </div>
  );
}
