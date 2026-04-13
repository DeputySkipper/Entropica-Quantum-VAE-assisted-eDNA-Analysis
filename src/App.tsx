import { useState, useEffect } from "react";
import { DashboardHeader } from "./components/dashboard-header";
import { AnalysisControls } from "./components/analysis-controls";
import { SummaryCards } from "./components/summary-cards";
import { AbundanceChart } from "./components/abundance-chart";
import { TaxaTable } from "./components/taxa-table";
import { TaxonomicPieChart } from "./components/taxonomic-pie-chart";
import { SimilarityHeatmap } from "./components/similarity-heatmap";
import { VennDiagram } from "./components/venn-diagram";
import { OceanGeographicMap } from "./components/ocean-geographic-map";
import { PhylogeneticTree } from "./components/phylogenetic-tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

// Mock data for demonstration
const mockSummaryData = {
  totalSequences: 147832,
  taxaClusters: 23,
  novelTaxa: 4
};

const mockAbundanceData = [
  { clusterId: "CLU001", count: 35420, percentage: 23.97 },
  { clusterId: "CLU002", count: 28315, percentage: 19.15 },
  { clusterId: "CLU003", count: 22189, percentage: 15.01 },
  { clusterId: "CLU004", count: 18734, percentage: 12.67 },
  { clusterId: "CLU005", count: 15892, percentage: 10.75 },
  { clusterId: "CLU006", count: 12456, percentage: 8.43 },
  { clusterId: "CLU007", count: 8921, percentage: 6.03 },
  { clusterId: "CLU008", count: 3456, percentage: 2.34 },
  { clusterId: "CLU009", count: 1789, percentage: 1.21 },
  { clusterId: "CLU010", count: 634, percentage: 0.43 }
];

const mockTaxaData = [
  { clusterId: "CLU001", count: 35420, percentage: 23.97, classification: "Arthropoda sp.", novelTaxa: false },
  { clusterId: "CLU002", count: 28315, percentage: 19.15, classification: "Chordata sp.", novelTaxa: false },
  { clusterId: "CLU003", count: 22189, percentage: 15.01, classification: "Mollusca sp.", novelTaxa: false },
  { clusterId: "CLU004", count: 18734, percentage: 12.67, classification: "Cnidaria sp.", novelTaxa: true },
  { clusterId: "CLU005", count: 15892, percentage: 10.75, classification: "Porifera sp.", novelTaxa: false },
  { clusterId: "CLU006", count: 12456, percentage: 8.43, classification: "Echinodermata sp.", novelTaxa: false },
  { clusterId: "CLU007", count: 8921, percentage: 6.03, classification: "Annelida sp.", novelTaxa: true },
  { clusterId: "CLU008", count: 3456, percentage: 2.34, classification: "Platyhelminthes sp.", novelTaxa: false },
  { clusterId: "CLU009", count: 1789, percentage: 1.21, classification: "Unknown sp.", novelTaxa: true },
  { clusterId: "CLU010", count: 634, percentage: 0.43, classification: "Nemertea sp.", novelTaxa: false },
  { clusterId: "CLU011", count: 423, percentage: 0.29, classification: "Ctenophora sp.", novelTaxa: false },
  { clusterId: "CLU012", count: 312, percentage: 0.21, classification: "Bryozoa sp.", novelTaxa: false },
  { clusterId: "CLU013", count: 245, percentage: 0.17, classification: "Tardigrada sp.", novelTaxa: true },
  { clusterId: "CLU014", count: 198, percentage: 0.13, classification: "Rotifera sp.", novelTaxa: false },
  { clusterId: "CLU015", count: 156, percentage: 0.11, classification: "Gastrotricha sp.", novelTaxa: false },
  { clusterId: "CLU016", count: 134, percentage: 0.09, classification: "Kinorhyncha sp.", novelTaxa: false },
  { clusterId: "CLU017", count: 112, percentage: 0.08, classification: "Loricifera sp.", novelTaxa: false },
  { clusterId: "CLU018", count: 98, percentage: 0.07, classification: "Priapulida sp.", novelTaxa: false },
  { clusterId: "CLU019", count: 87, percentage: 0.06, classification: "Nematomorpha sp.", novelTaxa: false },
  { clusterId: "CLU020", count: 76, percentage: 0.05, classification: "Acanthocephala sp.", novelTaxa: false },
  { clusterId: "CLU021", count: 65, percentage: 0.04, classification: "Chaetognatha sp.", novelTaxa: false },
  { clusterId: "CLU022", count: 54, percentage: 0.04, classification: "Xenoturbella sp.", novelTaxa: false },
  { clusterId: "CLU023", count: 43, percentage: 0.03, classification: "Acoelomorpha sp.", novelTaxa: false }
];

// Additional mock data for new visualizations
const mockTaxonomicData = [
  { phylum: "Arthropoda", count: 35420, percentage: 23.97 },
  { phylum: "Chordata", count: 28315, percentage: 19.15 },
  { phylum: "Mollusca", count: 22189, percentage: 15.01 },
  { phylum: "Cnidaria", count: 18734, percentage: 12.67 },
  { phylum: "Porifera", count: 15892, percentage: 10.75 },
  { phylum: "Echinodermata", count: 12456, percentage: 8.43 },
  { phylum: "Annelida", count: 8921, percentage: 6.03 },
  { phylum: "Platyhelminthes", count: 3456, percentage: 2.34 },
  { phylum: "Other", count: 2449, percentage: 1.65 }
];

const mockSimilarityData = [
  { clusterA: "CLU001", clusterB: "CLU002", similarity: 87.3 },
  { clusterA: "CLU001", clusterB: "CLU003", similarity: 76.2 },
  { clusterA: "CLU001", clusterB: "CLU004", similarity: 45.8 },
  { clusterA: "CLU002", clusterB: "CLU003", similarity: 82.1 },
  { clusterA: "CLU002", clusterB: "CLU004", similarity: 52.3 },
  { clusterA: "CLU003", clusterB: "CLU004", similarity: 41.7 },
  { clusterA: "CLU001", clusterB: "CLU005", similarity: 68.9 },
  { clusterA: "CLU002", clusterB: "CLU005", similarity: 71.4 },
  { clusterA: "CLU003", clusterB: "CLU005", similarity: 79.6 },
  { clusterA: "CLU004", clusterB: "CLU005", similarity: 38.2 }
];

const mockVennData = {
  sampleA: ["CLU001", "CLU002", "CLU003", "CLU004", "CLU007", "CLU008", "CLU011"],
  sampleB: ["CLU001", "CLU002", "CLU005", "CLU006", "CLU009", "CLU010", "CLU012"],
  sampleC: ["CLU001", "CLU003", "CLU005", "CLU013", "CLU014", "CLU015", "CLU016"],
  sampleAName: "Coastal Site A",
  sampleBName: "Deep Sea Site B",
  sampleCName: "Reef Site C"
};

const mockDeepSeaData = [
  {
    clusterId: "CLU001",
    classification: "Arthropoda sp. (Deep-sea Amphipod)",
    locations: [
      { 
        latitude: 36.7372, longitude: -122.0015, depth: 3200, temperature: 1.8, 
        region: "North Pacific", ecosystem: "Abyssal Plain", abundance: 8500, 
        site: "Monterey Canyon Deep"
      },
      { 
        latitude: 42.3478, longitude: -41.0956, depth: 2800, temperature: 2.1, 
        region: "North Atlantic", ecosystem: "Mid-Atlantic Ridge", abundance: 6200, 
        site: "MAR Hydrothermal Field"
      },
      { 
        latitude: 30.1719, longitude: 157.9583, depth: 4200, temperature: 1.5, 
        region: "North Pacific", ecosystem: "Hadal Trench", abundance: 4100, 
        site: "Japan Trench Deep"
      }
    ]
  },
  {
    clusterId: "CLU002",
    classification: "Chordata sp. (Deep-sea Fish)",
    locations: [
      { 
        latitude: -35.2633, longitude: 149.1547, depth: 1800, temperature: 3.2, 
        region: "South Pacific", ecosystem: "Continental Slope", abundance: 4200, 
        site: "Tasman Abyssal Plain"
      },
      { 
        latitude: 59.9139, longitude: 10.7522, depth: 2200, temperature: 2.8, 
        region: "North Atlantic", ecosystem: "Norwegian Basin", abundance: 3800, 
        site: "Lofoten Basin Deep"
      },
      { 
        latitude: -54.4633, longitude: -36.5938, depth: 3800, temperature: 0.9, 
        region: "Antarctic Ocean", ecosystem: "Abyssal Plain", abundance: 2900, 
        site: "Scotia Sea Deep"
      }
    ]
  },
  {
    clusterId: "CLU003",
    classification: "Mollusca sp. (Deep-sea Gastropod)",
    locations: [
      { 
        latitude: -23.5505, longitude: -46.6333, depth: 2500, temperature: 2.4, 
        region: "South Atlantic", ecosystem: "Brazil Basin", abundance: 7200, 
        site: "Santos Basin Deep"
      },
      { 
        latitude: -20.2042, longitude: 57.5977, depth: 3600, temperature: 1.2, 
        region: "Indian Ocean", ecosystem: "Mascarene Basin", abundance: 4900, 
        site: "Mauritius Fracture Zone"
      },
      { 
        latitude: 14.5995, longitude: 120.9842, depth: 5200, temperature: 1.8, 
        region: "North Pacific", ecosystem: "Philippine Trench", abundance: 3100, 
        site: "Philippine Deep"
      }
    ]
  },
  {
    clusterId: "CLU004",
    classification: "Cnidaria sp. (Deep-sea Coral)",
    locations: [
      { 
        latitude: 26.0112, longitude: -88.2501, depth: 1200, temperature: 4.1, 
        region: "North Atlantic", ecosystem: "Cold Seep", abundance: 18734, 
        site: "Gulf of Mexico Deep"
      },
      { 
        latitude: -42.8821, longitude: 147.3272, depth: 1600, temperature: 3.8, 
        region: "South Pacific", ecosystem: "Seamount", abundance: 12400, 
        site: "Tasmania Seamount"
      }
    ]
  },
  {
    clusterId: "CLU005",
    classification: "Porifera sp. (Deep-sea Sponge)",
    locations: [
      { 
        latitude: 60.1282, longitude: 5.4107, depth: 800, temperature: 6.2, 
        region: "North Atlantic", ecosystem: "Continental Shelf", abundance: 15892, 
        site: "Norwegian Fjord Deep"
      },
      { 
        latitude: 36.2048, longitude: -5.6037, depth: 1400, temperature: 4.5, 
        region: "North Atlantic", ecosystem: "Gibraltar Ridge", abundance: 9800, 
        site: "Alboran Sea Deep"
      },
      { 
        latitude: -33.4489, longitude: 115.4611, depth: 2100, temperature: 2.9, 
        region: "Indian Ocean", ecosystem: "Perth Basin", abundance: 6400, 
        site: "Perth Canyon Deep"
      }
    ]
  },
  {
    clusterId: "CLU006",
    classification: "Echinodermata sp. (Deep-sea Urchin)",
    locations: [
      { 
        latitude: 11.3733, longitude: 142.5917, depth: 6200, temperature: 1.4, 
        region: "North Pacific", ecosystem: "Mariana Trench", abundance: 12456, 
        site: "Challenger Deep"
      },
      { 
        latitude: -5.8937, longitude: -35.2094, depth: 4800, temperature: 1.1, 
        region: "South Atlantic", ecosystem: "Romanche Fracture", abundance: 8900, 
        site: "Romanche Deep"
      }
    ]
  },
  {
    clusterId: "CLU007",
    classification: "Annelida sp. (Deep-sea Polychaete)",
    locations: [
      { 
        latitude: 21.3099, longitude: -157.8581, depth: 5800, temperature: 1.3, 
        region: "North Pacific", ecosystem: "Abyssal Hill", abundance: 8921, 
        site: "Hawaiian Deep"
      },
      { 
        latitude: -7.2906, longitude: 112.7378, depth: 3400, temperature: 1.9, 
        region: "Indian Ocean", ecosystem: "Java Basin", abundance: 5600, 
        site: "Java Trench"
      }
    ]
  },
  {
    clusterId: "CLU008",
    classification: "Platyhelminthes sp. (Deep-sea Turbellarian)",
    locations: [
      { 
        latitude: 37.7749, longitude: -25.6756, depth: 2700, temperature: 2.6, 
        region: "North Atlantic", ecosystem: "Azores Plateau", abundance: 3456, 
        site: "Azores Deep"
      }
    ]
  },
  {
    clusterId: "CLU009",
    classification: "Unknown sp. (Novel Deep-sea Organism)",
    locations: [
      { 
        latitude: -36.8485, longitude: 174.7633, depth: 7200, temperature: 1.1, 
        region: "South Pacific", ecosystem: "Kermadec Trench", abundance: 1789, 
        site: "Kermadec Deep"
      },
      { 
        latitude: -23.0965, longitude: -67.8093, depth: 6800, temperature: 1.0, 
        region: "South Atlantic", ecosystem: "Chile Trench", abundance: 892, 
        site: "Atacama Deep"
      }
    ]
  }
];

const mockPhylogeneticData = {
  id: "root",
  name: "Root",
  support: 100,
  children: [
    {
      id: "arthropoda_branch",
      name: "Arthropoda Branch",
      support: 95,
      children: [
        { id: "CLU001", name: "CLU001", classification: "Arthropoda sp.", isNovel: false, distance: 0.02 },
        { id: "CLU007", name: "CLU007", classification: "Annelida sp.", isNovel: true, distance: 0.08 }
      ]
    },
    {
      id: "deuterostome_branch",
      name: "Deuterostome Branch",
      support: 88,
      children: [
        { id: "CLU002", name: "CLU002", classification: "Chordata sp.", isNovel: false, distance: 0.03 },
        { id: "CLU006", name: "CLU006", classification: "Echinodermata sp.", isNovel: false, distance: 0.05 }
      ]
    },
    {
      id: "lophotrochozoa_branch",
      name: "Lophotrochozoa Branch",
      support: 92,
      children: [
        { id: "CLU003", name: "CLU003", classification: "Mollusca sp.", isNovel: false, distance: 0.04 },
        { id: "CLU008", name: "CLU008", classification: "Platyhelminthes sp.", isNovel: false, distance: 0.07 }
      ]
    },
    {
      id: "novel_branch",
      name: "Novel Branch",
      support: 76,
      children: [
        { id: "CLU009", name: "CLU009", classification: "Unknown sp.", isNovel: true, distance: 0.12 },
        { id: "CLU013", name: "CLU013", classification: "Tardigrada sp.", isNovel: true, distance: 0.15 }
      ]
    }
  ]
};

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setAnalysisComplete(false);
    
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      setAnalysisComplete(true);
    }, 3000);
  };

  // Auto-run analysis on component mount for demo
  useEffect(() => {
    setTimeout(() => {
      handleRunAnalysis();
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Analysis Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AnalysisControls onRunAnalysis={handleRunAnalysis} isAnalyzing={isAnalyzing} />
          </div>
          
          {/* Summary Cards */}
          <div className="lg:col-span-2">
            <SummaryCards 
              data={mockSummaryData} 
              isLoading={isAnalyzing || !analysisComplete} 
            />
          </div>
        </div>

        {/* Data Visualization Section */}
        {(showResults || isAnalyzing) && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="composition">Composition</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="geography">Geography</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Abundance Chart */}
              <AbundanceChart 
                data={mockAbundanceData} 
                isLoading={isAnalyzing} 
              />
              
              {/* Taxa Table */}
              <TaxaTable 
                data={mockTaxaData} 
                isLoading={isAnalyzing} 
              />
            </TabsContent>

            <TabsContent value="composition" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Taxonomic Pie Chart */}
                <TaxonomicPieChart 
                  data={mockTaxonomicData} 
                  isLoading={isAnalyzing} 
                />
                
                {/* Venn Diagram */}
                <VennDiagram 
                  data={mockVennData} 
                  isLoading={isAnalyzing} 
                />
              </div>
            </TabsContent>

            <TabsContent value="relationships" className="space-y-8">
              {/* Similarity Heatmap */}
              <SimilarityHeatmap 
                data={mockSimilarityData} 
                clusterIds={mockAbundanceData.map(d => d.clusterId)}
                isLoading={isAnalyzing} 
              />
              
              {/* Phylogenetic Tree */}
              <PhylogeneticTree 
                data={mockPhylogeneticData} 
                isLoading={isAnalyzing} 
              />
            </TabsContent>

            <TabsContent value="geography" className="space-y-8">
              {/* Ocean Geographic Map */}
              <OceanGeographicMap 
                data={mockDeepSeaData} 
                isLoading={isAnalyzing} 
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Welcome Message */}
        {!showResults && !isAnalyzing && (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-muted-foreground mb-4">
                Welcome to the ENTROPICA eDNA Analysis Platform
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Upload your environmental DNA sample data to begin comprehensive genomic sequence analysis. 
                Our advanced algorithms will identify taxa clusters, calculate relative abundance, and detect 
                potential novel species in your samples.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}