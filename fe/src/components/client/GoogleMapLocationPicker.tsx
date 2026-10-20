
import { useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MapPin, Map, X, Search, LoaderCircle } from "lucide-react";

type LocationPickerProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (address: string, position?: { lat: number; lng: number }) => void;
  markerColor?: string;
};

const defaultCenter = {
  lat: 10.0452,
  lng: 105.7469,
};

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const libraries: ("places")[] = ["places"];

export default function GoogleMapLocationPicker({
  label,
  value,
  placeholder,
  onChange,
  markerColor = "#16a34a",
}: LocationPickerProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  const [center, setCenter] = useState(defaultCenter);
  const [marker, setMarker] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [searchText, setSearchText] = useState(value);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [mapError, setMapError] = useState("");

  const { isLoaded, loadError } = useJsApiLoader({
    id: "goride-google-maps",
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const onAutocompleteLoad = useCallback(
    (instance: google.maps.places.Autocomplete) => {
      setAutocomplete(instance);
    },
    [],
  );

  const handlePlaceChanged = () => {
    const place = autocomplete?.getPlace();

    if (!place?.geometry?.location) {
      setMapError("Vui lòng chọn địa điểm từ danh sách gợi ý.");
      return;
    }

    const position = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    const address =
      place.formatted_address || place.name || "";

    setCenter(position);
    setMarker(position);
    setSearchText(address);
    setMapError("");
    onChange(address, position);
    map?.panTo(position);
    map?.setZoom(16);
  };

  const handleMapClick = async (
    event: google.maps.MapMouseEvent,
  ) => {
    if (!event.latLng) return;

    const position = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    setMarker(position);
    setCenter(position);
    setIsResolving(true);
    setMapError("");

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: position,
      });

      const address = result.results[0]?.formatted_address;

      if (!address) {
        setMapError(
          "Không tìm thấy địa chỉ tại vị trí này. Hãy chọn vị trí khác.",
        );
        return;
      }

      setSearchText(address);
      onChange(address, position);
    } catch {
      setMapError(
        "Không thể lấy địa chỉ. Vui lòng thử lại.",
      );
    } finally {
      setIsResolving(false);
    }
  };

  const confirmLocation = () => {
    if (!value.trim()) {
      setMapError("Vui lòng tìm kiếm hoặc chọn vị trí trên bản đồ.");
      return;
    }

    setIsMapOpen(false);
    setMapError("");
  };

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Không tải được Google Maps. Hãy kiểm tra API key và cấu hình API.
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-bold text-gray-700">
        {label}
      </label>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <MapPin
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
          />

          {isLoaded ? (
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={handlePlaceChanged}
              options={{
                fields: [
                  "formatted_address",
                  "geometry",
                  "name",
                ],
              }}
            >
              <input
                type="text"
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  onChange(event.target.value);
                  setMapError("");
                }}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </Autocomplete>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3.5 text-sm text-gray-500">
              <LoaderCircle size={17} className="animate-spin" />
              Đang tải bản đồ...
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setSearchText(value);
            setMapError("");
            setIsMapOpen(true);
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-sm font-bold text-green-700 transition hover:bg-green-100"
          aria-label={`Chọn ${label} trên bản đồ`}
          title="Chọn trên Google Maps"
        >
          <Map size={18} />
          <span className="hidden sm:inline">Bản đồ</span>
        </button>
      </div>

      {value && (
        <p className="mt-2 break-words text-xs text-gray-500">
          Đã chọn: {value}
        </p>
      )}

      {isMapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <div>
                <h3 className="font-bold text-gray-900">
                  Chọn {label.toLowerCase()}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Tìm địa chỉ hoặc nhấn trực tiếp lên bản đồ.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Đóng bản đồ"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {!isLoaded ? (
                <div className="flex h-64 items-center justify-center gap-2 text-gray-500">
                  <LoaderCircle className="animate-spin" />
                  Đang tải Google Maps...
                </div>
              ) : (
                <>
                  <div className="relative mb-3">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Autocomplete
                      onLoad={onAutocompleteLoad}
                      onPlaceChanged={handlePlaceChanged}
                      options={{
                        fields: [
                          "formatted_address",
                          "geometry",
                          "name",
                        ],
                      }}
                    >
                      <input
                        value={searchText}
                        onChange={(event) => {
                          setSearchText(event.target.value);
                          onChange(event.target.value);
                        }}
                        placeholder="Tìm tên đường, địa chỉ, địa điểm..."
                        className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-green-500"
                      />
                    </Autocomplete>
                  </div>

                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={14}
                    onLoad={setMap}
                    onClick={handleMapClick}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    {marker && (
                      <Marker
                        position={marker}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 9,
                          fillColor: markerColor,
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                        }}
                      />
                    )}
                  </GoogleMap>
                </>
              )}

              {mapError && (
                <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {mapError}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">
                    Vị trí đã chọn
                  </p>
                  <p className="mt-1 break-words">
                    {isResolving
                      ? "Đang xác định địa chỉ..."
                      : value || "Chưa chọn địa điểm"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={confirmLocation}
                  disabled={!value.trim() || isResolving}
                  className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Xác nhận địa điểm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
