import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Globe } from "lucide-react";
import { useState } from "react";

interface GeographicData {
  clusterId: string;
  classification: string;
  locations: {
    latitude: number;
    longitude: number;
    region: string;
    abundance: number;
  }[];
}

interface GeographicMapProps {
  data: GeographicData[];
  isLoading: boolean;
}

export function GeographicMap({ data, isLoading }: GeographicMapProps) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>
            Global occurrence patterns of identified taxa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted/20 rounded animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading geographic data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simple world map representation with regions
  const worldRegions = [
    { name: "North America", x: 20, y: 30, width: 25, height: 15 },
    { name: "South America", x: 25, y: 50, width: 15, height: 25 },
    { name: "Europe", x: 50, y: 25, width: 15, height: 10 },
    { name: "Africa", x: 50, y: 35, width: 15, height: 25 },
    { name: "Asia", x: 65, y: 20, width: 25, height: 25 },
    { name: "Australia", x: 75, y: 60, width: 12, height: 8 },
    { name: "Antarctica", x: 35, y: 75, width: 30, height: 8 }
  ];

  const getRegionData = (regionName: string) => {
    const regionData = data.flatMap(cluster => 
      cluster.locations
        .filter(loc => loc.region === regionName)
        .map(loc => ({ ...loc, clusterId: cluster.clusterId, classification: cluster.classification }))
    );
    return regionData;
  };

  const getRegionColor = (regionName: string) => {
    const regionData = getRegionData(regionName);
    if (regionData.length === 0) return "#374151";
    
    const totalAbundance = regionData.reduce((sum, item) => sum + item.abundance, 0);
    const intensity = Math.min(totalAbundance / 1000, 1); // Normalize to 0-1
    
    return `rgba(16, 185, 129, ${0.3 + intensity * 0.7})`;
  };

  const selectedData = selectedCluster ? data.find(d => d.clusterId === selectedCluster) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          Geographic Distribution
        </CardTitle>
        <CardDescription>
          Global occurrence patterns of identified taxa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* World Map */}
        <div className="bg-slate-900 rounded-lg p-4">
          <svg viewBox="0 0 100 85" className="w-full h-64">
            {/* Ocean background */}
            <rect width="100" height="85" fill="#1e293b" />
            
            {/* Continents */}
            {worldRegions.map((region) => (
              <g key={region.name}>
                <rect
                  x={region.x}
                  y={region.y}
                  width={region.width}
                  height={region.height}
                  fill={getRegionColor(region.name)}
                  stroke="#10b981"
                  strokeWidth="0.2"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => {
                    const regionData = getRegionData(region.name);
                    if (regionData.length > 0) {
                      setSelectedCluster(regionData[0].clusterId);
                    }
                  }}
                />
                <text
                  x={region.x + region.width/2}
                  y={region.y + region.height/2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-xs pointer-events-none"
                  fontSize="2"
                >
                  {region.name}
                </text>
                
                {/* Distribution points */}
                {getRegionData(region.name).map((point, idx) => (
                  <circle
                    key={idx}
                    cx={region.x + (point.longitude + 180) / 360 * region.width}
                    cy={region.y + (90 - point.latitude) / 180 * region.height}
                    r="0.8"
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth="0.1"
                    className="cursor-pointer"
                    onClick={() => setSelectedCluster(point.clusterId)}
                  />
                ))}
              </g>
            ))}
          </svg>
        </div>

        {/* Controls and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cluster Selection */}
          <div>
            <h4 className="text-emerald-400 mb-3">Taxa Clusters</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.slice(0, 8).map((cluster) => (
                <div
                  key={cluster.clusterId}
                  className={`p-2 rounded border cursor-pointer transition-colors ${
                    selectedCluster === cluster.clusterId 
                      ? 'border-emerald-400 bg-emerald-500/10' 
                      : 'border-border hover:border-emerald-400/50'
                  }`}
                  onClick={() => setSelectedCluster(cluster.clusterId)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{cluster.clusterId}</span>
                    <Badge variant="outline" className="text-xs">
                      {cluster.locations.length} sites
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {cluster.classification}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Cluster Details */}
          <div>
            <h4 className="text-emerald-400 mb-3">
              {selectedData ? `${selectedData.clusterId} Details` : 'Select a Cluster'}
            </h4>
            {selectedData ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Classification:</span>
                  <p className="text-sm">{selectedData.classification}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Distribution:</span>
                  <div className="space-y-1 mt-2">
                    {selectedData.locations.map((location, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{location.region}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {location.abundance} individuals
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Global Abundance:</span>
                  <p className="text-emerald-400">
                    {selectedData.locations.reduce((sum, loc) => sum + loc.abundance, 0).toLocaleString()} individuals
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click on a cluster or region to view distribution details
              </p>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-emerald-500 rounded"></div>
            <span>Abundance: Low → High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Sample Location</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}