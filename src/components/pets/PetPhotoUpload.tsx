import { useState, useRef, ChangeEvent } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface PetPhotoUploadProps {
  value?: File | null
  onChange: (file: File | null) => void
  error?: string
}

const MAX_FILE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic']

export function PetPhotoUpload({ value: _value, onChange, error }: PetPhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset errors
    setUploadError(null)

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Please upload a JPG, PNG, or HEIC image')
      return
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setUploadError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`)
      return
    }

    try {
      setIsCompressing(true)

      // Compress image
      const options = {
        maxSizeMB: 1, // Target max 1MB
        maxWidthOrHeight: 1024, // Resize to max 1024px
        useWebWorker: true, // Offload to web worker
        fileType: 'image/jpeg', // Convert all to JPEG
        initialQuality: 0.8, // 80% quality
      }

      const compressedFile = await imageCompression(file, options)

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile)
      setPreview(previewUrl)

      // Call onChange with compressed file
      onChange(compressedFile)
    } catch (err) {
      console.error('Error compressing image:', err)
      setUploadError('Failed to process image. Please try again.')
    } finally {
      setIsCompressing(false)
    }
  }

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="photo">Pet Photo (optional)</Label>

      {!preview ? (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <input
            ref={fileInputRef}
            id="photo"
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          {isCompressing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Compressing image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, or HEIC (max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Pet preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {(uploadError || error) && (
        <p className="text-sm text-red-500">{uploadError || error}</p>
      )}
    </div>
  )
}
