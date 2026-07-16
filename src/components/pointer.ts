/* coarse pointer = touch device: no hover, needs always-visible effects.
   `?coarse` forces it so touch behavior can be previewed on desktop. */
export const COARSE_POINTER =
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none)').matches ||
    new URLSearchParams(window.location.search).has('coarse'))
