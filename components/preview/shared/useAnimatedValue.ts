"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Animates a plain object of numbers with GSAP and mirrors it into React
 * state on every tick, instead of letting GSAP write to the DOM directly.
 *
 * This keeps the *animation recipe* (values, duration, ease, repeat)
 * portable to React Native: the same `gsap.to(obj, vars)` call works there
 * too (GSAP's core ticker only needs a timer, not the DOM) — only the
 * final render step differs (inline CSS style here vs. a native `style`
 * prop / Reanimated shared value there).
 */
export function useAnimatedValue<T extends Record<string, number>>(
  initial: T,
  vars: gsap.TweenVars,
  deps: React.DependencyList = [],
) {
  const [values, setValues] = useState<T>(initial);
  const objRef = useRef<T>({ ...initial });

  useEffect(() => {
    const obj = objRef.current;
    const tween = gsap.to(obj, {
      ...vars,
      onUpdate: () => setValues({ ...obj }),
    });

    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return values;
}
