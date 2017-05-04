const FORCE_ALL_DEBUG : boolean = false;

export function debugLog(DEBUG, str){ (DEBUG || FORCE_ALL_DEBUG) && console.log(str) }

export function debugWarn(DEBUG, str){ (DEBUG || FORCE_ALL_DEBUG) && console.warn(str) }

export function debugLogGroup(DEBUG, strArray){ if(DEBUG || FORCE_ALL_DEBUG){ for(let e in strArray){ e == '0' ? console.groupCollapsed(strArray[e]):console.log(strArray[e]) ;} console.groupEnd() } }
