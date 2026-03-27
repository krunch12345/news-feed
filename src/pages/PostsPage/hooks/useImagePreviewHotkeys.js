import { useEffect } from 'react'

/**
 * Handles keyboard navigation for image preview.
 * @param {object} props Component props.
 * @param {string} props.previewImageUrl Current preview image URL.
 * @param {string[]} props.previewImages List of preview images.
 * @param {(index: number) => void} props.setPreviewImageIndex Sets the current preview image index.
 */
export const useImagePreviewHotkeys = ({ previewImageUrl, previewImages, setPreviewImageIndex }) => {
  useEffect(() => {
    if (!previewImageUrl) {
      return undefined
    }

    const onPreviewKeyDown = (e) => {
      if (previewImages.length > 1 && e.key === 'ArrowLeft') {
        setPreviewImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length)
      } else if (previewImages.length > 1 && e.key === 'ArrowRight') {
        setPreviewImageIndex((prev) => (prev + 1) % previewImages.length)
      }
    }

    window.addEventListener('keydown', onPreviewKeyDown)
    return () => {
      window.removeEventListener('keydown', onPreviewKeyDown)
    }
  }, [previewImageUrl, previewImages, setPreviewImageIndex])
}
