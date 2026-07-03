import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, Upload, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { uploadReceiptImage } from '../lib/storage'
import { scanReceiptImage } from '../lib/mistral'
import { useAppStore } from '../store/useAppStore'
import type { ReceiptScanResponse } from '../types'
import { ReceiptLineItemsCard } from '../components/ai/ReceiptLineItemsCard'
import { AIConfirmCard } from '../components/ai/AIConfirmCard'
import { Button } from '../components/ui/Button'

export function ReceiptScanFlow() {
  const navigate = useNavigate()
  const { household } = useAppStore()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [parsedData, setParsedData] = useState<ReceiptScanResponse | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  // Handle file selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setError(null)

    // Render local preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle Scan Action
  async function handleScan() {
    if (!imageFile || !household) return

    setUploading(true)
    setError(null)
    try {
      // 1. Upload to Firebase Storage
      const url = await uploadReceiptImage(household.id, imageFile)
      setUploadedUrl(url)
      setUploading(false)

      // 2. Parse using Mistral OCR (send base64 to endpoint)
      setParsing(true)
      if (!imagePreview) throw new Error('Preview image data is missing')

      const scanResult = await scanReceiptImage(imagePreview)
      setParsedData(scanResult)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to scan receipt. Please input manually or try another photo.')
    } finally {
      setUploading(false)
      setParsing(false)
    }
  }

  function handleReset() {
    setImageFile(null)
    setImagePreview(null)
    setParsedData(null)
    setUploadedUrl(null)
    setError(null)
  }

  const isProcessing = uploading || parsing

  return (
    <div className="page-content px-4 lg:px-8 pt-4 animate-fade-in max-w-lg lg:max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost !pl-0 mb-4 flex items-center gap-1"
        disabled={isProcessing}
      >
        <ChevronLeft size={20} /> Back
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Camera className="text-emerald-500" size={24} />
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Scan Receipt</h1>
      </div>

      {!parsedData ? (
        /* Upload flow */
        <div className="space-y-6">
          <div className="card text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 relative">
            {!imagePreview ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 mb-4">
                  <Upload size={28} />
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Upload or capture receipt</p>
                <p className="text-xs text-slate-400 mt-1 mb-6">Supports JPEG, PNG up to 5MB</p>

                <label className="btn-primary cursor-pointer w-full max-w-xs">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={imagePreview} alt="Preview" className="rounded-xl max-h-64 mx-auto object-cover" />
                
                <div className="flex gap-3 justify-center">
                  <label className="btn-secondary !py-2.5 !px-4 cursor-pointer text-xs">
                    Retake
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                  </label>
                  
                  <Button
                    onClick={handleScan}
                    loading={isProcessing}
                    className="!py-2.5 !px-6 text-xs"
                    leftIcon={<Sparkles size={14} />}
                  >
                    {uploading ? 'Uploading image...' : parsing ? 'AI Analyzing...' : 'Scan Receipt'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/50">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Scan Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Confirmation flow */
        <div className="space-y-6">
          {/* Itemized list display */}
          <ReceiptLineItemsCard
            merchant={parsedData.merchant}
            lineItems={parsedData.lineItems}
            tax={parsedData.tax}
            total={parsedData.total}
          />

          {/* Setup verification confirmation card */}
          <AIConfirmCard
            prefill={{
              amount: parsedData.total,
              categoryId: parsedData.categoryId,
              merchant: parsedData.merchant,
              note: 'AI Receipt Scan',
              source: 'ai-receipt',
              receiptImageUrl: uploadedUrl || undefined,
              receiptLineItems: parsedData.lineItems,
              type: 'expense',
            }}
            onSuccess={() => {
              handleReset()
              navigate('/')
            }}
            onCancel={handleReset}
          />
        </div>
      )}
    </div>
  )
}
export default ReceiptScanFlow
