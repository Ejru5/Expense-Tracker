import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSharedFile, clearSharedFile } from '../lib/shareStore'
import { uploadReceiptImage } from '../lib/storage'
import { scanReceiptImage } from '../lib/mistral'
import { useAppStore } from '../store/useAppStore'
import type { ReceiptScanResponse } from '../types'
import { ReceiptLineItemsCard } from '../components/ai/ReceiptLineItemsCard'
import { AIConfirmCard } from '../components/ai/AIConfirmCard'
import { PageLoader } from '../components/ui'

export function ShareHandlerPage() {
  const navigate = useNavigate()
  const { household } = useAppStore()

  const [loadingFile, setLoadingFile] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [parsedData, setParsedData] = useState<ReceiptScanResponse | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  useEffect(() => {
    async function loadShared() {
      try {
        const file = await getSharedFile('shared-image')
        if (file) {
          setImageFile(file)
          const preview = URL.createObjectURL(file)
          setImagePreview(preview)

          // Read file as base64 to prepare for parsing
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64 = reader.result as string
            
            // Automatically process the shared screenshot
            if (household) {
              setProcessing(true)
              setError(null)
              try {
                // 1. Upload screenshot
                const url = await uploadReceiptImage(household.id, file)
                setUploadedUrl(url)

                // 2. Parse details
                const scanResult = await scanReceiptImage(base64)
                setParsedData(scanResult)
              } catch (err: any) {
                console.error(err)
                setError(err.message || 'AI failed to analyze the shared image. Please log manually.')
              } finally {
                setProcessing(false)
              }
            }
          }
          reader.readAsDataURL(file)
        } else {
          // No file found, redirect to home
          navigate('/', { replace: true })
        }
      } catch (err) {
        console.error(err)
        navigate('/', { replace: true })
      } finally {
        setLoadingFile(false)
      }
    }

    loadShared()
  }, [household, navigate])

  function handleReset() {
    clearSharedFile('shared-image')
    navigate('/', { replace: true })
  }

  if (loadingFile || (processing && !parsedData)) {
    return <PageLoader />
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-6 max-w-lg lg:max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-6">Processing Share</h1>

      {error ? (
        <div className="card space-y-4">
          <p className="text-sm font-semibold text-rose-500">Processing Error</p>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          {imagePreview && (
            <img src={imagePreview} alt="Shared receipt" className="rounded-xl max-h-64 object-cover mx-auto" />
          )}
          <button onClick={handleReset} className="btn-secondary w-full">
            Back to Home
          </button>
        </div>
      ) : parsedData ? (
        <div className="space-y-6">
          <ReceiptLineItemsCard
            merchant={parsedData.merchant}
            lineItems={parsedData.lineItems}
            tax={parsedData.tax}
            total={parsedData.total}
          />

          <AIConfirmCard
            prefill={{
              amount: parsedData.total,
              categoryId: parsedData.categoryId,
              merchant: parsedData.merchant,
              note: 'Shared Payment Screenshot',
              source: 'ai-receipt',
              receiptImageUrl: uploadedUrl || undefined,
              receiptLineItems: parsedData.lineItems,
              type: 'expense',
            }}
            onSuccess={() => {
              clearSharedFile('shared-image')
              navigate('/')
            }}
            onCancel={handleReset}
          />
        </div>
      ) : null}
    </div>
  )
}
export default ShareHandlerPage
