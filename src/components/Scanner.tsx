import { useState } from "react";
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, CheckCircle, XCircle } from "lucide-react";

interface ScanResult {
  value: string;
  format: string;
  timestamp: Date;
}

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);

  const startScan = async () => {
    try {
      // Request camera permissions
      const { camera } = await BarcodeScanner.requestPermissions();
      
      if (camera !== 'granted') {
        toast.error('Camera permission denied');
        return;
      }

      // Start scanning
      setIsScanning(true);
      document.body.classList.add('scanner-active');

      const result = await BarcodeScanner.scan({
        formats: [
          BarcodeFormat.QrCode,
          BarcodeFormat.Code128,
          BarcodeFormat.Code39,
          BarcodeFormat.Code93,
          BarcodeFormat.Ean13,
          BarcodeFormat.Ean8,
          BarcodeFormat.UpcA,
          BarcodeFormat.UpcE,
        ],
      });

      if (result.barcodes.length > 0) {
        const scannedData = result.barcodes[0];
        const scanResult: ScanResult = {
          value: scannedData.rawValue,
          format: scannedData.format,
          timestamp: new Date(),
        };

        setLastResult(scanResult);
        setHistory(prev => [scanResult, ...prev.slice(0, 9)]);
        
        // Send to API
        await sendToAPI(scanResult);
        
        toast.success('Code scanned successfully!');
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan code');
    } finally {
      setIsScanning(false);
      document.body.classList.remove('scanner-active');
      await BarcodeScanner.stopScan();
    }
  };

  const sendToAPI = async (result: ScanResult) => {
    try {
      const response = await fetch('https://v0-barcode-scanner-monitor.vercel.app/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: result.value,
          format: result.format,
          timestamp: result.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      toast.success('Data sent to API');
    } catch (error) {
      console.error('API error:', error);
      toast.error('Failed to send data to API');
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
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
              <Camera className="w-16 h-16 text-primary" />
            </div>
            
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

      <style>{`
        body.scanner-active {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
