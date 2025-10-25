import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const flowchartCode = `flowchart TD
    %% User Entry Points
    A[User Opens App] --> B{Authentication Check}
    B -->|Not Authenticated| C[Login Modal]
    B -->|Authenticated| D[Main App Interface]

    %% Authentication Flow
    C --> E[Firebase Auth]
    E --> F{Login Success?}
    F -->|Yes| G[Create/Update User in PostgreSQL]
    F -->|No| C
    G --> H[Load User Profile & Preferences]
    H --> D

    %% Main App Structure
    D --> I[Tab Navigation]
    I --> J[Routes Tab]
    I --> K[Saved Tab]
    I --> L[Activity Tab]
    I --> M[Profile Tab]

    %% Routes Tab Flow
    J --> N[Load GTFS Data]
    N --> O[Load Fare Tables]
    O --> P[User Input: Origin & Destination]
    P --> Q{Search Type?}
    Q -->|Direct Route| R[Find Routes Between Stops]
    Q -->|Address Search| S[Find Nearest Stops]
    R --> T[Calculate Distance & Fare]
    S --> T
    T --> U[Display Route Options]
    U --> V{User Action?}
    V -->|Start Journey| W[Create Trip Record]
    V -->|Save Route| X[Save to Saved Routes]
    V -->|View Map| Y[Display Route Map]

    %% Trip Management
    W --> Z[Update User Points]
    Z --> AA[Track Active Trip]
    AA --> BB{Complete Trip?}
    BB -->|Yes| CC[Award 10 Points]
    BB -->|No| AA
    CC --> DD[Update Trip Statistics]

    %% Saved Routes Management
    K --> EE[Load User's Saved Routes]
    EE --> FF{User Action?}
    FF -->|Start Journey| GG[Dispatch Event to Routes Tab]
    FF -->|Delete Route| HH[Remove from Database]
    GG --> W

    %% Activity Tracking
    L --> II[Load Trip History]
    II --> JJ[Load Weekly Statistics]
    JJ --> KK[Display Activity Dashboard]
    KK --> LL{User Action?}
    LL -->|Complete Active Trip| MM[Mark Trip Complete]
    LL -->|View Trip Details| NN[Show Trip Information]
    MM --> CC

    %% Profile Management
    M --> OO[Load User Profile]
    OO --> PP{User Action?}
    PP -->|Update Profile| QQ[Save Profile Changes]
    PP -->|Upload ID Document| RR[Base64 Encode & Save]
    PP -->|Toggle Dark Mode| SS[Update Theme Preference]
    PP -->|Change Password| TT[Firebase Password Update]
    QQ --> UU[Update Database]
    RR --> VV[ID Verification Process]
    VV --> WW[Manager Review Required]

    %% Admin System
    WW --> XX[Manager Dashboard]
    XX --> YY{Admin Action?}
    YY -->|Approve ID| ZZ[Mark User as Verified]
    YY -->|Reject ID| AAA[Send Rejection Note]
    YY -->|View Statistics| BBB[Display Trip Analytics]

    %% CEO Dashboard
    CCC[CEO Dashboard] --> DDD[Executive Summary]
    CCC --> EEE[Route Demand Analysis]
    CCC --> FFF[Fare Analytics]
    DDD --> GGG[User Demographics]
    DDD --> HHH[Age Distribution Charts]
    EEE --> III[Popular Routes Ranking]
    FFF --> JJJ[Revenue Breakdown]

    %% Developer Dashboard
    KKK[Developer Dashboard] --> LLL[Push Notifications]
    KKK --> MMM[Database Monitoring]
    LLL --> NNN[Send Global Notifications]
    MMM --> OOO[PostgreSQL Health Metrics]
    MMM --> PPP[Neon Infrastructure Status]

    %% Backend API Layer
    QQQ[Netlify Functions] --> RRR[GTFS API]
    QQQ --> SSS[Fares API]
    QQQ --> TTT[Users API]
    QQQ --> UUU[Trips API]
    QQQ --> VVV[Saved Routes API]
    QQQ --> WWW[Push Notifications API]
    QQQ --> XXX[Database Stats API]
    QQQ --> YYY[Neon Metrics API]

    %% Database Layer
    ZZZ[(PostgreSQL Database)] --> AAAA[Users Table]
    ZZZ --> BBBB[User Trips Table]
    ZZZ --> CCCC[Saved Routes Table]
    ZZZ --> DDDD[Recent Searches Table]
    ZZZ --> EEEE[Verification History Table]
    ZZZ --> FFFF[Push Subscriptions Table]
    ZZZ --> GGGG[Global Notifications Table]
    ZZZ --> HHHH[GTFS Data Tables]

    %% External Services
    IIII[Firebase Auth] --> E
    JJJJ[GTFS Data Source] --> N
    KKKK[Neon Database] --> ZZZ
    LLLL[Web Push Service] --> NNN

    %% Data Flow Connections
    RRR --> ZZZ
    SSS --> ZZZ
    TTT --> ZZZ
    UUU --> ZZZ
    VVV --> ZZZ
    WWW --> ZZZ
    XXX --> ZZZ
    YYY --> KKKK

    %% Styling
    classDef userInterface fill:#e1f5fe
    classDef authentication fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef admin fill:#fff3e0
    classDef external fill:#fce4ec

    class A,B,C,D,I,J,K,L,M userInterface
    class E,F,G,H authentication
    class ZZZ,AAAA,BBBB,CCCC,DDDD,EEEE,FFFF,GGGG,HHHH database
    class XX,YY,ZZ,AAA,BBB,CCC,DDD,EEE,FFF,GGG,HHH,III,JJJ,KKK,LLL,MMM,NNN,OOO,PPP admin
    class IIII,JJJJ,KKKK,LLLL external`;

const SystemArchitecture: React.FC = () => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Watch for dark mode changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      // Initialize Mermaid with dark mode support
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default', // Always use default theme to preserve colors
        securityLevel: 'loose',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        themeVariables: {
          // Keep the pastel colors for boxes
          primaryColor: '#e1f5fe',
          primaryTextColor: isDarkMode ? '#000000' : '#000000',
          primaryBorderColor: '#0288d1',
          lineColor: isDarkMode ? '#d1d5db' : '#333333',
          secondaryColor: '#f3e5f5',
          tertiaryColor: '#e8f5e8',

          // Text colors - dark for boxes, will be overridden by CSS for visibility
          textColor: '#000000',
          nodeTextColor: '#000000',
          labelTextColor: '#000000',
          edgeLabelText: isDarkMode ? '#ffffff' : '#000000',

          // Background - transparent for dark mode
          background: 'transparent',
          mainBkg: '#e1f5fe',
          secondBkg: '#f3e5f5',
          tertiaryBkg: '#e8f5e8',

          // Edge labels
          edgeLabelBackground: isDarkMode ? '#1f2937' : '#ffffff',

          // Border colors
          nodeBorder: '#0288d1',
          clusterBorder: '#0288d1',
          defaultLinkColor: isDarkMode ? '#d1d5db' : '#333333',
        },
      });

      // Render the diagram
      if (mermaidRef.current) {
        try {
          mermaidRef.current.removeAttribute('data-processed');
          const { svg } = await mermaid.render('mermaid-diagram', flowchartCode);
          mermaidRef.current.innerHTML = svg;

          // Only force edge label text to white in dark mode
          if (isDarkMode && mermaidRef.current) {
            const svgElement = mermaidRef.current.querySelector('svg');
            if (svgElement) {
              // Keep node labels dark (readable on pastel backgrounds)
              const nodeLabels = svgElement.querySelectorAll('.nodeLabel, .nodeLabel text');
              nodeLabels.forEach(el => {
                (el as HTMLElement).style.fill = '#000000';
                (el as HTMLElement).style.color = '#000000';
              });

              // Make edge labels white (readable on dark background)
              const edgeLabels = svgElement.querySelectorAll('.edgeLabel, .edgeLabel text');
              edgeLabels.forEach(el => {
                (el as HTMLElement).style.fill = '#ffffff';
                (el as HTMLElement).style.color = '#ffffff';
              });
            }
          }
        } catch (error) {
          console.error('Error rendering mermaid diagram:', error);
          mermaidRef.current.innerHTML = `<div class="text-red-500 dark:text-red-400 p-4">Error rendering diagram: ${error}</div>`;
        }
      }
    };

    renderDiagram();
  }, [isDarkMode]);

  // Initial render on mount
  useEffect(() => {
    const initialRender = async () => {
      if (mermaidRef.current) {
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default', // Always use default theme to preserve colors
            securityLevel: 'loose',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
            },
            themeVariables: {
              // Keep the pastel colors for boxes
              primaryColor: '#e1f5fe',
              primaryTextColor: isDarkMode ? '#000000' : '#000000',
              primaryBorderColor: '#0288d1',
              lineColor: isDarkMode ? '#d1d5db' : '#333333',
              secondaryColor: '#f3e5f5',
              tertiaryColor: '#e8f5e8',

              // Text colors - dark for boxes
              textColor: '#000000',
              nodeTextColor: '#000000',
              labelTextColor: '#000000',
              edgeLabelText: isDarkMode ? '#ffffff' : '#000000',

              // Background - transparent for dark mode
              background: 'transparent',
              mainBkg: '#e1f5fe',
              secondBkg: '#f3e5f5',
              tertiaryBkg: '#e8f5e8',

              // Edge labels
              edgeLabelBackground: isDarkMode ? '#1f2937' : '#ffffff',

              // Border colors
              nodeBorder: '#0288d1',
              clusterBorder: '#0288d1',
              defaultLinkColor: isDarkMode ? '#d1d5db' : '#333333',
            },
          });

          mermaidRef.current.removeAttribute('data-processed');
          const { svg } = await mermaid.render('mermaid-diagram-init', flowchartCode);
          mermaidRef.current.innerHTML = svg;

          // Only force edge label text to white in dark mode
          if (isDarkMode && mermaidRef.current) {
            const svgElement = mermaidRef.current.querySelector('svg');
            if (svgElement) {
              // Keep node labels dark (readable on pastel backgrounds)
              const nodeLabels = svgElement.querySelectorAll('.nodeLabel, .nodeLabel text');
              nodeLabels.forEach(el => {
                (el as HTMLElement).style.fill = '#000000';
                (el as HTMLElement).style.color = '#000000';
              });

              // Make edge labels white (readable on dark background)
              const edgeLabels = svgElement.querySelectorAll('.edgeLabel, .edgeLabel text');
              edgeLabels.forEach(el => {
                (el as HTMLElement).style.fill = '#ffffff';
                (el as HTMLElement).style.color = '#ffffff';
              });
            }
          }
        } catch (error) {
          console.error('Error rendering mermaid diagram on init:', error);
        }
      }
    };

    initialRender();
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;

    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  };

  return (
    <div className="space-y-6">
      {/* Dark mode styles - only for edge labels */}
      {isDarkMode && (
        <style>{`
          /* Keep node text black on colored backgrounds */
          #mermaid-diagram svg .nodeLabel,
          #mermaid-diagram-init svg .nodeLabel,
          #mermaid-diagram svg .nodeLabel text,
          #mermaid-diagram-init svg .nodeLabel text {
            fill: #000000 !important;
            color: #000000 !important;
          }

          /* Make edge labels white for visibility on dark background */
          #mermaid-diagram svg .edgeLabel,
          #mermaid-diagram-init svg .edgeLabel,
          #mermaid-diagram svg .edgeLabel text,
          #mermaid-diagram-init svg .edgeLabel text {
            fill: #ffffff !important;
            color: #ffffff !important;
          }

          /* Ensure lines are visible */
          #mermaid-diagram svg path,
          #mermaid-diagram-init svg path {
            stroke: #d1d5db !important;
          }
        `}</style>
      )}
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              System Architecture
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Complete system architecture flowchart showing user flows, authentication, data management, and admin dashboards
            </p>
          </div>
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Reset Zoom"
            >
              <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Mermaid Diagram Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div
          ref={containerRef}
          className="overflow-hidden relative"
          style={{
            height: '800px',
            cursor: isPanning ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          <div
            ref={mermaidRef}
            className="flex justify-center items-center min-h-[600px] transition-none"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              willChange: 'transform'
            }}
          ></div>
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Click and drag to pan • Scroll to zoom • Use controls above for precise zoom
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 rounded" style={{ backgroundColor: '#e1f5fe' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">User Interface</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 rounded" style={{ backgroundColor: '#f3e5f5' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Authentication</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 rounded" style={{ backgroundColor: '#e8f5e8' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Database</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 rounded" style={{ backgroundColor: '#fff3e0' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Admin</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 rounded" style={{ backgroundColor: '#fce4ec' }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">External Services</span>
          </div>
        </div>
      </div>

      {/* Architecture Components Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            User Flows
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Authentication & Login</li>
            <li>• Route Planning & Search</li>
            <li>• Trip Management</li>
            <li>• Saved Routes</li>
            <li>• Activity Tracking</li>
            <li>• Profile Management</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Admin Dashboards
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Manager Dashboard (ID Verification)</li>
            <li>• CEO Dashboard (Analytics)</li>
            <li>• Developer Dashboard (Monitoring)</li>
            <li>• Push Notifications</li>
            <li>• Database Health</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Backend Services
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Netlify Functions API</li>
            <li>• PostgreSQL Database</li>
            <li>• Firebase Authentication</li>
            <li>• GTFS Data Processing</li>
            <li>• Neon Database Infrastructure</li>
            <li>• Web Push Service</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitecture;
