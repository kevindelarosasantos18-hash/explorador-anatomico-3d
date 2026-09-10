function clampNum(v, a, b) { return Math.max(a, Math.min(b, v)); }
function dist2(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

const MIN_DIST = 3.2, MAX_DIST = 16;

export function createOrbitInteraction({ canvasEl, bodyGroup, onTap, hitTest }) {
  const activePointers = new Map();
  let isDragging = false;
  let dragMoved = 0;
  let lastPinchDist = null;
  let cameraDistance = 9;

  function getPointerNDC(clientX, clientY) {
    const rect = canvasEl.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1
    };
  }

  function onPointerDown(e) {
    canvasEl.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.size === 1) {
      isDragging = true;
      dragMoved = 0;
    } else if (activePointers.size === 2) {
      isDragging = false;
      const pts = Array.from(activePointers.values());
      lastPinchDist = dist2(pts[0], pts[1]);
    }
  }

  function onPointerMove(e) {
    if (activePointers.has(e.pointerId)) {
      const prev = activePointers.get(e.pointerId);
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const d = dist2(pts[0], pts[1]);
        if (lastPinchDist) {
          const delta = d - lastPinchDist;
          cameraDistance = clampNum(cameraDistance - delta * 0.02, MIN_DIST, MAX_DIST);
        }
        lastPinchDist = d;
        return;
      }

      if (isDragging && activePointers.size === 1) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        dragMoved += Math.abs(dx) + Math.abs(dy);
        bodyGroup.rotation.y += dx * 0.008;
        bodyGroup.rotation.x = clampNum(bodyGroup.rotation.x + dy * 0.008, -0.5, 0.6);
      }
      return;
    }
    updateHoverCursor(e.clientX, e.clientY);
  }

  function onPointerUp(e) {
    const wasSinglePointerTap = isDragging && activePointers.size === 1 && dragMoved < 6;
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) lastPinchDist = null;
    if (wasSinglePointerTap) onTap(e.clientX, e.clientY);
    if (activePointers.size === 0) isDragging = false;
  }

  function onWheel(e) {
    e.preventDefault();
    cameraDistance = clampNum(cameraDistance + e.deltaY * 0.01, MIN_DIST, MAX_DIST);
  }

  function updateHoverCursor(clientX, clientY) {
    canvasEl.style.cursor = hitTest(clientX, clientY) ? 'pointer' : 'grab';
  }

  canvasEl.addEventListener('pointerdown', onPointerDown);
  canvasEl.addEventListener('pointermove', onPointerMove);
  canvasEl.addEventListener('pointerup', onPointerUp);
  canvasEl.addEventListener('pointercancel', onPointerUp);
  canvasEl.addEventListener('wheel', onWheel, { passive: false });

  return {
    getPointerNDC,
    getCameraDistance: () => cameraDistance,
    resetView() {
      bodyGroup.rotation.set(0, 0, 0);
      cameraDistance = 9;
    }
  };
}
