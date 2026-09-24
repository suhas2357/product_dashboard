import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value`.
 * Used so search API calls only fire after typing stops.
 */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}