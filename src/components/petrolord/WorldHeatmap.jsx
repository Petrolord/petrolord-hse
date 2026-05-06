import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw, ZoomIn, ZoomOut, Globe } from 'lucide-react';
import { worldHeatmapService } from '@/services/worldHeatmapService';
import { useHSE } from '@/context/HSEContext';
import { Skeleton } from "@/components/ui/skeleton";

// Using a stable CDN for map topology
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const RISK_COLOR_MAP = {
  'None': null, // Will fall back to continent color
  'Low': "#FFFF00", // Bright Yellow
  'Medium': "#FFA500", // Bright Orange
  'High': "#FF0000", // Bright Red
  'Critical': "#8B0000" // Dark Red
};

// Continent Base Colors (Bright & Vibrant)
// Note: Determining continent from just country name in generic map data is tricky without a lookup.
// We'll use a simple approximation based on regions if available, or just map IDs if we had a full lookup table.
// For simplicity and vibrancy without a heavy library, we can cycle colors or try to target specific regions if possible.
// Since 'react-simple-maps' default topology doesn't always have continent data easily accessible without a join,
// we will assign colors based on broad ID ranges or rough coordinate checks if possible, or just make ALL land masses distinct bright colors.
// For this request, let's try to simulate the requested scheme by checking properties if available, or fallback to a vibrant set.

const getContinentColor = (geo) => {
  // This is a rough approximation since the basic topojson might not have continent prop.
  // We will try to map by ISO numerical code ranges or just make them all vibrant if region isn't there.
  // Actually, let's just make the default land color highly visible and distinct from ocean.
  
  // IF we want specific continents, we'd need a lookup. Let's try to map some major ones if IDs match ISO-3 numeric.
  // North America: ~028, 124, 484, 840...
  // South America: ~032, 068, 076...
  // This is unreliable without a real map. 
  // BETTER APPROACH: Use a vibrant default and let the RISK overlay pop.
  // BUT the prompt asked for SPECIFIC continent colors.
  // Let's use a hashed color generator based on the country name to give variety, 
  // OR just stick to a very bright default for landmass to ensure contrast against dark background.
  
  // Re-reading prompt: "North America: Bright Blue..." etc.
  // I'll implement a best-effort lookup for major countries to their continents to satisfy the visual style.
  
  const name = geo.properties.name;
  
  const na = ['United States', 'Canada', 'Mexico', 'Greenland', 'Cuba', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Jamaica', 'Dominican Republic', 'Haiti', 'Bahamas'];
  const sa = ['Brazil', 'Argentina', 'Peru', 'Colombia', 'Chile', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Venezuela', 'Guyana', 'Suriname', 'French Guiana'];
  const eu = ['Russia', 'Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Ukraine', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Czechia', 'Greece', 'Portugal', 'Sweden', 'Hungary', 'Belarus', 'Austria', 'Serbia', 'Switzerland', 'Bulgaria', 'Denmark', 'Finland', 'Slovakia', 'Norway', 'Ireland', 'Croatia', 'Moldova', 'Bosnia and Herz.', 'Albania', 'Lithuania', 'North Macedonia', 'Slovenia', 'Latvia', 'Estonia', 'Montenegro', 'Luxembourg', 'Malta', 'Iceland'];
  const af = ['Nigeria', 'Ethiopia', 'Egypt', 'Dr Congo', 'Tanzania', 'South Africa', 'Kenya', 'Uganda', 'Algeria', 'Sudan', 'Morocco', 'Angola', 'Mozambique', 'Ghana', 'Madagascar', 'Cameroon', 'Côte d\'Ivoire', 'Niger', 'Burkina Faso', 'Mali', 'Malawi', 'Zambia', 'Senegal', 'Chad', 'Somalia', 'Zimbabwe', 'Guinea', 'Rwanda', 'Benin', 'Burundi', 'Tunisia', 'South Sudan', 'Togo', 'Sierra Leone', 'Libya', 'Congo', 'Liberia', 'Central African Rep.', 'Mauritania', 'Eritrea', 'Namibia', 'Gambia', 'Botswana', 'Gabon', 'Lesotho', 'Guinea-Bissau', 'Equatorial Guinea', 'Mauritius', 'Eswatini', 'Djibouti', 'Comoros', 'Cabo Verde', 'São Tomé and Principe'];
  const as = ['China', 'India', 'Indonesia', 'Pakistan', 'Bangladesh', 'Japan', 'Philippines', 'Vietnam', 'Turkey', 'Iran', 'Thailand', 'Myanmar', 'South Korea', 'Iraq', 'Afghanistan', 'Saudi Arabia', 'Uzbekistan', 'Malaysia', 'Yemen', 'Nepal', 'North Korea', 'Sri Lanka', 'Kazakhstan', 'Syria', 'Cambodia', 'Jordan', 'Azerbaijan', 'United Arab Emirates', 'Tajikistan', 'Israel', 'Laos', 'Lebanon', 'Kyrgyzstan', 'Turkmenistan', 'Singapore', 'Oman', 'Palestine', 'Kuwait', 'Georgia', 'Mongolia', 'Armenia', 'Qatar', 'Bahrain', 'Timor-Leste', 'Cyprus', 'Bhutan', 'Maldives', 'Brunei'];
  const oc = ['Australia', 'Papua New Guinea', 'New Zealand', 'Fiji', 'Solomon Islands', 'Micronesia', 'Vanuatu', 'Samoa', 'Kiribati', 'Tonga', 'Marshall Islands', 'Palau', 'Tuvalu', 'Nauru'];
  
  if (na.includes(name)) return "#1E90FF"; // Bright Blue
  if (sa.includes(name)) return "#00FF00"; // Bright Green
  if (eu.includes(name)) return "#FFD700"; // Bright Yellow
  if (af.includes(name)) return "#FF8C00"; // Bright Orange
  if (as.includes(name)) return "#00FFFF"; // Bright Cyan
  if (oc.includes(name)) return "#FF1493"; // Bright Magenta
  if (name === 'Antarctica') return "#FFFFFF"; // Bright White
  
  return "#D3D3D3"; // Fallback Light Gray
};

export default function WorldHeatmap() {
  const { currentOrganization } = useHSE();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const [content, setContent] = useState("");
  const [filterType, setFilterType] = useState('All');

  const loadData = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const result = await worldHeatmapService.getWorldHeatmapData(currentOrganization.id);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentOrganization]);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

  const getCountryFill = (geo) => {
    const countryData = data.find(d => d.id === geo.id || d.name === geo.properties.name);
    
    // Priority: Risk Level Color -> Continent Base Color
    if (countryData && countryData.riskLevel && RISK_COLOR_MAP[countryData.riskLevel]) {
      return RISK_COLOR_MAP[countryData.riskLevel];
    }
    
    return getContinentColor(geo);
  };

  return (
    <Card className="bg-[#1e1e30] border-[#2a2a40] shadow-xl overflow-hidden w-full">
      <CardHeader className="border-b border-[#2a2a40] pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#FFC107]" />
              Global Operations Risk Map
            </CardTitle>
            <CardDescription className="text-gray-400">
              Live visualization of site risks and active incidents. High visibility mode.
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] bg-[#252541] border-[#3a3a5a] h-9 text-xs text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Health">Health & Safety</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadData} className="h-9 w-9 p-0 bg-[#252541] border-[#3a3a5a]">
              <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-[#252541] border-[#3a3a5a]">
              <Download className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Map Container - Light Background specifically for the map part to enhance contrast of countries */}
      <CardContent className="p-0 relative h-[600px] w-full bg-[#f0f4f8]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <Skeleton className="w-[80%] h-[80%] rounded-xl bg-gray-200" />
          </div>
        )}

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Button variant="secondary" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0 bg-white border border-gray-300 text-black hover:bg-gray-100 shadow-md">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0 bg-white border border-gray-300 text-black hover:bg-gray-100 shadow-md">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleReset} className="h-auto px-2 py-1 text-[10px] bg-white border border-gray-300 text-black hover:bg-gray-100 shadow-md">
            Reset
          </Button>
        </div>

        {/* Interactive Map */}
        <ComposableMap 
          projection="geoMercator" 
          projectionConfig={{ scale: 140 }}
          className="w-full h-full bg-[#E6F3F7]" // Light Blue Ocean Color
        >
          <ZoomableGroup 
            zoom={position.zoom} 
            center={position.coordinates} 
            onMoveEnd={setPosition}
            maxZoom={4}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryData = data.find(d => d.id === geo.id || d.name === geo.properties.name);
                  const fillColor = getCountryFill(geo);
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#000000" // Black borders for maximum contrast
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 250ms" },
                        hover: { fill: countryData ? "#FFFFFF" : "#cccccc", strokeWidth: 1, outline: "none", cursor: "pointer" },
                        pressed: { fill: "#FFC107", outline: "none" }
                      }}
                      onMouseEnter={() => {
                        if (countryData) {
                          setContent(`
                            <div class="text-xs font-bold mb-1">${countryData.name}</div>
                            <div class="text-[10px]">Active Incidents: <span class="text-[#FFC107] font-bold">${countryData.total}</span></div>
                            <div class="text-[10px]">Risk Level: <span class="font-bold" style="color:${RISK_COLOR_MAP[countryData.riskLevel] || '#fff'}">${countryData.riskLevel}</span></div>
                          `);
                        } else {
                          setContent(`<div class="text-xs font-bold">${geo.properties.name}</div>`);
                        }
                      }}
                      onMouseLeave={() => {
                        setContent("");
                      }}
                    />
                  );
                })
              }
            </Geographies>
            
            {/* Markers for specific data points if needed - using high contrast colors */}
            {data.map((country, i) => (
               country.incidents.length > 5 && (
                 <Marker key={i} coordinates={[0, 0]}> 
                   {/* Centroid marker logic would go here */}
                 </Marker>
               )
            ))}

          </ZoomableGroup>
        </ComposableMap>
        
        <ReactTooltip 
          id="map-tooltip" 
          float 
          html={content}
          className="z-50 bg-black text-white opacity-100 p-2 rounded shadow-lg border border-gray-700"
        />

        {/* Legend - Updated for Visibility */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-gray-300 p-3 rounded-lg flex flex-col gap-2 shadow-xl">
          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1 border-b border-gray-200 pb-1">Risk Severity</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#8B0000] border border-black/20"></span>
            <span className="text-[10px] text-gray-800 font-medium">Critical (10+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#FF0000] border border-black/20"></span>
            <span className="text-[10px] text-gray-800 font-medium">High (5-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#FFA500] border border-black/20"></span>
            <span className="text-[10px] text-gray-800 font-medium">Medium (2-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#FFFF00] border border-black/20"></span>
            <span className="text-[10px] text-gray-800 font-medium">Low (1)</span>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-200">
             <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1 block">Continents</span>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1E90FF]"></span> <span className="text-[9px] text-gray-600">N. America</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00FF00]"></span> <span className="text-[9px] text-gray-600">S. America</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FFD700]"></span> <span className="text-[9px] text-gray-600">Europe</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF8C00]"></span> <span className="text-[9px] text-gray-600">Africa</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00FFFF]"></span> <span className="text-[9px] text-gray-600">Asia</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF1493]"></span> <span className="text-[9px] text-gray-600">Australia</span></div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}