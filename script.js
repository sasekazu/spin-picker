(function () {
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const textarea = document.getElementById('itemsInput');
  const startBtn = document.getElementById('startBtn');
  const resultEl = document.getElementById('result');

  const CENTER = canvas.width / 2;
  const RADIUS = canvas.width / 2 - 4;

  const SPIN_SPEED = Math.PI * 3; // rad/sec while spinning at constant speed

  let items = [];
  let colors = [];
  let currentRotation = 0;
  let phase = 'idle'; // 'idle' | 'spinning' | 'stopping'
  let lastFrameTime = 0;
  let animFrameId = null;

  function generateColors(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.round((360 / count) * i);
      result.push(`hsl(${hue}, 70%, 60%)`);
    }
    return result;
  }

  function parseItems(text) {
    return text
      .split(/\r\n|\r|\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (items.length === 0) {
      ctx.save();
      ctx.fillStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No items', CENTER, CENTER);
      ctx.restore();
      return;
    }

    const sliceAngle = (Math.PI * 2) / items.length;
    const fontSize = Math.max(10, Math.min(20, 220 / items.length));

    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.rotate(currentRotation);

    for (let i = 0; i < items.length; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, RADIUS, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const midAngle = startAngle + sliceAngle / 2;
      ctx.save();
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#111827';
      ctx.font = `bold ${fontSize}px sans-serif`;
      let label = items[i];
      const maxLabelLen = Math.max(4, Math.floor(items.length <= 8 ? 14 : 8));
      if (label.length > maxLabelLen) {
        label = label.slice(0, maxLabelLen - 1) + '…';
      }
      ctx.fillText(label, RADIUS - 10, 0);
      ctx.restore();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function updateFromInput() {
    items = parseItems(textarea.value);
    colors = generateColors(items.length || 1);
    if (phase === 'idle') {
      drawWheel();
    }
  }

  function startSpin() {
    if (phase !== 'idle' || items.length === 0) return;
    phase = 'spinning';
    startBtn.textContent = 'STOP';
    resultEl.textContent = '';
    lastFrameTime = performance.now();
    animFrameId = requestAnimationFrame(spinLoop);
  }

  // Keep spinning at constant speed until STOP is pressed
  function spinLoop(now) {
    const elapsed = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    currentRotation += SPIN_SPEED * elapsed;
    drawWheel();
    if (phase === 'spinning') {
      animFrameId = requestAnimationFrame(spinLoop);
    }
  }

  function stopSpin() {
    if (phase !== 'spinning') return;
    phase = 'stopping';
    startBtn.disabled = true;

    // Pick the winner now, then work backward to the rotation that lands it on the pointer
    const winnerIndex = Math.floor(Math.random() * items.length);
    const sliceAngle = (Math.PI * 2) / items.length;
    const winnerCenterAngle = winnerIndex * sliceAngle + sliceAngle / 2;
    const randomOffset = (Math.random() - 0.5) * sliceAngle * 0.8;
    const targetPointerAngle = 0; // pointer is fixed on the right (angle 0)

    let baseTarget = targetPointerAngle - (winnerCenterAngle + randomOffset);
    baseTarget = ((baseTarget % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    const startRotation = currentRotation;
    const currentMod = ((startRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let deltaToTarget = baseTarget - currentMod;
    if (deltaToTarget < 0) deltaToTarget += Math.PI * 2;

    // Decelerate at a constant rate from the current speed (SPIN_SPEED) down to 0.
    // Average speed is v0/2, so derive the extra full turns from the target duration.
    const v0 = SPIN_SPEED;
    const targetDurationSec = 3.5 + Math.random() * 1.5;
    const idealDistance = v0 * targetDurationSec / 2;
    const extraTurns = Math.max(2, Math.round((idealDistance - deltaToTarget) / (Math.PI * 2)));
    const totalDistance = deltaToTarget + extraTurns * Math.PI * 2;
    const durationSec = 2 * totalDistance / v0;
    const finalRotation = startRotation + totalDistance;

    const startTime = performance.now();

    function animate(now) {
      const elapsedSec = Math.min((now - startTime) / 1000, durationSec);
      currentRotation = startRotation + v0 * elapsedSec - 0.5 * (v0 / durationSec) * elapsedSec * elapsedSec;
      drawWheel();

      if (elapsedSec < durationSec) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        currentRotation = finalRotation;
        drawWheel();
        phase = 'idle';
        startBtn.textContent = 'START';
        startBtn.disabled = false;
        resultEl.textContent = `Selected: ${items[winnerIndex]}`;
      }
    }

    animFrameId = requestAnimationFrame(animate);
  }

  startBtn.addEventListener('click', () => {
    if (phase === 'idle') {
      startSpin();
    } else if (phase === 'spinning') {
      stopSpin();
    }
  });
  textarea.addEventListener('input', updateFromInput);

  updateFromInput();
})();
