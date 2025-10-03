import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.4ab426a9617a48aca3e734aea2f40118',
  appName: 'QR Scanner',
  webDir: 'dist',
  server: {
    url: 'https://4ab426a9-617a-48ac-a3e7-34aea2f40118.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BarcodeScanner: {
      googleBarcodeScannerModuleInstallState: 0,
      googleBarcodeScannerModuleInstallProgressMessage: 'Installing barcode scanner module...'
    }
  }
};

export default config;
