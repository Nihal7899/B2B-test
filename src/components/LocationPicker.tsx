import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Navigation, MapPin, X, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onConfirm: (location: { latitude: number; longitude: number; line1: string; city: string; state: string; postal_code: string; place_id: string | null }) => void;
  onCancel: () => void;
}

interface PlaceSuggestion {
  description: string;
  place_id: string;
  main_text: string;
  secondary_text: string;
}

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export function LocationPicker({ initialLat, initialLng, onConfirm, onCancel }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [address, setAddress] = useState<{ line1: string; city: string; state: string; postal_code: string; place_id: string | null } | null>(null);
  const [lat, setLat] = useState(initialLat ?? DEFAULT_LAT);
  const [lng, setLng] = useState(initialLng ?? DEFAULT_LNG);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const initMap = useCallback(async () => {
    if (!mapRef.current || !apiKey) return;
    if (loaded) return;

    if (typeof google === 'undefined' || !google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => setupMap();
      script.onerror = () => setLoaded(false);
      document.head.appendChild(script);
    } else {
      setupMap();
    }
  }, [apiKey, loaded]);

  function setupMap() {
    if (!mapRef.current || typeof google === 'undefined') return;
    const center = { lat, lng };
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });
    markerRef.current = new google.maps.Marker({
      position: center,
      map: mapInstanceRef.current,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });
    geocoderRef.current = new google.maps.Geocoder();
    autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    placesServiceRef.current = new google.maps.places.PlacesService(mapInstanceRef.current);

    google.maps.event.addListener(markerRef.current, 'dragend', () => {
      const pos = markerRef.current?.getPosition();
      if (pos) {
        setLat(pos.lat());
        setLng(pos.lng());
        reverseGeocode(pos.lat(), pos.lng());
      }
    });

    mapInstanceRef.current.addListener('click', (e: any) => {
      if (e.latLng) {
        markerRef.current?.setPosition(e.latLng);
        setLat(e.latLng.lat());
        setLng(e.latLng.lng());
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      }
    });

    setLoaded(true);
    if (initialLat && initialLng) {
      reverseGeocode(initialLat, initialLng);
    }
  }

  const reverseGeocode = useCallback((latVal: number, lngVal: number) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat: latVal, lng: lngVal } }, (results: any[], status: any) => {
      if (status === 'OK' && results && results[0]) {
        const r = results[0];
        const component = (type: string) => r.address_components?.find((c: any) => c.types.includes(type))?.long_name ?? '';
        setAddress({
          line1: `${component('street_number')} ${component('route')}`.trim() || r.formatted_address,
          city: component('locality') || component('administrative_area_level_2'),
          state: component('administrative_area_level_1'),
          postal_code: component('postal_code'),
          place_id: r.place_id ?? null,
        });
      }
    });
  }, []);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.functions.invoke('maps', { body: { action: 'get_api_key' } });
      if (!error && data?.api_key) {
        setApiKey(data.api_key as string);
      }
    })();
  }, []);

  useEffect(() => {
    if (apiKey) void initMap();
  }, [apiKey, initMap]);

  const searchPlaces = useCallback((query: string) => {
    if (!query.trim() || !autocompleteServiceRef.current) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    autocompleteServiceRef.current.getPlacePredictions(
      { input: query, componentRestrictions: { country: 'in' } },
      (predictions: any[], status: any) => {
        setSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map((p: any) => ({
            description: p.description,
            place_id: p.place_id,
            main_text: p.structured_formatting.main_text,
            secondary_text: p.structured_formatting.secondary_text,
          })));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  const selectPlace = useCallback((placeId: string) => {
    if (!placesServiceRef.current || !mapInstanceRef.current) return;
    setShowSuggestions(false);
    setSearching(true);
    placesServiceRef.current.getDetails(
      { placeId, fields: ['geometry', 'formatted_address', 'address_components'] },
      (place: any, status: any) => {
        setSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const latVal = place.geometry.location.lat();
          const lngVal = place.geometry.location.lng();
          setLat(latVal);
          setLng(lngVal);
          mapInstanceRef.current?.panTo({ lat: latVal, lng: lngVal });
          markerRef.current?.setPosition({ lat: latVal, lng: lngVal });
          const component = (type: string) => place.address_components?.find((c: any) => c.types.includes(type))?.long_name ?? '';
          setAddress({
            line1: `${component('street_number')} ${component('route')}`.trim() || (place.formatted_address ?? ''),
            city: component('locality') || component('administrative_area_level_2'),
            state: component('administrative_area_level_1'),
            postal_code: component('postal_code'),
            place_id: placeId,
          });
        }
      }
    );
  }, []);

  const useCurrentLocation = useCallback(() => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        mapInstanceRef.current?.panTo({ lat: latitude, lng: longitude });
        markerRef.current?.setPosition({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [reverseGeocode]);

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
      <div className="flex items-center gap-2 px-4 h-14 border-b border-ink-100 shrink-0">
        <button onClick={onCancel} className="h-9 w-9 flex items-center justify-center rounded-lg text-ink-600"><X size={20} /></button>
        <h2 className="text-base font-bold text-ink-900">Select location</h2>
      </div>

      <div className="relative px-4 py-3 border-b border-ink-100 shrink-0">
        <div className="flex items-center gap-2 bg-ink-50 rounded-xl h-11 px-3 border border-ink-200 focus-within:border-brand-500">
          <Search size={17} className="text-ink-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); searchPlaces(e.target.value); }}
            onFocus={() => showSuggestions && setShowSuggestions(true)}
            placeholder="Search for a place..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {searching && <Loader2 size={16} className="animate-spin text-brand-600" />}
          {searchQuery && !searching && <button onClick={() => { setSearchQuery(''); setSuggestions([]); }}><X size={15} className="text-ink-400" /></button>}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-white border border-ink-200 rounded-xl shadow-lg max-h-64 overflow-y-auto z-10">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                onClick={() => selectPlace(s.place_id)}
                className="w-full text-left px-3 py-2.5 hover:bg-ink-50 border-b border-ink-50 last:border-0"
              >
                <p className="text-sm font-semibold text-ink-800 truncate">{s.main_text}</p>
                <p className="text-[11px] text-ink-400 truncate">{s.secondary_text}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex-1 min-h-[300px]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin text-brand-600" />
              <p className="text-xs text-ink-400">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="absolute inset-0" />
        {loaded && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
            <MapPin size={36} className="text-brand-600 fill-brand-200" />
          </div>
        )}
        <button
          onClick={useCurrentLocation}
          disabled={locating}
          className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white shadow-lg border border-ink-200 flex items-center justify-center text-brand-600 tap-highlight active:scale-90 transition-transform z-10"
          aria-label="Use current location"
        >
          {locating ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
        </button>
      </div>

      <div className="shrink-0 border-t border-ink-100 px-4 py-3 space-y-3 bg-white">
        {address && (
          <div className="flex items-start gap-2.5">
            <MapPin size={17} className="text-brand-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-800 truncate">{address.line1 || 'Selected location'}</p>
              <p className="text-xs text-ink-500 mt-0.5 truncate">
                {address.city && address.state ? `${address.city}, ${address.state}` : ''} {address.postal_code ? `- ${address.postal_code}` : ''}
              </p>
              <p className="text-[10px] text-ink-400 mt-0.5">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleConfirm}
          disabled={!loaded}
          className="w-full h-12 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Check size={18} /> Confirm location
        </button>
      </div>
    </div>
  );
}
