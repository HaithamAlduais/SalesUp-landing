import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Root from './pages/router'
import './styles.css'

/* the shader engine is WebGPU-only (no WebGL path). Browsers without
   navigator.gpu — most phones today — get animated CSS fallbacks via
   this class instead of blank scenes. */
if (!('gpu' in navigator)) {
  document.documentElement.classList.add('no-webgpu')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
