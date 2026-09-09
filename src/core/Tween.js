export function Tween({
  from = 0,
  to = 1,
  duration = 1000,
  ease = (t) => t,
  onUpdate = () => {},
  onComplete = () => {},
}) {
  const distance = to - from;
  let lastTime;
  var time = 0;
  var isAnimate = true;
  function Animate(currentTime) {
    if (!isAnimate) return;
    if (currentTime !== null) {
      if (lastTime !== undefined) {
        time += currentTime - lastTime;
      }
      lastTime = currentTime;
    }
    if (time >= duration) {
      onUpdate(ease(1) * distance + from);
      onComplete && onComplete();
      isAnimate = false;
    } else {
      onUpdate && onUpdate(ease(time / duration) * distance + from);
    }
    requestAnimationFrame(Animate);
  }
  requestAnimationFrame(Animate);
  function Kill() {
    isAnimate = false;
  }
  function Reload() {
    time = 0;
  }
  function Reset() {
    time = 0;
    isAnimate = false;
    onUpdate(from);
  }
  return {
    Kill: Kill,
    Reload: Reload,
    Reset: Reset,
  };
}
