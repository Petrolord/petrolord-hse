import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import L from 'leaflet';

// Fix leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Colored Icons could be implemented here using L.divIcon

const severityColors = {
  low: 'text-green-500 border-green-500',
  medium: 'text-yellow-500 border-yellow-500',
  high: 'text-orange-500 border-orange-500',
  critical: 'text-red-500 border-red-500',
};

const mapStyles = {
  height: '100%', 
  width: '100%',
  zIndex: 0
};

export default function ObservationsMap({ observations, onViewDetails }) {
  const center = [4.8156, 7.0498]; // Default to PH

  return (
    <div className="h-full w-full relative z-0 bg-[#1a1a2e]">
      <MapContainer 
        center={center} 
        zoom={11} 
        style={mapStyles}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {observations.filter(o => o.lat && o.lng).map((obs) => (
          <Marker 
            key={obs.id} 
            position={[obs.lat, obs.lng]}
          >
            <Tooltip direction="top" offset={[0, -40]} opacity={1} className="custom-leaflet-tooltip">
               <div className="font-semibold text-xs">{obs.title}</div>
               <div className={`text-[10px] uppercase font-bold ${severityColors[obs.severity].split(' ')[0]}`}>{obs.severity}</div>
            </Tooltip>
            <Popup className="bg-transparent border-none p-0 min-w-[250px]">
              <div className="bg-[#252541] border border-[#3a3a5a] text-white p-3 rounded-lg shadow-xl">
                <h3 className="font-bold text-sm mb-1">{obs.title}</h3>
                <p className="text-xs mb-2 opacity-80">{obs.site?.name}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#3a3a5a]">
                   <Badge variant="outline" className={`${severityColors[obs.severity]} text-[10px]`}>{obs.severity}</Badge>
                   <Button size="sm" className="h-6 text-xs bg-[#FFC107] text-black hover:bg-[#FFD54F]" onClick={() => onViewDetails(obs)}>View Details</Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-[#1a1a2e]/90 backdrop-blur border border-[#3a3a5a] p-3 rounded-lg shadow-xl text-xs text-white">
        <h4 className="font-bold mb-2 text-[#b0b0c0]">Severity Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div> Critical</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_5px_orange]"></div> High</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_5px_yellow]"></div> Medium</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div> Low</div>
        </div>
      </div>
    </div>
  );
}