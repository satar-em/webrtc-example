import {useEffect, useRef} from "react";


let id = 0

function useSatarTestHooks(name: string) {
    const idRef = useRef(0)
    if (idRef.current === 0) idRef.current = id++
    const idRefValue = idRef.current
    console.log(`${idRefValue} -> \t${name} \t -:1`)
    useEffect(() => {
        console.log(`${idRefValue} -> \t${name} \t -:2`)
        return () => {
            console.log(`${idRefValue} -> \t${name} \t -:3`)
        }
    }, []);
    return idRef
}

export default useSatarTestHooks