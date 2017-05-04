export function debugLog(DEBUG, str){ DEBUG && console.log(str) }
export function debugLogGroup(DEBUG, strArray){ if(DEBUG){ for(let e in strArray){ e == '0' ? console.groupCollapsed(strArray[e]):console.log(strArray[e]) ;} console.groupEnd() } }
