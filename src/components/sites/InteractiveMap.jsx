import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Navigation, MapPin } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const siteIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const selectedSiteIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const newSiteIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const locationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -34],
    shadowSize: [31, 31]
});

// Component to handle map clicks
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick(e.latlng);
    }
  });
  return null;
}

function MapController({ center, zoom, bounds, onCenterChange }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, bounds, map]);

  useMapEvents({
    moveend: () => {
        if (onCenterChange) {
            onCenterChange(map.getCenter());
        }
    }
  });

  return null;
}

export default function InteractiveMap({ 
  sites = [], 
  locations = [],
  selectedSiteId,
  onSiteSelect,
  onLocationSelect, 
  onAddNewSite,
  onCenterChange,
  onMapClick,
  height = "400px",
  defaultCenter = [4.8156, 7.0498]
}) {
  const [mapType, setMapType] = useState('street'); 
  const [tempMarker, setTempMarker] = useState(null);
  
  const layers = {
    street: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  };

  const handleMapClick = (latlng) => {
    // Only allow placing a new marker if onMapClick is provided
    if (onMapClick) {
      setTempMarker(latlng);
      onMapClick(latlng);
    }
  };

  const handleDragEnd = (e) => {
    const latlng = e.target.getLatLng();
    setTempMarker(latlng);
    if (onMapClick) onMapClick(latlng);
  };

  // Reset temp marker when selected site changes
  useEffect(() => {
    if (selectedSiteId) {
      setTempMarker(null);
    }
  }, [selectedSiteId]);

  const mapState = useMemo(() => {
    if (selectedSiteId) {
        const site = sites.find(s => s.id === selectedSiteId);
        if (site && site.latitude && site.longitude) {
            if (locations.length > 0) {
                 const lats = [site.latitude, ...locations.map(l => l.latitude).filter(Boolean)];
                 const lngs = [site.longitude, ...locations.map(l => l.longitude).filter(Boolean)];
                 if (lats.length > 1) {
                     return { 
                         bounds: [
                             [Math.min(...lats), Math.min(...lngs)],
                             [Math.max(...lats), Math.max(...lngs)]
                         ]
                     };
                 }
            }
            return { center: [site.latitude, site.longitude], zoom: 15 };
        }
    }
    
    // Use temp marker for centering if available
    if (tempMarker) {
      return { center: [tempMarker.lat, tempMarker.lng], zoom: 15 };
    }
    
    if (sites.length > 0) {
         const validSites = sites.filter(s => s.latitude && s.longitude);
         if (validSites.length > 0) {
             const lats = validSites.map(s => s.latitude);
             const lngs = validSites.map(s => s.longitude);
             return {
                 bounds: [
                     [Math.min(...lats), Math.min(...lngs)],
                     [Math.max(...lats), Math.max(...lngs)]
                 ]
             };
         }
    }
    
    return { center: defaultCenter, zoom: 6 };
  }, [sites, locations, selectedSiteId, defaultCenter, tempMarker]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#3a3a5a] group" style={{ height }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        className="z-0 bg-[#1a1a2e]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={layers[mapType]}
        />
        
        <ClickHandler onMapClick={handleMapClick} />
        <MapController {...mapState} onCenterChange={onCenterChange} />

        {/* Temporary Marker for new site creation */}
        {tempMarker && (
          <Marker 
            position={tempMarker} 
            icon={newSiteIcon}
            draggable={true}
            eventHandlers={{
              dragend: handleDragEnd
            }}
          >
            <Popup offset={[0, -30]}>
              <div className="text-center p-1">
                <strong>New Location</strong>
                <p className="text-xs m-0 mb-2">Drag to adjust</p>
                {onAddNewSite && (
                  <Button size="sm" className="bg-[#FFC107] text-black w-full h-7" onClick={onAddNewSite}>
                    Create Site Here
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {sites.map(site => (
          site.latitude && site.longitude && (
            <Marker 
              key={site.id} 
              position={[site.latitude, site.longitude]}
              icon={selectedSiteId === site.id ? selectedSiteIcon : siteIcon}
              eventHandlers={{
                click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    onSiteSelect && onSiteSelect(site);
                }
              }}
              opacity={selectedSiteId && selectedSiteId !== site.id ? 0.6 : 1}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                {site.name}
              </Tooltip>
            </Marker>
          )
        ))}

        {locations.map(loc => (
          loc.latitude && loc.longitude && (
            <Marker 
              key={loc.id} 
              position={[loc.latitude, loc.longitude]}
              icon={locationIcon}
              eventHandlers={{
                click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    onLocationSelect && onLocationSelect(loc);
                }
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{loc.name}</strong>
                  <p className="text-xs text-gray-500 m-0">{loc.location_type}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 bg-white/90 text-black hover:bg-white shadow-md backdrop-blur-sm"
          onClick={() => setMapType(prev => prev === 'street' ? 'satellite' : 'street')}
          title="Toggle Layer"
        >
          <Layers className="h-4 w-4" />
        </Button>
        
        {selectedSiteId && (
             <Button 
             variant="secondary" 
             size="icon" 
             className="h-8 w-8 bg-white/90 text-blue-600 hover:bg-white shadow-md backdrop-blur-sm"
             onClick={() => onSiteSelect && onSiteSelect(null)}
             title="Reset View"
           >
             <Navigation className="h-4 w-4" />
           </Button>
        )}
      </div>

      <div className="absolute bottom-6 right-4 z-[400] pointer-events-none">
        <div className="bg-[#1a1a2e]/80 backdrop-blur text-white text-xs px-2 py-1 rounded border border-[#3a3a5a] pointer-events-auto">
          Click map to place marker
        </div>
      </div>
    </div>
  );
}