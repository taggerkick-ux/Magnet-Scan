import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Compass, 
  HelpCircle,
  Eye,
  Minimize2,
  Trash2,
  Info,
  Coins,
  Image
} from "lucide-react";
import { ScanResult } from "./types";

// Dynamic preset magnet-fishing finds to let users try the application instantly.
const DETECTOR_PRESETS = [
  {
    id: "mortier",
    naam: "WW2 Duitse Mortiergranaat (8cm GrW 34)",
    label: "💣 Mortiergranaat",
    imageUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=600&q=80", // heavy industrial metal texture
    resultaat: {
      vondstType: "Militaria (Explosieven)",
      naam: "Duitse Werpergranaat 34 (8 cm)",
      gevaarlijk: true,
      beschrijving: "Dit betreft een zwaar gecorrodeerde brisantgranaat gelanceerd uit een Duitse mortier tijdens de Tweede Wereldoorlog. Ondanks het verblijf van meer dan 80 jaar onderwater en een dikke laag ijzerhydroxide (roest) en rivierslib, is de karakteristieke druppelvorm met staartvinnen herkenbaar. De detonator (ontsteker) in de neus kan door de inwerking van zuurstof en beweging uiterst onstabiel zijn geworden en spontaan afgaan.",
      roestNiveau: "Extreem" as const,
      historischeSchatting: "Tweede Wereldoorlog (~1943)",
      materiaal: "Gietijzer en TNT vulling",
      tips: [
        "⚠ RAAK HET OBJECT NIET VERDER AAN. Leg het voorzichtig terug onder water of laat het roerloos op de kant liggen.",
        "📱 Bel direct de politie via 0900-8844 (of spoed 112). Meld dat u waarschijnlijk een mortiergranaat heeft opgevist.",
        "🚶 Neem afstand (minimaal 50 meter) en zorg dat voorbijgangers en andere magneetvissers niet in de buurt komen.",
        "📍 Houd de exacte locatie bij de hand voor de Explosieven Opruimingsdienst Defensie (EOD)."
      ],
      geschatteWaarde: "Geen commerciële waarde (Levensgevaarlijk & illegaal bezit - Direct melden bij de autoriteiten!)"
    }
  },
  {
    id: "kluis",
    naam: "Oude Stalen Brandkast / Documentenkluis",
    label: "💼 Metalen Kluis",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80", // rustic steel safe
    resultaat: {
      vondstType: "Gereedschap & Beveiliging",
      naam: "Kamerbrandkast (Begin 20e Eeuw)",
      gevaarlijk: false,
      beschrijving: "Een zwaar dubbelwandig stalen dossierkluisje met mechanisch cijfer- of sleutelslot. Het voorwerp is overdekt met een dichte korst van rivierzand and ijzerroest. Het gewicht is aanzienlijk. Dergelijke kluisjes werden vaak na diefstal in kanalen of rivieren gedumpt.",
      roestNiveau: "Gemiddeld" as const,
      historischeSchatting: "Midden 20e eeuw (~1950-1970)",
      materiaal: "Staal & Brandvertragend cementvulling",
      tips: [
        "Inspecteer de achterzijde op eventuele inbraaksporen of slijptolinsneden.",
        "Gebruik een messingborstel om de slotplaat voorzichtig vrij te maken van slib.",
        "Als de kluis nog gesloten is, kan er nog inhoud inzitten. Neem bij twijfel contact op met de lokale autoriteiten.",
        "Gebruik kruipolie (WD-40) gedurende enkele dagen om de scharnieren los te weken."
      ],
      geschatteWaarde: "€ 40 - € 150 (Afhankelijk van herstelbaarheid en eventuele historische of fysieke inhoud)"
    }
  },
  {
    id: "revolver",
    naam: "Verroest Vuurwapen (Revolver)",
    label: "🔫 Verroest Vuurwapen",
    imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80", // rusted firearm/rusty tool metal
    resultaat: {
      vondstType: "Militaria (Vuurwapens)",
      naam: "Lefaucheux-stijl Penvuurrevolver of vroege Service Revolver",
      gevaarlijk: true,
      beschrijving: "Dit is een antiek vuurwapen (revolver), vermoedelijk daterend uit de late 19e eeuw of begin 20e eeuw. De trommel en loop zijn volledig samengegroeid met ijzeroxiden. Ondanks de historische waarde is dit wettelijk een vuurwapen en kan er nog scherpe munitie in de trommelkamers zitten.",
      roestNiveau: "Extreem" as const,
      historischeSchatting: "Laat-19e of vroeg-20e eeuw",
      materiaal: "Smeedijzer en staal",
      tips: [
        "⚠ LET OP: Het bezit en vervoer van vuurwapens (ook antiek en onklaar door roest) is in Nederland ten strengste verboden zonder verlof.",
        "📞 Meld de vondst onmiddellijk bij de politie (0900-8844). Zij zullen het wapen ophalen en registreren.",
        "Probeer niet om de trommel geforceerd te openen of de munitie te verwijderen; dit kan een ontploffing veroorzaken."
      ],
      geschatteWaarde: "Geen commerciële waarde (Wettelijk verboden te verhandelen of bezitten zonder vergunning)"
    }
  },
  {
    id: "hoefijzer",
    naam: "Romeins of Middeleeuws Hoefijzer",
    label: "🐎 Antiek Hoefijzer",
    imageUrl: "https://images.unsplash.com/photo-1599740831118-b74e4fe85f23?auto=format&fit=crop&w=600&q=80", // antique iron horseshoe
    resultaat: {
      vondstType: "Historische Varia",
      naam: "Ambachtelijk Gesmeed Hoefijzer (Laat-Middeleeuws)",
      gevaarlijk: false,
      beschrijving: "Een handgesmeed ijzeren hoefijzer met herkenbare diepe gaten voor de hoefnagels. Door de anaerobe modderbodem is het ijzer relatief goed bewaard gebleven, al is er sprake van gelaagde schilferige roestcorrosie (magnetietlaag). Het ontbreken van een kalkoen (de opstaande lip aan de achterzijde) wijst op een vroege datering.",
      roestNiveau: "Laag" as const,
      historischeSchatting: "15e - 17e eeuw",
      materiaal: "Smeedijzer",
      tips: [
        "Leg de vondst na reiniging in een gedemineraliseerd waterbad om zouten te extraheren en verdere corrosie te stoppen.",
        "Gebruik een milde elektrolyse-behandeling om de dikke zwarte oxidehuid gecontroleerd te verwijderen.",
        "Conserveer het ijzer nadien met microkristallijne was (Cosmolid of micro-was) om blootstelling aan lucht te vermijden."
      ],
      geschatteWaarde: "€ 15 - € 35 (Historische verzamelaarswaarde na vakkundige conservering en ontzilting)"
    }
  }
];

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when component unmounts or view changes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
        setResult(null);
        setError(null);
        // Turn off camera if active
        stopCamera();
      }
    };
    reader.onerror = () => {
      setError("Fout bij het inlezen van het bestand.");
    };
    reader.readAsDataURL(file);
  };

  // Start back/front camera
  const startCamera = async () => {
    setError(null);
    setSelectedImage(null);
    setResult(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // prefer back camera on phones
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      // Fallback: try default video stream
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        setCameraStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play();
        }
      } catch (fallbackErr) {
        setError("Camera kon niet worden gestart. Controleer camera-permissies of upload een foto.");
        setIsCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        // Set canvas to video size
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Horizontal flip if it's typical front camera, but for detector mostly back is used.
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
        setImageMimeType("image/jpeg");
        stopCamera();
      }
    }
  };

  // Trigger analysis
  const executeScan = async (usePresetResult?: ScanResult) => {
    if (!selectedImage && !usePresetResult) {
      setError("Kies eerst een foto of maak een camera opname.");
      return;
    }

    setIsScanning(true);
    setResult(null);
    setError(null);

    // Beautiful step-by-step scanner visualization simulation
    const steps = [
      "Magnetisch inductiesignaal kalibreren...",
      "Roestmorfologie analyseren & oxidehuid penetreren...",
      "Structurele contouren vergelijken met militaria-database...",
      "Geometrie opmeten en materiaal-densiteit inschatten...",
      "Screenen op explosief- en munitiegevaar...",
      "Eindrapport genereren..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, i === 4 ? 900 : 500));
    }

    // If a preset was selected, we can bypass the backend call to avoid quota or API key issues.
    if (usePresetResult) {
      setResult(usePresetResult);
      setIsScanning(false);
      return;
    }

    try {
      // Clean up base64 prefix
      const base64Data = selectedImage!.split(",")[1];
      
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: imageMimeType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server fout (${response.status})`);
      }

      const data: ScanResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(
        `AI Analyse mislukt: ${err.message || "Onbekende fout"}. Probeer het opnieuw.`
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Preset quick analysis helper
  const handleSelectPreset = (preset: typeof DETECTOR_PRESETS[0]) => {
    stopCamera();
    setSelectedImage(preset.imageUrl);
    setError(null);
    setResult(null);
    
    // Auto-run the scan using the preset data to showcase instant success
    executeScan(preset.resultaat);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    stopCamera();
  };

  // Drag and drop events
  const [isDragActive, setIsDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Decorative top grid banner lines */}
      <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-700"></div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Humble and minimal Top Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 mb-8 gap-4" id="app-header">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20 font-mono">
                ⚡ BETA ENGINE V3.5
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight flex items-center gap-2 select-none">
              <span className="text-white drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]">Magnet</span>
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]">
                Scan
                <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></span>
              </span>
            </h1>

          </div>
          
          {/* Quick Stats bar */}
          <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg flex items-center gap-4 self-start md:self-auto font-mono text-xs">
            <div>
              <span className="text-slate-500 block">DETECTOR</span>
              <span className="text-slate-300 font-medium">GEMINI-3.5-FLASH</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div>
              <span className="text-slate-500 block">SENSITIVE SCAN</span>
              <span className="text-blue-400 font-medium">ORGANIC & EXPLOSIVE</span>
            </div>
          </div>
        </header>

        {/* Dynamic warning system / alerts based on results */}
        {result?.gevaarlijk && (
          <div className="mb-6 bg-red-950/80 border-2 border-red-600 rounded-lg p-5 animate-pulse text-white flex flex-col md:flex-row gap-4 items-start" id="danger-alert">
            <div className="p-3 bg-red-700/30 rounded-lg text-red-500 border border-red-500 shrink-0">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display uppercase tracking-wide text-red-400">
                ⚠️ HOOG RISICO GEVAARLIJK OBJECT GEDETECTEERD!
              </h3>
              <p className="mt-1 text-sm text-red-200">
                Dit betreft hoogstwaarschijnlijk actieve munitie of een militair vuurwapen uit de oorlog. 
                De Explosieven Opruimingsdienst Defensie (EOD) en de Politie adviseren om dit 
                <strong> NOOIT</strong> mee naar huis te nemen of in een woonwijk achter te laten.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a 
                  href="tel:0900-8844"
                  className="bg-red-800 hover:bg-red-700 text-white text-xs font-bold font-mono px-4 py-2 rounded border border-red-500 uppercase tracking-widest transition"
                >
                  Bel Politie: 0900-8844
                </a>
                <span className="bg-red-900/50 text-red-300 text-xs font-mono px-3 py-2 rounded border border-red-800 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Houd uw GPS coördinaten bij de hand.
                </span>
              </div>
            </div>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="scan-container">
          
          {/* LEFT PANEL: Capture & Interactive Area (Input/Camera/Presets) */}
          <section className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Main Interactive Stage */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative flex flex-col min-h-[400px]">
              
              {/* Header inside the stage */}
              <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-10">
                <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${isCameraActive ? 'bg-blue-500 animate-ping' : 'bg-slate-600'}`}></span>
                  VONDST FEED
                </span>
                
                {selectedImage && (
                  <button 
                    onClick={handleReset}
                    className="text-slate-400 hover:text-red-400 text-xs font-mono flex items-center gap-1 transition"
                    title="Vondst wissen"
                    id="btn-remove-vondst"
                  >
                    <Trash2 className="h-3 w-3" /> Wissen
                  </button>
                )}
              </div>

              {/* Stage Body */}
              <div className="flex-1 flex flex-col justify-center items-center p-6 relative bg-slate-950/50">
                
                {/* 1. Camera active stream view */}
                {isCameraActive && (
                  <div className="w-full h-full absolute inset-0 bg-black flex flex-col justify-between" id="camera-stream-wrapper">
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover flex-1"
                      playsInline
                    />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4 z-20">
                      <button
                        onClick={capturePhoto}
                        type="button"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold font-mono text-sm tracking-wider shadow-lg flex items-center gap-2 transition cursor-pointer"
                        id="btn-capture-photo"
                      >
                        <Camera className="h-5 w-5 text-white" /> FOTO MAAK
                      </button>
                      <button
                        onClick={stopCamera}
                        type="button"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3 rounded-full font-mono text-xs tracking-wider border border-slate-700 transition"
                        id="btn-cancel-camera"
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Photo preview view */}
                {!isCameraActive && selectedImage && (
                  <div className="w-full text-center relative" id="photo-preview-wrapper font-mono">
                    <img 
                      src={selectedImage} 
                      alt="Magnet fishing find preview" 
                      className="max-h-[380px] w-auto mx-auto rounded-lg border border-slate-800 object-contain shadow-lg"
                    />
                    
                    {/* Floating Action Button above the image */}
                    {!isScanning && (
                      <div className="mt-4 flex justify-center gap-3">
                        <button
                          onClick={() => executeScan()}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-sm tracking-wider px-6 py-2.5 rounded-lg border border-emerald-500 flex items-center gap-2 shadow-md transition"
                          id="btn-trigger-scan"
                        >
                          <RefreshCw className="h-4 w-4 animate-spin-slow" /> RUST-AI SCAN START
                        </button>
                        <button
                          onClick={handleReset}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs px-4 py-2.5 rounded-lg border border-slate-700 transition"
                          id="btn-another-image"
                        >
                          Andere foto
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Empty State / Upload Drag-n-Drop Option */}
                {!isCameraActive && !selectedImage && (
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`w-full h-full min-h-[300px] border-2 border-dashed rounded-xl flex flex-col justify-center items-center p-8 transition-colors ${
                      isDragActive ? 'border-blue-400 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    id="dropzone"
                  >
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-full mb-4 text-slate-400">
                      <Image className="h-8 w-8 text-blue-500" />
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-200 text-center font-display">
                      upload je foto van je vondst hier
                    </h3>
                    <p className="text-xs text-slate-500 text-center mt-1 mb-6 max-w-sm">
                      Bestanden direct slepen, of maak een live foto via camera als je aan de waterkant staat.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto" id="feed-options">
                      <button
                        onClick={startCamera}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs tracking-wider px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                        title="Start camera"
                        id="btn-use-camera"
                      >
                        <Camera className="h-4 w-4" /> ONTDEK VIA CAMERA
                      </button>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-mono font-semibold text-xs px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition"
                        id="btn-browse-file"
                      >
                        <Upload className="h-4 w-4" /> UP LOAD AFBEELDING
                      </button>
                    </div>

                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="input-hidden-file"
                    />
                  </div>
                )}

                {/* 4. Scanning radar beam animation overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/90 z-30 flex flex-col justify-center items-center p-6 text-center" id="scanning-overlay">
                    {/* Scan beam */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-bounce w-full"></div>
                    
                    <div className="relative mb-6">
                      <div className="h-20 w-20 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                      <Compass className="h-10 w-10 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                    </div>

                    <h4 className="text-sm font-semibold font-mono tracking-widest text-slate-200 uppercase">
                      MAGNETISCHE RUST SCAN BEZIG...
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 font-mono h-8 overflow-hidden max-w-sm">
                      {scanStep}
                    </p>
                    
                    <div className="w-48 bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                      <div className="bg-blue-500 h-full animate-[shimmer_2s_infinite] w-3/4 rounded-full"></div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </section>

          {/* RIGHT PANEL: Scanner Output Diagnostic Report */}
          <section className="lg:col-span-6 flex flex-col">
            
            {/* If no result and not scanning */}
            {!result && !isScanning && (
              <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-8 flex flex-col justify-center items-center text-center min-h-[350px]">
                <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
                  <Compass className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-300 font-display">
                  DIAGNOSTISCH RAPPORT VONDST
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Upload een foto of activeer de live-camera om de diepte-scan te starten en direct uitsluitsel te ontvangen.
                </p>
                
                {error && (
                  <div className="mt-6 p-4 bg-red-950/40 border border-red-900/60 rounded-lg text-left text-xs max-w-md" id="error-box">
                    <p className="text-red-400 font-mono font-bold uppercase mb-1">WAARSCHUWING / FOUT:</p>
                    <p className="text-red-200">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* If scanning */}
            {isScanning && (
              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-8 flex flex-col justify-center items-center text-center min-h-[350px] animate-pulse">
                <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                </div>
                <h3 className="text-sm font-bold font-mono tracking-widest text-slate-400 uppercase">
                  RECONSTRUEREN...
                </h3>
                <p className="text-xs text-slate-500 max-w-64 mt-2 font-mono">
                  Zand- en roestlagen worden virtueel ontdaan en vergeleken met metallurgische referentiemodellen...
                </p>
              </div>
            )}

            {/* If result is ready */}
            {result && !isScanning && (
              <div className="flex-grow bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col gap-5 justify-between" id="diagnostic-report">
                
                {/* Report Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                        SCAN COMPLEET & VERIFIED
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: SCAN-{Math.floor(Math.random() * 90000) + 10000}
                    </span>
                  </div>

                  {/* Find main header */}
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-widest block mb-1">
                      {result.vondstType}
                    </span>
                    <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                      {result.naam}
                    </h2>
                  </div>

                  {/* Threat badge */}
                  <div className="mt-3 flex items-center gap-2">
                    {result.gevaarlijk ? (
                      <span className="inline-flex items-center gap-1 rounded bg-red-950/80 border border-red-700/80 px-2.5 py-1 text-xs font-bold font-mono text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> GEVAARLIJK / MUNITIE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 text-xs font-bold font-mono text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> VEILIG / GEEN EXPLOSIEF
                      </span>
                    )}

                    <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-bold font-mono border ${
                      result.roestNiveau === "Extreem" 
                        ? 'bg-rose-950/40 border-rose-950 text-rose-300' 
                        : result.roestNiveau === "Gemiddeld"
                        ? 'bg-blue-950/40 border-blue-900 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}>
                      Roest: {result.roestNiveau}
                    </span>
                  </div>

                  {/* Specs Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-800/80 py-4 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase tracking-wider mb-0.5">GESCHIDKTE PERIODE</span>
                      <span className="text-slate-200 font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-blue-400/80" /> {result.historischeSchatting}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase tracking-wider mb-0.5">VAAK METAALSORT</span>
                      <span className="text-slate-200 font-medium flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-blue-400/80" /> {result.materiaal}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Value Block */}
                  <div className="mt-4 bg-gradient-to-r from-blue-950/40 to-slate-900/40 border border-blue-900/40 rounded-lg p-3.5 font-mono text-xs shadow-inner">
                    <span className="text-slate-500 block uppercase tracking-wider mb-1">GESCHATTE REËLE WAARDE</span>
                    <span className={`text-sm font-bold flex items-center gap-1.5 ${
                      result.gevaarlijk ? "text-rose-400" : "text-yellow-400"
                    }`}>
                      <Coins className="h-4 w-4 shrink-0 text-yellow-500 animate-pulse" />
                      {result.geschatteWaarde}
                    </span>
                  </div>

                  {/* In-depth Analysis Text */}
                  <div className="mt-5">
                    <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
                      METALLURGISCHE ANALYSE:
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
                      {result.beschrijving}
                    </p>
                  </div>
                </div>

                {/* Practical tips and instructions */}
                <div className="bg-slate-950/40 rounded-lg p-4 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🛠 SENSITIVE HANDELINGTIPS:
                  </h4>
                  <ul className="space-y-2">
                    {result.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-blue-400 font-mono font-bold mt-0.5 shrink-0">
                          {index + 1}.
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

          </section>

        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-500 border-t border-slate-900 pt-8" id="app-footer">
          <p className="text-slate-400 text-center tracking-wide">
            © {new Date().getFullYear()} - Made by Magnet Guy
          </p>
          <p className="mt-3 text-[10px] text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Dit herkenningsinstrument maakt gebruik van geavanceerde kunstmatige intelligentie en computervisie. Heeft u twijfel over actieve munitie? Raadpleeg altijd direct de lokale politie of EOD. Neem geen onnodige risico's.
          </p>
        </footer>

      </div>

      {/* Hidden canvas for video frames */}
      <canvas ref={canvasRef} className="hidden" />

    </div>
  );
}
