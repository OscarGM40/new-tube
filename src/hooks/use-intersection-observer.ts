import { useEffect, useRef, useState } from "react";

export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  // this state tell us if we are intersecting or not(basically we'll use the Observer to tell us if the user has reached the bottom of a list, so we can safely initiate a callback call)
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // this is the observer telling us user reached the bottom. The signature looks an standard
    const observer = new IntersectionObserver(([entry]) => {
      //fijate que es el Observer el que me devuelve isIntersecting, pero lo estamos metiendo a un estado para sacarlo de aqui
      setIsIntersecting(entry.isIntersecting);
    }, options);

    // si hemos llegado al div con la ref que pondremos manualmente el observer empezará a observar, no tiene sentido antes
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    // siempre desconectarnos en el return
    return () => observer.disconnect()
  }, [options]);

  return { targetRef, isIntersecting };
};
