import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, AlertCircle, RefreshCw, Keyboard } from 'lucide-react'
import { apiClient } from '../api/client'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { useAuth } from '../store/AuthContext'

export const QRScanner: React.FC = () => {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [scanError, setScanError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)

  const qrScannerRef = useRef<Html5Qrcode | null>(null)
  const SCANNER_ELEMENT_ID = 'qr-camera-stream'

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
    qrScannerRef.current = scanner
    startScanning()

    return () => {
      // 1. Force release camera tracks synchronously to turn off camera light immediately
      try {
        const videoEl = document.getElementById(SCANNER_ELEMENT_ID)?.querySelector('video') as HTMLVideoElement | null
        if (videoEl && videoEl.srcObject) {
          const stream = videoEl.srcObject as MediaStream
          stream.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
        }
      } catch (e) {
        console.warn('Sync camera track stop failed:', e)
      }

      // 2. Stop scanner instance
      if (scanner.isScanning) {
        scanner.stop()
          .then(() => scanner.clear())
          .catch(err => console.warn('Html5Qrcode stop error:', err))
      } else {
        try {
          scanner.clear()
        } catch (e) { }
      }
    }
  }, [])

  const startScanning = async () => {
    setScanError(null)
    if (!qrScannerRef.current) return

    try {
      setCameraActive(true)
      await qrScannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          // Removed qrbox so it scans the full frame and avoids double UI overlays
        },
        onScanSuccess,
        onScanFailure
      )
      setCameraPermission(true)
    } catch (err: any) {
      console.warn('Camera start error:', err)
      setCameraActive(false)
      setCameraPermission(false)
      setScanError('Unable to access camera. Please allow camera permissions or enter the code manually below.')
    }
  }

  const stopScanning = async () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop()
        setCameraActive(false)
      } catch (err) {
        console.error('Failed to stop camera:', err)
      }
    }
  }

  const onScanSuccess = async (decodedText: string) => {
    await stopScanning()
    processQRToken(decodedText)
  }

  const onScanFailure = () => {
    // Normal failure to decode, ignore to prevent console logs flooding
  }

  const processQRToken = async (token: string) => {
    setScanError(null)
    try {
      const res = await apiClient.post('/student/scan', { qr_token: token })
      await refreshUser()

      navigate('/scan-success', {
        state: {
          university: res.data.university,
          all_completed: res.data.all_completed,
        },
        replace: true
      })
    } catch (err: any) {
      const errorResponseMsg = err.response?.data?.message
      setScanError(errorResponseMsg || 'Check-in failed. Please verify the QR Code and try again.')

      if (cameraPermission) {
        setTimeout(() => {
          startScanning()
        }, 3000)
      }
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualToken.trim()) return

    setManualLoading(true)
    await processQRToken(manualToken.trim())
    setManualLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 pb-6 items-center">
      <style>{`
        @keyframes scan-laser {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
        }
        .animate-scan-laser {
          animation: scan-laser 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        /* Force the container to take full space and hide overflow */
        #qr-camera-stream {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        
        /* Ensure html5-qrcode video fills the container absolutely */
        #qr-camera-stream video {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 1.5rem !important;
        }
        
        /* Hide any canvas the library tries to inject for its default overlay */
        #qr-camera-stream canvas {
          display: none !important;
        }
      `}</style>

      <div className="text-center w-full">
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight font-sans">Stamp Scanner</h2>
        <p className="text-xs text-text-secondary mt-1">Scan the QR code at the university booth</p>
      </div>

      {/* Enlarged Camera Card */}
      <Card className="w-full relative overflow-hidden bg-slate-950 border-0 aspect-[3/4] sm:aspect-square p-0 rounded-3xl flex flex-col justify-center items-center shadow-2xl">
        <div id={SCANNER_ELEMENT_ID} className="w-full h-full object-cover relative z-0"></div>

        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950 z-10 rounded-3xl">
            <Camera size={40} className="text-slate-500 mb-4 animate-pulse" />
            <span className="text-sm font-semibold text-slate-300">Camera is offline</span>
            {cameraPermission === false && (
              <button
                onClick={startScanning}
                className="mt-5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-[0.98]"
              >
                <RefreshCw size={14} />
                Try Camera Again
              </button>
            )}
          </div>
        )}

        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 rounded-3xl overflow-hidden">
            <div className="w-[70%] sm:w-[60%] aspect-square relative shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] rounded-3xl">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-3xl"></div>
              <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-3xl"></div>
              <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-3xl"></div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-3xl"></div>

              {/* Scanning Laser Animation */}
              <div className="absolute left-2 right-2 h-0.5 bg-primary animate-scan-laser shadow-[0_0_15px_rgba(59,130,246,0.9)]"></div>
            </div>
          </div>
        )}
      </Card>

      {scanError && (
        <div className="flex items-start gap-2.5 p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs leading-normal font-semibold w-full">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{scanError}</span>
        </div>
      )}

      <Card className="w-full border border-border-custom bg-surface p-5 mt-2">
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <Keyboard size={14} />
            <span>Simulate Check-In (Testing Code)</span>
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            If your camera isn't accessible, type the university booth's QR Token below (e.g. `binus-booth-uuid-token-01`).
          </p>
          <div className="flex flex-col gap-2 mt-1">
            <Input
              placeholder="Enter Booth Token"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="py-2.5 text-sm"
            />
            <Button
              type="submit"
              isLoading={manualLoading}
              className="w-full py-2.5 h-auto rounded-xl font-bold"
              variant="secondary"
            >
              Check In
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}