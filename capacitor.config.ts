import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.qrscanner',
  appName: 'QR Scanner',
  webDir: 'dist',
  // ✅ Removed the Lovable preview server URL so the app will use the local build instead
  plugins: {
    BarcodeScanner: {
      googleBarcodeScannerModuleInstallState: 0,
      googleBarcodeScannerModuleInstallProgressMessage: 'Installing barcode scanner module...'
    }
  }
};

export default config;
