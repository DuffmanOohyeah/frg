import { useEffect, useRef } from 'react';

const useEffectNotFirst = (fn: () => void, inputs: Array<unknown>) => {
    const didMountRef = useRef(false);
    useEffect(() => {
        if (didMountRef.current) {
            fn();
        } else {
            didMountRef.current = true;
        }
    }, inputs);
};

export default useEffectNotFirst;
