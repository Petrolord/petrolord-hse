import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap, Rectangle } from 'react-leaflet';
import { supabase } from '@/lib/customSupabaseClient';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Mock data generator
const generateMockCoordinates = (orgs) => {
  return orgs.map(org => {
    const seed = org.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Ensure points land somewhat on landmasses roughly
    const lat = ((seed % 140) - 70); 
    const lng = ((seed % 360) - 180);
    
    const activityLevel = Math.floor((seed % 100)); 
    
    return {
      ...org,
      lat,
      lng,
      activityLevel,
      users: Math.floor((seed % 50) + 1),
      revenue: Math.floor((seed % 10000) + 1000)
    };
  });
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Continent/Region Definitions for Colorful Overlay
// Approximate bounding boxes for colorful regions
const regions = [
  { name: 'North America', color: '#3b82f6', bounds: [[15, -170], [75, -50]] }, // Blue
  { name: 'South America', color: '#22c55e', bounds: [[-56, -90], [13, -30]] },  // Green
  { name: 'Europe',        color: '#eab308', bounds: [[36, -10], [71, 40]] },     // Yellow
  { name: 'Africa',        color: '#f97316', bounds: [[-35, -20], [37, 55]] },    // Orange
  { name: 'Asia',          color: '#a855f7', bounds: [[5, 45], [75, 150]] },      // Purple
  { name: 'Australia',     color: '#ec4899', bounds: [[-45, 110], [-10, 155]] },  // Pink
];

const OrganizationHeatmap = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState("all");
  const [minActivity, setMinActivity] = useState([0]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*');
        
      if (error) throw error;
      
      const enhancedData = generateMockCoordinates(data || []);
      setOrganizations(enhancedData);
    } catch (error) {
      console.error('Error fetching organizations map data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Markers should be high contrast against the colored/light background
  const getColor = (activity) => {
    if (activity > 80) return '#dc2626'; // Red (High Alert)
    if (activity > 40) return '#4f46e5'; // Indigo (Medium)
    return '#059669'; // Emerald (Low/Good)
  };

  const getRadius = (users) => {
    return Math.max(8, Math.min(24, users * 0.8));
  };

  const filteredOrgs = organizations.filter(org => {
    const matchesTier = filterTier === "all" || 
      (filterTier === "premium" && org.subscription_tier === "premium") ||
      (filterTier === "free" && org.subscription_tier !== "premium");
    
    const matchesActivity = org.activityLevel >= minActivity[0];
    
    return matchesTier && matchesActivity;
  });

  return (
    <div className="relative h-[600px] w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {/* Controls Overlay - Light Theme */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-lg border border-gray-200 w-64 shadow-xl space-y-4 text-gray-800">
        <div>
          <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">Subscription Tier</label>
          <Select value={filterTier} onValueChange={setFilterTier}>
            <SelectTrigger className="h-8 bg-gray-50 border-gray-200 text-gray-900">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-gray-900">
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="free">Free / Basic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">
            Min Activity: {minActivity}%
          </label>
          <Slider
            value={minActivity}
            onValueChange={setMinActivity}
            max={100}
            step={1}
            className="py-2"
          />
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-2 text-gray-700 font-medium">
              <span className="w-3 h-3 rounded-full bg-[#dc2626]"></span> High Activity
            </span>
            <span className="text-gray-400 font-mono">{'>'}80</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-2 text-gray-700 font-medium">
              <span className="w-3 h-3 rounded-full bg-[#4f46e5]"></span> Medium
            </span>
            <span className="text-gray-400 font-mono">40-80</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-700 font-medium">
              <span className="w-3 h-3 rounded-full bg-[#059669]"></span> Normal
            </span>
            <span className="text-gray-400 font-mono">&lt; 40</span>
          </div>
        </div>
        
        <div className="text-[10px] text-gray-400 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span>{filteredOrgs.length} active orgs</span>
          <span className="text-blue-500 font-medium">Live Update</span>
        </div>
      </div>

      {/* Map Container - Bright OSM Theme */}
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
        className="bg-slate-50"
        minZoom={2}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Colorful Continent Overlays */}
        {regions.map((region) => (
          <Rectangle 
            key={region.name}
            bounds={region.bounds} 
            pathOptions={{ 
              color: region.color, 
              weight: 0, 
              fillOpacity: 0.15 
            }} 
          >
             <Tooltip sticky direction="center" className="bg-transparent border-0 shadow-none text-xs font-bold uppercase tracking-widest opacity-50">
                {region.name}
             </Tooltip>
          </Rectangle>
        ))}
        
        {/* Markers */}
        {filteredOrgs.map((org) => (
          <CircleMarker
            key={org.id}
            center={[org.lat, org.lng]}
            radius={getRadius(org.users)}
            pathOptions={{
              color: '#ffffff', 
              weight: 2,
              fillColor: getColor(org.activityLevel),
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="font-sans">
              <div className="font-bold text-sm">{org.name}</div>
              <div className="text-xs text-gray-500">Activity: {org.activityLevel}%</div>
            </Tooltip>
            
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-base mb-1 text-gray-900">{org.name}</h3>
                <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-wide">
                  {org.subscription_tier || 'Free'}
                </Badge>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Users:</span>
                    <span className="font-semibold text-gray-900">{org.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Revenue:</span>
                    <span className="font-semibold text-gray-900">${org.revenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activity Score:</span>
                    <span className={`font-bold ${
                      org.activityLevel > 80 ? 'text-red-600' : 
                      org.activityLevel > 40 ? 'text-indigo-600' : 'text-emerald-600'
                    }`}>
                      {org.activityLevel}/100
                    </span>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t text-xs text-gray-400 truncate">
                     {org.contact_email}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        
        <MapUpdater center={[20, 0]} zoom={2} />
      </MapContainer>
    </div>
  );
};

export default OrganizationHeatmap;