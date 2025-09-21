
'use client';

import { useState, useEffect } from 'react';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  terminal_config: {
    client_id: string;
    transaction_currency_code: string;
    merchant_currency_code: string;
    merchant_country_code: string;
    merchant_category_code: string;
  };
}

interface NFCPaymentData {
  authToken: string;
  amountAuthorizedNumeric: string;
  transactionCurrencyCode: string;
  merchantCurrencyCode: string;
  merchantCountryCode: string;
  merchantCategoryCode: string;
  colorPrimary: string;
}

export default function Home() {
  const [loginData, setLoginData] = useState({
    username: 'adminfoqqus',
    password: 'adminfoqqus'
  });
  
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);
  const [paymentData, setPaymentData] = useState<NFCPaymentData>({
    authToken: '',
    amountAuthorizedNumeric: '',
    transactionCurrencyCode: '',
    merchantCurrencyCode: '',
    merchantCountryCode: '',
    merchantCategoryCode: '',
    colorPrimary: '#007bff'
  });
  
  const [nfcIntent, setNfcIntent] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const handleLogin = async () => {
    try {
      // Usar el proxy interno de Next.js para evitar problemas de CORS
      const response = await fetch('/api/akua/login', {
        method: 'POST',
        headers: {
          'api-key': 'dach5jaeb2JeKoh8Eesai3aid0Ji3Yuhoo4aib5pieyeequ4eiNeememi8aiZeel',
          'content-type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        setLoginResponse(data);
        
        // Auto-completar los datos de pago con la respuesta del login
        setPaymentData(prev => ({
          ...prev,
          authToken: `Bearer ${data.access_token}`,
          transactionCurrencyCode: data.terminal_config.transaction_currency_code,
          merchantCurrencyCode: data.terminal_config.merchant_currency_code,
          merchantCountryCode: data.terminal_config.merchant_country_code,
          merchantCategoryCode: data.terminal_config.merchant_category_code
        }));
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert(`Error en el login: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Asegúrate de que el servidor esté ejecutándose.');
    }
  };

  const generateNFCIntent = () => {
    const jsonData = JSON.stringify(paymentData);
    const base64Data = btoa(jsonData);
    const intent = `cloud_payment://cloudcommerce/json:${base64Data}`;
    setNfcIntent(intent);
    
    // Generar QR Code
    generateQRCode(intent);
  };

  const executeNFCIntent = () => {
    if (!nfcIntent) {
      alert('Primero genera el intent NFC');
      return;
    }
    
    // Intentar abrir la aplicación directamente
    try {
      // Método 1: Usar window.location para forzar la navegación
      window.location.href = nfcIntent;
      
      // Método 2: Si no funciona, usar window.open
      setTimeout(() => {
        try {
          window.open(nfcIntent, '_self');
        } catch (e) {
          // Método 3: Crear iframe oculto
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = nfcIntent;
          document.body.appendChild(iframe);
          
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error al abrir el intent:', error);
      alert('No se pudo abrir la aplicación automáticamente. Se ha copiado el intent al portapapeles.');
      navigator.clipboard.writeText(nfcIntent);
    }
  };

  const generateQRCode = async (text: string) => {
    try {
      // Usar una API online para generar QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
      setQrCodeDataUrl(qrUrl);
    } catch (error) {
      console.error('Error generando QR code:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(nfcIntent);
    alert('Intent copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            NFC Payment Tester
          </h1>
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            v5.0
          </span>
        </div>
        
        {/* Sección de Login */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Login API</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </button>
          
          {loginResponse && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium">Login exitoso!</p>
              <p className="text-sm text-green-600 mt-1">
                Token obtenido: {loginResponse.access_token.substring(0, 50)}...
              </p>
            </div>
          )}
        </div>

        {/* Sección de Datos de Pago */}
        {loginResponse && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Datos de Pago NFC</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Monto Autorizado
                </label>
                <input
                  type="text"
                  value={paymentData.amountAuthorizedNumeric}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amountAuthorizedNumeric: e.target.value }))}
                  placeholder="Ej: 100.00"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Color Primario (Hex)
                </label>
                <input
                  type="text"
                  value={paymentData.colorPrimary}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, colorPrimary: e.target.value }))}
                  placeholder="#007bff"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Configuración del Terminal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Transaction Currency:</span> {paymentData.transactionCurrencyCode}
                </div>
                <div>
                  <span className="font-medium">Merchant Currency:</span> {paymentData.merchantCurrencyCode}
                </div>
                <div>
                  <span className="font-medium">Merchant Country:</span> {paymentData.merchantCountryCode}
                </div>
                <div>
                  <span className="font-medium">Merchant Category:</span> {paymentData.merchantCategoryCode}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Generación de Intent */}
        {loginResponse && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Generar Intent NFC</h2>
            <div className="flex gap-3 mb-4">
              <button
                onClick={generateNFCIntent}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Generar Intent
              </button>
              {nfcIntent && (
                <button
                  onClick={executeNFCIntent}
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
                >
                  Ejecutar Pago NFC
                </button>
              )}
            </div>
            
            {nfcIntent && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Intent NFC Generado:
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={nfcIntent}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                    rows={3}
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
                
                {/* QR Code Section */}
                {qrCodeDataUrl && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">QR Code del Intent</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex-shrink-0">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code del Intent NFC"
                          className="w-48 h-48 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          Escanea este QR code con tu aplicación NFC para ejecutar el pago automáticamente.
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => window.open(qrCodeDataUrl, '_blank')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            Abrir QR en nueva ventana
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(nfcIntent)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm ml-2"
                          >
                            Copiar Intent
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Información de Uso */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Instrucciones de Uso</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Completa los datos de login y haz clic en "Iniciar Sesión"</li>
            <li>Ingresa el monto y color deseado para el pago</li>
            <li>Haz clic en "Generar Intent" para crear el intent y QR code</li>
            <li>Usa el botón "Ejecutar Pago NFC" para abrir la aplicación directamente</li>
            <li>O usa el QR code generado para escanear con tu aplicación NFC</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
