import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Map,
  X,
  Search,
  LoaderCircle,
  Navigation,
  Check,
} from "lucide-react";

type LocationPickerProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (address: string) => void;
  markerColor?: string;
};

// Default center: Can Tho, Vietnam
const defaultCenter: [number, number] = [10.0452, 105.7469];

interface SearchSuggestion {
  displayName: string;
  lat: number;
  lng: number;
}

// Generate modern SVG DivIcon with custom color
function createMapPinIcon(color: string) {
  return L.divIcon({
    className: "custom-osm-pin",
    html: `
      <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="${color}" stroke="#ffffff" stroke-width="1.5" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Helper: Format Photon properties into readable address
function formatPhotonAddress(props: any): string {
  const parts: string[] = [];
  if (props.name) parts.push(props.name);
  if (props.street && props.street !== props.name) parts.push(props.street);
  if (props.locality && props.locality !== props.name && props.locality !== props.district) parts.push(props.locality);
  if (props.district) parts.push(props.district);
  if (props.city && props.city !== props.district) parts.push(props.city);
  if (props.country && props.country !== "Việt Nam") parts.push(props.country);

  if (parts.length > 0) {
    return parts.join(", ");
  }
  return props.name || "";
}

export default function GoogleMapLocationPicker({
  label,
  value,
  placeholder,
  onChange,
  markerColor = "#16a34a",
}: LocationPickerProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchText, setSearchText] = useState(value || "");
  const [modalSearchInput, setModalSearchInput] = useState(value || "");
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(
    null,
  );
  const [isResolving, setIsResolving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchTimeoutRef = useRef<any>(null);

  // Sync outside value with local searchText
  useEffect(() => {
    setSearchText(value || "");
    if (!isMapOpen) {
      setModalSearchInput(value || "");
    }
  }, [value, isMapOpen]);

  // Robust reverse geocoding combining Photon and BigDataCloud
  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      // 1. Try Photon first
      try {
        const res = await fetch(
          `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const addr = formatPhotonAddress(data.features[0].properties);
            if (addr && addr.length > 3) return addr;
          }
        }
      } catch {}

      // 2. Try BigDataCloud (supports Vietnamese administrative names)
      try {
        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`,
        );
        if (bdcRes.ok) {
          const bdcData = await bdcRes.json();
          const parts: string[] = [];
          if (bdcData.locality) parts.push(bdcData.locality);
          if (bdcData.city && bdcData.city !== bdcData.locality) parts.push(bdcData.city);
          if (
            bdcData.principalSubdivision &&
            bdcData.principalSubdivision !== bdcData.city
          ) {
            parts.push(bdcData.principalSubdivision);
          }
          if (parts.length > 0) {
            return parts.join(", ");
          }
        }
      } catch {}

      return `Vị trí (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    },
    [],
  );

  // Safely update marker and map position without triggering re-renders of the map
  const updateMarkerPosition = useCallback(
    (lat: number, lng: number, zoom?: number) => {
      setSelectedCoord([lat, lng]);

      const map = mapInstanceRef.current;
      if (!map) return;

      try {
        if (zoom !== undefined) {
          map.setView([lat, lng], zoom, { animate: false });
        } else {
          map.panTo([lat, lng], { animate: false });
        }

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon: createMapPinIcon(markerColor),
          }).addTo(map);
        }
      } catch (err) {
        console.warn("Leaflet update marker warning:", err);
      }
    },
    [markerColor],
  );

  // Locate user position via device GPS or fallback to IP Geolocation
  // Locate user position via high-accuracy GPS only
  const handleLocateMe = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt này không hỗ trợ định vị GPS.");
      return;
    }

    setIsResolving(true);
    setStatusMessage("Đang dò tìm tín hiệu vệ tinh GPS độ chính xác cao...");

    const applyLocation = async (lat: number, lng: number, sourceMsg: string) => {
      updateMarkerPosition(lat, lng, 17);
      const addr = await reverseGeocode(lat, lng);
      setModalSearchInput(addr);
      setSearchText(addr);
      onChange(addr);
      setStatusMessage(sourceMsg);
      setIsResolving(false);
      setTimeout(() => setStatusMessage(""), 5000);
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);
        await applyLocation(
          lat,
          lng,
          `Đã định vị chính xác qua GPS (Độ lệch: ±${accuracy}m)`,
        );
      },
      (err) => {
        setIsResolving(false);
        console.warn("GPS error:", err);

        if (err.code === 1) {
          // PERMISSION_DENIED
          setStatusMessage("Trình duyệt chưa được cấp quyền vị trí GPS.");
          alert(
            "Trình duyệt đang chặn quyền vị trí.\n\nCách bật: Nhấn vào biểu tượng Ổ khóa (hoặc Cài đặt trang) ở bên trái thanh nhập địa chỉ web của trình duyệt -> Bật 'Vị trí' (Location) thành 'Cho phép' (Allow).",
          );
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setStatusMessage("Không nhận được tín hiệu vệ tinh GPS từ thiết bị.");
          alert(
            "Không nhận được tín hiệu GPS.\n\nHãy kiểm tra xem bạn đã bật 'Location services' trong cài đặt Windows (Settings > Privacy & security > Location) chưa.",
          );
        } else if (err.code === 3) {
          // TIMEOUT
          setStatusMessage("Hết thời gian quét vệ tinh GPS (Timeout). Vui lòng thử lại.");
        } else {
          setStatusMessage("Không thể lấy vị trí GPS. Vui lòng bấm chọn trên bản đồ.");
        }
      },
      {
        enableHighAccuracy: true, // Bắt buộc GPS độ chính xác cao
        timeout: 15000,          // 15 giây để GPS dò và bắt đủ vệ tinh
        maximumAge: 0,           // Luôn lấy tọa độ GPS mới nhất, không dùng cache
      },
    );
  }, [onChange, reverseGeocode, updateMarkerPosition]);

  // Initialize Leaflet Map ONCE when modal opens; destroy ONCE when it closes
  useEffect(() => {
    if (!isMapOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const timer = setTimeout(() => {
      if (isCancelled || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      const initialCenter = selectedCoord || defaultCenter;
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: true,
      });

      // Use CartoDB Voyager tiles (read key from env, do not hardcode secrets)
      const cartoKey = import.meta.env.VITE_CARTO_API_KEY;
      const tileUrl = cartoKey
        ? `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      // Add initial marker if coordinate exists
      if (selectedCoord) {
        markerRef.current = L.marker(selectedCoord, {
          icon: createMapPinIcon(markerColor),
        }).addTo(map);
      }

      // Handle map click to pick location
      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updateMarkerPosition(lat, lng);
        setIsResolving(true);
        setShowSuggestions(false);

        const address = await reverseGeocode(lat, lng);
        setModalSearchInput(address);
        setSearchText(address);
        onChange(address);
        setIsResolving(false);
      });

      mapInstanceRef.current = map;

      // Invalidate size after modal render
      setTimeout(() => {
        if (!isCancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isMapOpen]); // ONLY re-run when modal is opened or closed!

  // Autocomplete suggestions debounce
  const fetchSuggestions = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=5`,
      );
      if (res.ok) {
        const data = await res.json();
        const results: SearchSuggestion[] = (data.features || []).map(
          (f: any) => ({
            displayName: formatPhotonAddress(f.properties),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          }),
        );
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }
    } catch {
      setSuggestions([]);
    }
  };

  const handleInputChange = (text: string) => {
    setModalSearchInput(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  // Perform search on Enter or button click
  const handleSearch = async (targetQuery?: string) => {
    const query = (targetQuery || modalSearchInput).trim();
    if (!query) return;

    setIsResolving(true);
    setShowSuggestions(false);

    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const feat = data.features[0];
          const lat = feat.geometry.coordinates[1];
          const lng = feat.geometry.coordinates[0];
          const fullAddress = formatPhotonAddress(feat.properties);

          updateMarkerPosition(lat, lng, 16);
          setModalSearchInput(fullAddress);
          setSearchText(fullAddress);
          onChange(fullAddress);
          setIsResolving(false);
          return;
        }
      }
    } catch {}

    setSearchText(query);
    onChange(query);
    setIsResolving(false);
  };

  const selectSuggestion = (s: SearchSuggestion) => {
    updateMarkerPosition(s.lat, s.lng, 16);
    setModalSearchInput(s.displayName);
    setSearchText(s.displayName);
    onChange(s.displayName);
    setShowSuggestions(false);
  };

  const confirmLocation = () => {
    const finalVal = (modalSearchInput || searchText || value).trim();
    if (finalVal) {
      onChange(finalVal);
      setSearchText(finalVal);
    }
    setIsMapOpen(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-bold text-gray-700">
          {label}
        </label>
      )}

      {/* Main input for typing directly or opening map */}
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <MapPin
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
          />

          <input
            type="text"
            value={searchText}
            onChange={(event) => {
              const text = event.target.value;
              setSearchText(text);
              onChange(text);
            }}
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-10 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
          />

          {/* Quick locate button right inside the main input */}
          <button
            type="button"
            onClick={handleLocateMe}
            title="Lấy vị trí hiện tại của tôi"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-blue-600 transition"
          >
            <Navigation size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalSearchInput(searchText || value || "");
            setIsMapOpen(true);
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-sm font-bold text-green-700 transition hover:bg-green-100"
          aria-label={`Chọn ${label || "địa điểm"} trên bản đồ`}
          title="Chọn trên bản đồ"
        >
          <Map size={18} />
          <span className="hidden sm:inline">Bản đồ</span>
        </button>
      </div>

      {statusMessage && (
        <p className="mt-1 text-xs text-blue-600 font-medium">
          {statusMessage}
        </p>
      )}

      {value && (
        <p className="mt-2 break-words text-xs text-gray-500">
          Đã chọn: <span className="font-semibold text-gray-700">{value}</span>
        </p>
      )}

      {/* Interactive Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-6 backdrop-blur-xs">
          <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: markerColor }}
                />
                <div>
                  <h3 className="font-bold text-gray-900">
                    Chọn {label ? label.toLowerCase() : "địa điểm"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Bấm lên bản đồ hoặc nhập địa chỉ để tìm kiếm.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition"
                aria-label="Đóng bản đồ"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col p-4 overflow-y-auto">
              {/* Search Box with Autocomplete */}
              <div className="relative mb-3 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={modalSearchInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Tìm tên đường, phường, quận, địa điểm..."
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />

                  {/* Autocomplete dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectSuggestion(s)}
                          className="flex w-full items-start gap-2 border-b border-gray-50 px-3 py-2.5 text-left text-xs text-gray-700 transition hover:bg-green-50 last:border-b-0"
                        >
                          <MapPin
                            size={14}
                            className="mt-0.5 shrink-0 text-green-600"
                          />
                          <span className="line-clamp-2">{s.displayName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={isResolving || !modalSearchInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {isResolving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  <span>Tìm</span>
                </button>

                <button
                  type="button"
                  onClick={handleLocateMe}
                  title="Vị trí hiện tại của tôi"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-gray-700 transition hover:bg-gray-100"
                >
                  <Navigation size={18} className="text-blue-600" />
                </button>
              </div>

              {/* Status Notice */}
              {statusMessage && (
                <div className="mb-2 text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                  <Navigation size={13} className="animate-pulse" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Map Container */}
              <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 shadow-inner">
                <div
                  ref={mapContainerRef}
                  style={{ width: "100%", height: "420px" }}
                />

                {isResolving && (
                  <div className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md backdrop-blur-xs">
                    <LoaderCircle size={14} className="animate-spin text-green-600" />
                    Đang xử lý vị trí...
                  </div>
                )}
              </div>

              {/* Footer Selection & Actions */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-3">
                <div className="min-w-0 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">Vị trí đã chọn</p>
                  <p className="mt-0.5 break-words text-xs text-gray-600">
                    {isResolving
                      ? "Đang xác định tên địa chỉ..."
                      : modalSearchInput || searchText || value || "Chưa chọn địa điểm"}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={confirmLocation}
                    disabled={
                      !modalSearchInput.trim() &&
                      !searchText.trim() &&
                      !value.trim()
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>Xác nhận</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
