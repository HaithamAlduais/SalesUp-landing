import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Root from './pages/router'
import './styles.css'

/* the shader engine is WebGPU-only (no WebGL path). The probe requests
   a real adapter — some browsers (iOS Safari) expose navigator.gpu but
   return no adapter — and flips on the animated CSS fallbacks via the
   `no-webgpu` class when the device can't run scenes. */
import { gpuReady } from './components/gpu'
void gpuReady

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
