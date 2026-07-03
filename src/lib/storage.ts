import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Upload a receipt image file to Firebase Storage.
 * Saves under: households/{householdId}/receipts/{uniqueId}
 */
export async function uploadReceiptImage(householdId: string, file: File): Promise<string> {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  const path = `households/${householdId}/receipts/${uniqueId}-${file.name}`
  const fileRef = ref(storage, path)

  const metadata = {
    contentType: file.type,
  }

  const snapshot = await uploadBytes(fileRef, file, metadata)
  return await getDownloadURL(snapshot.ref)
}
