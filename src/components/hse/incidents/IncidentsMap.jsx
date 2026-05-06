import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

export default function IncidentsMap({ incidents, onViewDetails }) {
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
        {incidents.filter(i => i.lat && i.lng).map((inc) => (
          <Marker 
            key={inc.id} 
            position={[inc.lat, inc.lng]}
          >
            <Tooltip direction="top" offset={[0, -40]} opacity={1} className="custom-leaflet-tooltip">
               <div className="font-semibold text-xs">{inc.title}</div>
               <div className={`text-[10px] uppercase font-bold ${severityColors[inc.severity].split(' ')[0]}`}>{inc.severity}</div>
            </Tooltip>
            <Popup className="bg-transparent border-none p-0 min-w-[250px]">
              <div className="bg-[#252541] border border-[#3a3a5a] text-white p-3 rounded-lg shadow-xl">
                <h3 className="font-bold text-sm mb-1">{inc.title}</h3>
                <p className="text-xs mb-2 opacity-80">{inc.site?.name}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#3a3a5a]">
                   <Badge variant="outline" className={`${severityColors[inc.severity]} text-[10px]`}>{inc.severity}</Badge>
                   <Button size="sm" className="h-6 text-xs bg-[#FFC107] text-black hover:bg-[#FFD54F]" onClick={() => onViewDetails(inc)}>View Details</Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}