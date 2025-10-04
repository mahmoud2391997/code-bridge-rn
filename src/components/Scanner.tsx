import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, CheckCircle, XCircle } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface ScanResult {
  value: string;
  format: string;
  timestamp: Date;
}

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);

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
              sendToAPI(scanResult);
              toast.success('Code scanned successfully!');
              
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

  const sendToAPI = async (result: ScanResult) => {
    try {
      await fetch('https://v0-barcode-scanner-monitor.vercel.app/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      toast.success('Code scanned and sent to API');
    } catch (error) {
      console.error('API error:', error);
      toast.error('Failed to send to API');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">QR & Barcode Scanner</h1>
          <p className="text-muted-foreground">Scan codes and send results to your API</p>
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

            {lastResult && (
              <div className="w-full p-4 bg-card rounded-lg border border-accent space-y-2">
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
