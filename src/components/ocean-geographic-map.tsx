import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Globe, Waves, Thermometer, Anchor, Info } from "lucide-react";
import { useState } from "react";

interface DeepSeaSample {
  clusterId: string;
  classification: string;
  locations: {
    latitude: number;
    longitude: number;
    depth: number;
    temperature: number;
    region: string;
    ecosystem: string;
    abundance: number;
    site: string;
  }[];
}

interface OceanGeographicMapProps {
  data: DeepSeaSample[];
  isLoading: boolean;
}

export function OceanGeographicMap({ data, isLoading }: OceanGeographicMapProps) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [depthFilter, setDepthFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Deep Sea Distribution Analysis
          </CardTitle>
          <CardDescription>
            Global marine biodiversity across oceanic depth zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] bg-muted/20 rounded animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading oceanographic data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ocean regions with proper coordinates
  const oceanRegions = [
    // Atlantic Ocean
    { name: "North Atlantic", x: 30, y: 35, width: 25, height: 20, color: "#1e40af" },
    { name: "South Atlantic", x: 30, y: 55, width: 20, height: 25, color: "#1e3a8a" },
    
    // Pacific Ocean
    { name: "North Pacific", x: 65, y: 25, width: 30, height: 25, color: "#1d4ed8" },
    { name: "South Pacific", x: 65, y: 50, width: 30, height: 30, color: "#1e3a8a" },
    
    // Indian Ocean
    { name: "Indian Ocean", x: 50, y: 60, width: 25, height: 20, color: "#2563eb" },
    
    // Arctic Ocean
    { name: "Arctic Ocean", x: 40, y: 10, width: 20, height: 15, color: "#1e3a8a" },
    
    // Antarctic Ocean
    { name: "Antarctic Ocean", x: 20, y: 80, width: 60, height: 10, color: "#172554" }
  ];

  // Continental outlines (simplified)
  const continents = [
    // North America
    { name: "North America", x: 15, y: 25, width: 20, height: 25 },
    // South America
    { name: "South America", x: 20, y: 50, width: 12, height: 25 },
    // Europe
    { name: "Europe", x: 45, y: 25, width: 8, height: 10 },
    // Africa
    { name: "Africa", x: 45, y: 35, width: 12, height: 25 },
    // Asia
    { name: "Asia", x: 53, y: 15, width: 25, height: 25 },
    // Australia
    { name: "Australia", x: 75, y: 65, width: 10, height: 8 },
    // Antarctica
    { name: "Antarctica", x: 30, y: 85, width: 40, height: 8 }
  ];

  const getDepthColor = (depth: number) => {
    if (depth < 200) return "#06b6d4"; // Epipelagic - cyan
    if (depth < 1000) return "#0891b2"; // Mesopelagic - darker cyan
    if (depth < 4000) return "#0e7490"; // Bathypelagic - dark cyan
    if (depth < 6000) return "#155e75"; // Abyssopelagic - very dark cyan
    return "#164e63"; // Hadalpelagic - deepest
  };

  const getDepthZone = (depth: number) => {
    if (depth < 200) return "Epipelagic";
    if (depth < 1000) return "Mesopelagic";
    if (depth < 4000) return "Bathypelagic";
    if (depth < 6000) return "Abyssopelagic";
    return "Hadalpelagic";
  };

  const filteredData = depthFilter === "all" ? data : data.map(cluster => ({
    ...cluster,
    locations: cluster.locations.filter(loc => {
      switch (depthFilter) {
        case "shallow": return loc.depth < 1000;
        case "deep": return loc.depth >= 1000 && loc.depth < 4000;
        case "abyssal": return loc.depth >= 4000;
        default: return true;
      }
    })
  })).filter(cluster => cluster.locations.length > 0);

  const selectedData = selectedCluster ? filteredData.find(d => d.clusterId === selectedCluster) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          Deep Sea Distribution Analysis
        </CardTitle>
        <CardDescription>
          Global marine biodiversity across oceanic depth zones and ecosystems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">Depth Filter:</span>
            <Select value={depthFilter} onValueChange={setDepthFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depths</SelectItem>
                <SelectItem value="shallow">Shallow (&lt;1000m)</SelectItem>
                <SelectItem value="deep">Deep (1000-4000m)</SelectItem>
                <SelectItem value="abyssal">Abyssal (&gt;4000m)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* World Ocean Map */}
        <div className="bg-slate-950 rounded-lg p-6 overflow-auto">
          <svg viewBox="0 0 100 90" className="w-full h-96">
            {/* Ocean Background */}
            <rect width="100" height="90" fill="#0f172a" />
            
            {/* Ocean Regions */}
            {oceanRegions.map((ocean) => (
              <rect
                key={ocean.name}
                x={ocean.x}
                y={ocean.y}
                width={ocean.width}
                height={ocean.height}
                fill={ocean.color}
                opacity="0.6"
                stroke="#1e40af"
                strokeWidth="0.1"
              />
            ))}
            
            {/* Continental Outlines */}
            {continents.map((continent) => (
              <rect
                key={continent.name}
                x={continent.x}
                y={continent.y}
                width={continent.width}
                height={continent.height}
                fill="#374151"
                stroke="#6b7280"
                strokeWidth="0.1"
              />
            ))}

            {/* Depth Zone Grid */}
            <defs>
              <pattern id="depthGrid" patternUnits="userSpaceOnUse" width="5" height="5">
                <path d="M 5 0 L 0 5" stroke="#1e40af" strokeWidth="0.1" opacity="0.3"/>
              </pattern>
            </defs>
            
            {/* Mid-Ocean Ridges */}
            <path
              d="M 30 40 Q 50 45 70 35 Q 80 30 90 40"
              stroke="#10b981"
              strokeWidth="0.3"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 25 60 Q 45 65 65 55"
              stroke="#10b981"
              strokeWidth="0.3"
              fill="none"
              opacity="0.7"
            />

            {/* Deep Sea Trenches */}
            <path
              d="M 85 35 L 87 45"
              stroke="#ef4444"
              strokeWidth="0.4"
              opacity="0.8"
            />
            <path
              d="M 75 65 L 77 70"
              stroke="#ef4444"
              strokeWidth="0.4"
              opacity="0.8"
            />

            {/* Sample Points */}
            {filteredData.flatMap(cluster => 
              cluster.locations.map((location, idx) => {
                const x = ((location.longitude + 180) / 360) * 100;
                const y = ((90 - location.latitude) / 180) * 90;
                const isSelected = selectedCluster === cluster.clusterId;
                
                return (
                  <g key={`${cluster.clusterId}-${idx}`}>
                    {/* Depth indicator ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill="none"
                      stroke={getDepthColor(location.depth)}
                      strokeWidth="0.3"
                      opacity="0.6"
                    />
                    {/* Sample point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? "1" : "0.7"}
                      fill={getDepthColor(location.depth)}
                      stroke={isSelected ? "#fbbf24" : "#ffffff"}
                      strokeWidth={isSelected ? "0.3" : "0.1"}
                      className="cursor-pointer hover:r-1 transition-all"
                      onClick={() => setSelectedCluster(cluster.clusterId)}
                    />
                    {/* Abundance indicator */}
                    <circle
                      cx={x}
                      cy={y}
                      r={Math.max(0.3, Math.min(2, location.abundance / 5000))}
                      fill="#10b981"
                      opacity="0.3"
                      className="pointer-events-none"
                    />
                  </g>
                );
              })
            )}

            {/* Ocean Labels */}
            {oceanRegions.map((ocean) => (
              <text
                key={`${ocean.name}-label`}
                x={ocean.x + ocean.width/2}
                y={ocean.y + ocean.height/2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-cyan-300 text-xs pointer-events-none"
                fontSize="1.5"
                opacity="0.7"
              >
                {ocean.name}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Depth Zones Legend */}
          <div>
            <h4 className="text-emerald-400 mb-3 flex items-center gap-2">
              <Anchor className="w-4 h-4" />
              Depth Zones
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#06b6d4" }}></div>
                <span>Epipelagic (0-200m)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#0891b2" }}></div>
                <span>Mesopelagic (200-1000m)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#0e7490" }}></div>
                <span>Bathypelagic (1000-4000m)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#155e75" }}></div>
                <span>Abyssopelagic (4000-6000m)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#164e63" }}></div>
                <span>Hadalpelagic (&gt;6000m)</span>
              </div>
            </div>
          </div>

          {/* Features Legend */}
          <div>
            <h4 className="text-emerald-400 mb-3">Oceanic Features</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-emerald-500"></div>
                <span>Mid-Ocean Ridges</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500"></div>
                <span>Deep Sea Trenches</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full opacity-30"></div>
                <span>Abundance (size = density)</span>
              </div>
            </div>
          </div>

          {/* Cluster Selection */}
          <div>
            <h4 className="text-emerald-400 mb-3">Taxa Clusters</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {filteredData.slice(0, 6).map((cluster) => (
                <div
                  key={cluster.clusterId}
                  className={`p-2 rounded border cursor-pointer transition-colors text-xs ${
                    selectedCluster === cluster.clusterId 
                      ? 'border-emerald-400 bg-emerald-500/10' 
                      : 'border-border hover:border-emerald-400/50'
                  }`}
                  onClick={() => setSelectedCluster(cluster.clusterId)}
                >
                  <div className="flex items-center justify-between">
                    <span>{cluster.clusterId}</span>
                    <Badge variant="outline" className="text-xs">
                      {cluster.locations.length} sites
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Site Details */}
        {selectedData && (
          <div className="border border-border rounded-lg p-4 bg-card/50">
            <h4 className="text-emerald-400 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {selectedData.clusterId} - Environmental Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedData.locations.map((location, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="font-medium text-sm">{location.site}</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span>{location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Depth:</span>
                      <span>{location.depth}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Zone:</span>
                      <span>{getDepthZone(location.depth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span>{location.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ecosystem:</span>
                      <span>{location.ecosystem}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Abundance:</span>
                      <span className="text-emerald-400">{location.abundance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Sites</p>
            <p className="text-lg text-emerald-400">
              {filteredData.reduce((sum, cluster) => sum + cluster.locations.length, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Depth Range</p>
            <p className="text-lg text-emerald-400">
              {Math.min(...filteredData.flatMap(d => d.locations.map(l => l.depth)))} - 
              {Math.max(...filteredData.flatMap(d => d.locations.map(l => l.depth)))}m
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Temp Range</p>
            <p className="text-lg text-emerald-400">
              {Math.min(...filteredData.flatMap(d => d.locations.map(l => l.temperature))).toFixed(1)} - 
              {Math.max(...filteredData.flatMap(d => d.locations.map(l => l.temperature))).toFixed(1)}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Ecosystems</p>
            <p className="text-lg text-emerald-400">
              {new Set(filteredData.flatMap(d => d.locations.map(l => l.ecosystem))).size}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}