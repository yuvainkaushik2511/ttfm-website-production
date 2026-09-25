// A single mutable "how alive is the background right now" dial for the creators
// route's always-mounted ambient WebGL scene. Plain mutable object rather than
// React state/context — CreatorsAmbientScene reads it every frame inside useFrame,
// and later sections (e.g. CreatorsFinale) bump it with a GSAP tween instead of
// mounting a second Canvas just to raise particle density for one section.
export const ambientIntensity = { current: 1 };
