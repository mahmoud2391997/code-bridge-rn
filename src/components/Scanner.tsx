import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Camera, CheckCircle, XCircle, Send } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { supabase } from "../hooks/client"; // Import Supabase client

interface ScanResult {
  value: string;
  format: string;
  timestamp: Date;
}

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [testData, setTestData] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScan = async () => {
    try {
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        if (codeReader.current) {
          codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
            if (result) {
              const scanResult: ScanResult = {
                value: result.getText(),
                format: result.getBarcodeFormat().toString(),
                timestamp: new Date(),
              };

              setLastResult(scanResult);
              setHistory(prev => [scanResult, ...prev.slice(0, 9)]);
              sendToSupabase(scanResult); // Send to Supabase instead of external API
              toast.success('Code scanned successfully!');
              
              codeReader.current?.reset();
              stream.getTracks().forEach(track => track.stop());
              setIsScanning(false);
            }
          });
        }
      }
      
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Camera access denied or unavailable');
      setIsScanning(false);
    }
  };

  const sendToSupabase = async (result: ScanResult) => {
    try {
      // Create scan data for Supabase
      const scanData = {
        gtin: result.value,
        product_name: "Scanned Product", // You can enhance this with product lookup
        quantity: 1,
        unit: "pcs",
        manufacturer: "Unknown Manufacturer",
        origin_country: "Unknown",
        current_status: "scanned",
        transport_mode: "manual_scan",
        received_at: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('scans')
        .insert([scanData])
        .select();

      if (error) {
        throw error;
      }

      console.log('✅ Scan saved to Supabase:', data);
      toast.success('Scan saved to database!');

      // Also send to your Edge Function if needed
      await sendToEdgeFunction(result);

    } catch (error) {
      console.error('❌ Supabase error:', error);
      toast.error('Failed to save scan to database');
    }
  };

  const sendToEdgeFunction = async (result: ScanResult) => {
    try {
      const response = await fetch('https://rxnxhrlxnqdlqqraefgh.supabase.co/functions/v1/barcode-scanner/scan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}` // Add auth if needed
        },
        body: JSON.stringify({
          gtin: result.value,
          productName: "Scanned Product",
          quantity: 1
        })
      });
      
      if (response.ok) {
        console.log('✅ Scan sent to Edge Function');
      } else {
        console.warn('⚠️ Edge Function response not OK:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Edge Function error (non-critical):', error);
      // Don't show error toast for this as Supabase insertion is the primary method
    }
  };

  const handleManualSend = async () => {
    if (!testData.trim()) {
      toast.error('Please enter test data');
      return;
    }

    const manualResult: ScanResult = {
      value: testData,
      format: "manual",
      timestamp: new Date(),
    };

    setLastResult(manualResult);
    setHistory(prev => [manualResult, ...prev.slice(0, 9)]);
    await sendToSupabase(manualResult);
    setTestData(""); // Clear input after sending
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">QR & Barcode Scanner</h1>
          <p className="text-muted-foreground">Scan codes and save to Supabase database</p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex flex-col items-center space-y-4">
            {isScanning ? (
              <video
                ref={videoRef}
                className="w-full max-w-md h-64 bg-black rounded-lg"
                autoPlay
                playsInline
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                <Camera className="w-16 h-16 text-primary" />
              </div>
            )}
            
            <Button
              onClick={startScan}
              disabled={isScanning}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-glow"
            >
              {isScanning ? 'Scanning...' : 'Start Scanning'}
            </Button>

            <div className="w-full space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter test GTIN/barcode to save to database"
                  value={testData}
                  onChange={(e) => setTestData(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSend();
                    }
                  }}
                />
                <Button
                  onClick={handleManualSend}
                  disabled={!testData}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {lastResult && (
                <div className="p-4 bg-card rounded-lg border border-accent space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Last Scan</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-foreground font-mono break-all">{lastResult.value}</p>
                    <p className="text-muted-foreground">Format: {lastResult.format}</p>
                    <p className="text-muted-foreground">
                      Time: {lastResult.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Scan History</h2>
            <div className="space-y-2">
              {history.map((item, index) => (
                <Card key={index} className="p-4 bg-card">
                  <div className="text-sm space-y-1">
                    <p className="text-foreground font-mono break-all">{item.value}</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{item.format}</span>
                      <span>{item.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;