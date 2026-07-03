import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { setSharedFile } from './lib/shareStore'

declare const self: any

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Intercept PWA Share Target POST requests
self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url)

  if (event.request.method === 'POST' && url.pathname === '/share-handler') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData()
          const file = formData.get('image') as File | null

          if (file) {
            // Save file to IndexedDB for retrieval inside React app
            await setSharedFile('shared-image', file)
          }
        } catch (err) {
          console.error('Error handling share target in SW:', err)
        }

        // Redirect to share-handler page via GET request (status 303 causes browser to perform GET)
        return Response.redirect('/share-handler', 303)
      })()
    )
  }
})
