/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2021-2023 CINCHEO
 *                         https://www.cincheo.com
 *                         renaud.pawlak@cincheo.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

generateFunctionDescriptors = function (object, sort) {
    if (sort) {
        return Object.keys(object).filter(key => key).sort().map(key =>
            ({
                value: key,
                text: key + '(' + $tools.functionParams(object[key]).join(', ') + ')'
            })
        );
    } else {
        return Object.keys(object).map(key => object[key] ?
            {
                value: key,
                text: key + '(' + $tools.functionParams(object[key]).join(', ') + ')'
            } :
            {
                text: ' --- ' + $tools.camelToLabelText(key) + ' --- ',
                disabled: true
            }
        );
    }
}

let defaultColors = [
    '#3366CC',
    '#DC3912',
    '#FF9900',
    '#109618',
    '#990099',
    '#3B3EAC',
    '#0099C6',
    '#DD4477',
    '#66AA00',
    '#B82E2E',
    '#316395',
    '#994499',
    '#22AA99',
    '#AAAA11',
    '#6633CC',
    '#E67300',
    '#8B0707',
    '#329262',
    '#5574A6',
    '#3B3EAC'
];

let variants = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'danger',
    'light',
    'dark',
    'default'
];

let Globals = {};
let $globals = Globals;
window.$globals = $globals;
let __$globals = $globals;

let Tools = {};
let $tools = Tools;
window.$tools = $tools;
let __$tools = $tools;

let CollaborationTools = {};
let $collab = CollaborationTools;
window.$collab = $collab;
let __$collab = $collab;

// To be done to avoid minification to wipe out parameter names
// console.info(JSON.stringify(generateFunctionDescriptors($tools)))
Tools.FUNCTION_DESCRIPTORS = [
    {"text": " --- Array functions --- ", "disabled": true},
    {"value": "arrayConcat", "text": "arrayConcat(array, arrayOrItem)"},
    {"value": "arrayMove", "text": "arrayMove(arr, fromIndex, toIndex)"},
    {"value": "collectUniqueFieldValues", "text": "collectUniqueFieldValues(items, fieldName)"},
    {"value": "range", "text": "range(start, end)"},
    {"value": "characterRange", "text": "characterRange(startChar, endChar)"},
    {"value": "series", "text": "series(initialData, nextFunction: (data, series, index) => data, size = undefined)"},
    {"text": " --- Color functions --- ", "disabled": true},
    {"value": "defaultColor", "text": "defaultColor(index, opacity)"},
    {"value": "isValidColor", "text": "isValidColor(color)"},
    {"value": "hexToRgb", "text": "hexToRgb(hex)"},
    {"value": "rgbToHex", "text": "rgbToHex(r, g, b)"},
    {"value": "colorGradientHex", "text": "colorGradientHex(hexBegin, hexEnd, blendRatio)"},
    {"value": "colorGradientRgb", "text": "colorGradientRgb(rgbBegin, rgbEnd, blendRatio)"},
    {"value": "colorNameToHex", "text": "colorNameToHex(colorName)"},
    {"text": " --- Conversion functions --- ", "disabled": true},
    {"value": "camelToKebabCase", "text": "camelToKebabCase(str)"},
    {"value": "camelToSnakeCase", "text": "camelToSnakeCase(str)"},
    {"value": "camelToLabelText", "text": "camelToLabelText(str, lowerCase = false)"},
    {"value": "kebabToCamelCase", "text": "kebabToCamelCase(str, lowerCase = false)"},
    {"value": "kebabToLabelText", "text": "kebabToLabelText(str, lowerCase = false)"},
    {"value": "snakeToCamelCase", "text": "snakeToCamelCase(str, lowerCase = false)"},
    {"value": "snakeToLabelText", "text": "snakeToLabelText(str, lowerCase = false)"},
    {"value": "markdownToHtml", "text": "markdownToHtml(markdownText)"},
    {"value": "toLabelText", "text": "toLabelText(str, lowerCase = false)"},
    {"value": "csvToArray", "text": "csvToArray(csv, separator, hasHeaders, headers)"},
    {"value": "arrayToCsv", "text": "arrayToCsv(array, separator, keys, headers)"},
    {
        "value": "convertImage",
        "text": "convertImage(sourceImage, dataCallback, quality = 0.5, maxWidth = 800, outputMimeType = 'image/jpg')"
    },
    {"text": " --- Date functions --- ", "disabled": true},
    {"value": "isValidDate", "text": "isValidDate(date)"},
    {"value": "now", "text": "now()"},
    {"value": "date", "text": "date(date)"},
    {"value": "datetime", "text": "datetime(date)"},
    {"value": "time", "text": "time(date)"},
    {"value": "dateRange", "text": "dateRange(dateStart, dateEnd, step, stepKind)"},
    {"value": "diffBusinessDays", "text": "diffBusinessDays(firstDate, secondDate)"},
    {"text": " --- IO and navigation functions --- ", "disabled": true},
    {"value": "loadScript", "text": "loadScript(url, callback)"},
    {"value": "loadStyleSheet", "text": "loadStyleSheet(url, callback)"},
    {"value": "deleteCookie", "text": "deleteCookie(name)"},
    {"value": "getCookie", "text": "getCookie(name)"},
    {"value": "setCookie", "text": "setCookie(name, value, expirationDate)"},
    {"value": "download", "text": "download(data, filename, type)"},
    {
        "value": "upload",
        "text": "upload(callback, resultType = 'text', maxSize = 10*1024, sizeExceededCallback = undefined, conversionOptions = undefined)"
    },
    {"value": "postFileToServer", "text": "postFileToServer(postUrl, file, onLoadCallback = undefined)"},
    {"value": "redirect", "text": "redirect(ui, page)"},
    {"value": "go", "text": "go(pageOrAnchor, [top])"},
    {"value": "currentPage", "text": "currentPage()"},
    {"value": "notifyParentApplication", "text": "notifyParentApplication(messageName, ...arguments)"},
    {
        "value": "requestFromParentApplication",
        "text": "requestFromParentApplication(messageName, responseHandler: (result) => void, ...arguments)"
    },
    {
        "value": "onChildApplicationMessage",
        "text": "onChildApplicationMessage(applicationName, messageName, handler: (...arguments) => any)"
    },
    {"text": " --- String functions --- ", "disabled": true},
    {"value": "linkify", "text": "linkify(text)"},
    {"value": "validateEmail", "text": "validateEmail(email)"},
    {"value": "indexOf", "text": "indexOf(string, substring, occurrence)"},
    {"value": "isValidEmail", "text": "isValidEmail(email)"},
    {"value": "isNotEmpty", "text": "isNotEmpty(string)"},
    {"value": "truncate", "text": "truncate(str, size)"},
    {"text": " --- UI functions --- ", "disabled": true},
    {"value": "toast", "text": "toast(component, title, message, variant = null)"},
    {"value": "icon", "text": "icon(icon, [options])"},
    {"value": "publicResourceUrl", "text": "publicResourceUrl(owner, path)"},
    {"text": " --- Utilities --- ", "disabled": true},
    {"value": "uuid", "text": "uuid()"},
    {"value": "setTimeoutWithRetry", "text": "setTimeoutWithRetry(handler, retries, interval)"},
    {"value": "setTimeoutWhileTrue", "text": "setTimeoutWhileTrue(handler, predicate, interval)"},
    {"value": "toSimpleName", "text": "toSimpleName(qualifiedName)"},
    {"value": "functionBody", "text": "functionBody(f)"},
    {"value": "functionParams", "text": "functionParams(f)"},
    {"value": "inputType", "text": "inputType(type)"},
    {"value": "diff", "text": "diff(array, fields)"},
    {"value": "fireCustomEvent", "text": "fireCustomEvent(eventName, element, data)"},
    {"value": "cloneData", "text": "cloneData(data)"},
    {"value": "filterData", "text": "filterData(data, filter)"},
    {"value": "mapData", "text": "mapData(data, mapper)"},
    {"value": "rect", "text": "rect(component)"},
    {"value": "remSize", "text": "remSize()"}
];
// console.info(JSON.stringify(generateFunctionDescriptors($collab)))
CollaborationTools.FUNCTION_DESCRIPTORS = [
    {"value": "synchronize", "text": "synchronize()"},
    {"value": "share", "text": "share(key, target, [readOnlyTarget])"},
    {"value": "unshare", "text": "unshare(key, targetUserId)"},
    {"value": "sendMail", "text": "sendMail(targetUserId, subject, message)"},
    {"value": "clearSyncDescriptor", "text": "clearSyncDescriptor(key = undefined)"},
    {"value": "deleteRemote", "text": "deleteRemote(key)"},
    {"text": " --- Identity management functions --- ", "disabled": true},
    {"value": "logInWithCredentials", "text": "logInWithCredentials(login, password)"},
    {"value": "getLoggedUser", "text": "getLoggedUser()"},
    {"value": "logOut", "text": "logOut()"},
    {"text": " --- Group functions --- ", "disabled": true},
    {"value": "joinGroup", "text": "joinGroup(group)"},
    {"value": "leaveGroup", "text": "leaveGroup(group)"},
    {"value": "groupMembers", "text": "async groupMembers(group)"}
];

// =====================================================================
// array functions

Tools.arrayFunctions = undefined;

Tools.arrayConcat = function (array, arrayOrItem) {
    if (array == null) {
        return undefined;
    }
    if (arrayOrItem == null) {
        return array;
    }
    array = array.slice(0);
    if (Array.isArray(arrayOrItem)) {
        Array.prototype.push.apply(array, arrayOrItem);
    } else {
        array.push(arrayOrItem);
    }
    return array;
}

Tools.arrayMove = function (arr, fromIndex, toIndex) {
    if (fromIndex === toIndex) {
        return;
    }
    let element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    return arr;
}

Tools.collectUniqueFieldValues = function (items, fieldName) {
    return items.reduce((uniqueFieldValues, item) => {
        if (!uniqueFieldValues.includes(item[fieldName])) {
            uniqueFieldValues.push(item[fieldName]);
        }
        return uniqueFieldValues;
    }, []);
}

Tools.getStoredArray = function (key) {
    let array = JSON.parse(localStorage.getItem(key));
    return array == null ? [] : array;
}

Tools.setStoredArray = function (key, array) {
    localStorage.setItem(key, JSON.stringify(array));
}

Tools.addToStoredArray = function (key, data) {
    let array = Tools.getStoredArray(key);
    array.push(data);
    localStorage.setItem(key, JSON.stringify(array));
}

Tools.removeFromStoredArray = function (key, data) {
    let array = Tools.getStoredArray(key);
    if (data.id) {
        array.splice(array.findIndex(d => d.id === data.id), 1);
    } else {
        array.splice(array.indexOf(data), 1);
    }
    localStorage.setItem(key, JSON.stringify(array));
}

Tools.replaceInStoredArray = function (key, data) {
    let array = Tools.getStoredArray(key);
    if (data.id) {
        array.splice(array.findIndex(d => d.id === data.id), 1, data);
    } else {
        array.splice(array.indexOf(data), 1, data);
    }
    localStorage.setItem(key, JSON.stringify(array));
}

Tools.range = function (start, end) {
    return [...Array(end - start).keys()].map(i => i + start);
}

Tools.characterRange = function (startChar, endChar) {
    return String.fromCharCode(...Tools.range(startChar.charCodeAt(0), endChar.charCodeAt(0)))
}

Tools.series = function (initialData, nextFunction, maxSize) {
    let data = initialData;
    let series = [];
    if (Array.isArray(data)) {
        series.push(...data);
    } else {
        series.push(data);
    }
    while (data !== undefined && series.length < maxSize) {
        series.push(data = nextFunction(data, series, series.length - 1));
    }
    return series;
}

// =====================================================================
// color functions

Tools.colorFunctions = undefined;

Tools.defaultColor = function (index, opacity) {
    if (opacity !== undefined) {
        return defaultColors[index % 20] + Number((opacity * 255 / 100) | 0).toString(16).padStart(2, '0');
    } else {
        return defaultColors[index % 20];
    }
}

Tools.isValidColor = function (color) {
    if (typeof color !== 'string') {
        return false;
    }
    return CSS.supports('color', color);
}

Tools.rgbToHex = function (r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('')
}

Tools.hexToRgb = function (hex) {
    return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        , (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16))
}

Tools.colorGradientRgb = function (rgbStart, rgbEnd, blendRatio) {
    const w = blendRatio * 2 - 1;
    const w1 = (w + 1) / 2.0;
    const w2 = 1 - w1;
    const rgb = [parseInt(rgbStart[0] * w1 + rgbEnd[0] * w2),
        parseInt(rgbStart[1] * w1 + rgbEnd[1] * w2),
        parseInt(rgbStart[2] * w1 + rgbEnd[2] * w2)];
    return rgb;
}

Tools.colorGradientHex = function (hexStart, hexEnd, blendRatio) {
    return Tools.rgbToHex(...Tools.colorGradientRgb(Tools.hexToRgb(hexStart), Tools.hexToRgb(hexEnd), blendRatio));
}

Tools.colorNameToHex = function (colorName) {
    const colors = {
        "aliceblue": "#f0f8ff",
        "antiquewhite": "#faebd7",
        "aqua": "#00ffff",
        "aquamarine": "#7fffd4",
        "azure": "#f0ffff",
        "beige": "#f5f5dc",
        "bisque": "#ffe4c4",
        "black": "#000000",
        "blanchedalmond": "#ffebcd",
        "blue": "#0000ff",
        "blueviolet": "#8a2be2",
        "brown": "#a52a2a",
        "burlywood": "#deb887",
        "cadetblue": "#5f9ea0",
        "chartreuse": "#7fff00",
        "chocolate": "#d2691e",
        "coral": "#ff7f50",
        "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc",
        "crimson": "#dc143c",
        "cyan": "#00ffff",
        "darkblue": "#00008b",
        "darkcyan": "#008b8b",
        "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9",
        "darkgreen": "#006400",
        "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b",
        "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00",
        "darkorchid": "#9932cc",
        "darkred": "#8b0000",
        "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f",
        "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f",
        "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3",
        "deeppink": "#ff1493",
        "deepskyblue": "#00bfff",
        "dimgray": "#696969",
        "dodgerblue": "#1e90ff",
        "firebrick": "#b22222",
        "floralwhite": "#fffaf0",
        "forestgreen": "#228b22",
        "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff",
        "gold": "#ffd700",
        "goldenrod": "#daa520",
        "gray": "#808080",
        "green": "#008000",
        "greenyellow": "#adff2f",
        "honeydew": "#f0fff0",
        "hotpink": "#ff69b4",
        "indianred ": "#cd5c5c",
        "indigo": "#4b0082",
        "ivory": "#fffff0",
        "khaki": "#f0e68c",
        "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5",
        "lawngreen": "#7cfc00",
        "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6",
        "lightcoral": "#f08080",
        "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgrey": "#d3d3d3",
        "lightgreen": "#90ee90",
        "lightpink": "#ffb6c1",
        "lightsalmon": "#ffa07a",
        "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa",
        "lightslategray": "#778899",
        "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0",
        "lime": "#00ff00",
        "limegreen": "#32cd32",
        "linen": "#faf0e6",
        "magenta": "#ff00ff",
        "maroon": "#800000",
        "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd",
        "mediumorchid": "#ba55d3",
        "mediumpurple": "#9370d8",
        "mediumseagreen": "#3cb371",
        "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc",
        "mediumvioletred": "#c71585",
        "midnightblue": "#191970",
        "mintcream": "#f5fffa",
        "mistyrose": "#ffe4e1",
        "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead",
        "navy": "#000080",
        "oldlace": "#fdf5e6",
        "olive": "#808000",
        "olivedrab": "#6b8e23",
        "orange": "#ffa500",
        "orangered": "#ff4500",
        "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98",
        "paleturquoise": "#afeeee",
        "palevioletred": "#d87093",
        "papayawhip": "#ffefd5",
        "peachpuff": "#ffdab9",
        "peru": "#cd853f",
        "pink": "#ffc0cb",
        "plum": "#dda0dd",
        "powderblue": "#b0e0e6",
        "purple": "#800080",
        "rebeccapurple": "#663399",
        "red": "#ff0000",
        "rosybrown": "#bc8f8f",
        "royalblue": "#4169e1",
        "saddlebrown": "#8b4513",
        "salmon": "#fa8072",
        "sandybrown": "#f4a460",
        "seagreen": "#2e8b57",
        "seashell": "#fff5ee",
        "sienna": "#a0522d",
        "silver": "#c0c0c0",
        "skyblue": "#87ceeb",
        "slateblue": "#6a5acd",
        "slategray": "#708090",
        "snow": "#fffafa",
        "springgreen": "#00ff7f",
        "steelblue": "#4682b4",
        "tan": "#d2b48c",
        "teal": "#008080",
        "thistle": "#d8bfd8",
        "tomato": "#ff6347",
        "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3",
        "white": "#ffffff",
        "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00",
        "yellowgreen": "#9acd32"
    };

    if ((typeof colorName === 'string') && (typeof colors[colorName.toLowerCase()] != 'undefined')) {
        return colors[colorName.toLowerCase()];
    }

    return colorName;

}


// =====================================================================
// conversion functions

Tools.conversionFunctions = undefined;

Tools.camelToKebabCase = function (str) {
    if (str.charAt(0).toUpperCase() === str.charAt(0)) {
        str = str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

Tools.camelToSnakeCase = function (str) {
    if (str.charAt(0).toUpperCase() === str.charAt(0)) {
        str = str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

Tools.camelToLabelText = function (str, lowerCase = false) {
    str = str.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);
    if (lowerCase) {
        return str;
    } else {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

Tools.kebabToCamelCase = function (str, lowerCase = false) {
    str = str.replace(/-[a-z]/g, match => `${match[1].toUpperCase()}`);
    if (lowerCase) {
        return str;
    } else {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

Tools.kebabToLabelText = function (str, lowerCase = false) {
    str = str.replace(/-/g, letter => ` `);
    if (lowerCase) {
        return str;
    } else {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

Tools.snakeToCamelCase = function (str, lowerCase = false) {
    str = str.replace(/_[a-z]/g, match => `${match[1].toUpperCase()}`);
    if (lowerCase) {
        return str;
    } else {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

Tools.snakeToLabelText = function (str, lowerCase = false) {
    str = str.replace(/_/g, letter => ` `);
    if (lowerCase) {
        return str;
    } else {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

let _showdown;

Tools.markdownToHtml = function (markdownText) {
    if (!_showdown) {
        _showdown = new showdown.Converter();
    }
    return _showdown.makeHtml(markdownText);
}

Tools.toLabelText = function (str, lowerCase = false) {
    return Tools.camelToLabelText(Tools.snakeToCamelCase(str, true), lowerCase);
}

Tools.csvToArray = function (csv, separator, hasHeaders, headers) {
    const lines = csv.split('\n');
    const result = [];
    headers = headers || lines[0].split(separator);

    for (let i = (hasHeaders === false ? 0 : 1); i < lines.length; i++) {
        if (!lines[i]) {
            continue;
        }
        const obj = {};
        const currentLine = lines[i].split(separator);

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        result.push(obj);
    }
    return result
}

Tools.arrayToCsv = function (array, separator, keys, headers) {
    keys = keys ? keys : (array.length > 0 ? Object.keys(array[0]) : []);
    let result = headers ? headers.join(separator) + '\r\n' : keys.join(separator) + '\r\n';

    for (let i = 0; i < array.length; i++) {
        result += keys.map(key => array[i][key]).join(separator) + '\r\n';
    }

    return result
}

/**
 * A function to convert an image object to another with different type, quality, and max width.
 *
 * @param sourceImageData (base64 encoded)
 * @param dataCallback if defined, called with a new image data (base64 encoded)
 * @param outputMimeType defaults to "image/jpeg"
 * @param quality defaults to 0.5
 * @param maxWidth defaults to 800
 * @param blobCallback if defined, the function converts the result to binary and invokes this callback
 */
Tools.convertImage = function (sourceImage,
                               dataCallback,
                               quality = 0.5,
                               maxWidth = 800,
                               outputMimeType = "image/jpeg",
                               blobCallback = undefined) {
    let sourceImageObject = new Image();
    sourceImageObject.onload = () => {
        console.info("LOADED IMAGE");
        let canvasElement = document.createElement('canvas');
        let natW = sourceImageObject.naturalWidth;
        let natH = sourceImageObject.naturalHeight;
        let ratio = natH / natW;
        if (maxWidth === undefined) {
            maxWidth = natW;
        }
        if (natW > maxWidth) {
            natW = maxWidth;
            natH = ratio * maxWidth;
        }

        canvasElement.width = natW;
        canvasElement.height = natH;

        const ctx = canvasElement.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "low";
        ctx.drawImage(sourceImageObject, 0, 0, natW, natH);
        if (blobCallback) {
            canvasElement.toBlob(blobCallback);
        }
        if (dataCallback) {
            dataCallback(canvasElement.toDataURL(outputMimeType, quality));
        }
    }
    sourceImageObject.src = sourceImage;

}

// =====================================================================
// Date functions

Tools.dateFunctions = undefined;

Tools.isValidDate = function (date) {
    return moment(date).isValid();
}

Tools.now = function () {
    return new Date();
}

Tools.date = function (date) {
    return date.toISOString().split('T')[0];
}

Tools.datetime = function (date) {
    return date.toISOString();
}

Tools.time = function (date) {
    return date.toISOString().split('T')[1];
}

Tools.dateRange = function (dateStart, dateEnd, step, stepKind) {
    if (!step || step === 0 || !stepKind || ['day', 'month', 'year'].indexOf(stepKind) === -1) {
        return [];
    }
    dateStart = moment(dateStart);
    dateEnd = moment(dateEnd);
    let dateValues = [];

    while (dateEnd.isAfter(dateStart)) {
        dateValues.push(moment(dateStart).toDate());
        dateStart.add(step, stepKind);
    }
    return dateValues;
}

Tools.diffBusinessDays = function (firstDate, secondDate) {
    // EDIT : use of startOf
    let day1 = moment(firstDate).startOf('day');
    let day2 = moment(secondDate).startOf('day');
    // EDIT : start at 1
    let adjust = 1;

    if ((day1.dayOfYear() === day2.dayOfYear()) && (day1.year() === day2.year())) {
        return 0;
    }

    if (day2.isBefore(day1)) {
        const temp = day1;
        day1 = day2;
        day2 = temp;
    }

    //Check if first date starts on weekends
    if (day1.day() === 6) { //Saturday
        //Move date to next week monday
        day1.day(8);
    } else if (day1.day() === 0) { //Sunday
        //Move date to current week monday
        day1.day(1);
    }

    //Check if second date starts on weekends
    if (day2.day() === 6) { //Saturday
        //Move date to current week friday
        day2.day(5);
    } else if (day2.day() === 0) { //Sunday
        //Move date to previous week friday
        day2.day(-2);
    }

    const day1Week = day1.week();
    let day2Week = day2.week();

    //Check if two dates are in different week of the year
    if (day1Week !== day2Week) {
        //Check if second date's year is different from first date's year
        if (day2Week < day1Week) {
            day2Week += day1Week;
        }
        //Calculate adjust value to be substracted from difference between two dates
        // EDIT: add rather than assign (+= rather than =)
        adjust += -2 * (day2Week - day1Week);
    }

    return day2.diff(day1, 'days') + adjust;
}

// =====================================================================
// IO & navigation functions

Tools.ioAndNavigationFunctions = undefined;

Tools.loadScript = function (url, callback) {
    console.info("loading remote script", url);
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    script.onreadystatechange = callback;
    script.onload = callback;

    head.appendChild(script);
}

Tools.loadStyleSheet = function (url, callback) {
    console.info("loading remote style sheet", url);
    let head = document.getElementsByTagName('head')[0];
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;

    link.onreadystatechange = callback;
    link.onload = callback;

    head.appendChild(link);
}


Tools.getCookie = function (name) {
    let cookie = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookie) == 0) {
            return c.substring(cookie.length, c.length);
        }
    }
    return "";
}

Tools.setCookie = function (name, value, expirationDate) {
    let expires = undefined;
    if (expirationDate) {
        expires = "expires=" + d.toUTCString();
    }
    if (expires) {
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    } else {
        document.cookie = name + "=" + value + ";path=/";
    }
}

Tools.deleteCookie = function (name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

Tools.b64toBlob = function (b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

Tools.download = function (data, filename = 'data.txt', mimeType = 'text/plain') {
    let downloadBlob = blob => {
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(blob, filename);
        else { // Others
            let a = document.createElement("a"),
                url = URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    if (typeof data === 'string' && mimeType.startsWith('image/')) {
        Tools.convertImage(data, undefined, 1, undefined, mimeType, blob => {
            downloadBlob(blob);
        })
    } else {
        downloadBlob(new Blob([data], {type: mimeType}));
    }
}

Tools.downloadURI = function (uri, name) {
    let link = document.createElement("a");
    if (name) {
        link.download = name;
    }
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

Tools.upload = function (callback,
                         resultType = 'text',
                         maxSize = 1024 * 10,
                         sizeExceededCallback = undefined,
                         conversionOptions) {
    let input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        let file = e.target.files[0];
        if (resultType === 'file') {
            if (maxSize && file.size > maxSize) {
                if (sizeExceededCallback) {
                    sizeExceededCallback();
                } else {
                    alert('Uploaded file exceeds maximum size (' + file.size + ' > ' + maxSize + ')');
                }
            } else {
                callback(file);
            }
            return;
        }
        let reader = new FileReader();
        reader.onload = readerEvent => {
            let content = readerEvent.target.result; // this is the content!
            if (conversionOptions && conversionOptions.mimeType && conversionOptions.mimeType.startsWith('image/')) {
                Tools.convertImage(content,
                    content => {
                        if (maxSize && content.length > maxSize) {
                            if (sizeExceededCallback) {
                                sizeExceededCallback();
                            } else {
                                alert('Uploaded converted image exceeds maximum size (' + content.length + ' > ' + maxSize + ')');
                            }
                        } else {
                            callback(content);
                        }
                    },
                    conversionOptions.quality, conversionOptions.maxWidth, conversionOptions.mimeType
                );
                //content = Tools.convertImage(window.content, 0.5, 200, 'image/jpeg');
            } else {
                if (maxSize && content.length > maxSize) {
                    if (sizeExceededCallback) {
                        sizeExceededCallback();
                    } else {
                        alert('Uploaded file content exceeds maximum size (' + content.length + ' > ' + maxSize + ')');
                    }
                } else {
                    callback(content);
                }
            }
        }
        if (resultType) {
            switch (resultType) {
                case 'text':
                    reader.readAsText(file);
                    break;
                default:
                    reader.readAsDataURL(file);
            }
        } else {
            reader.readAsText(file);
        }
    }
    input.click();
}

Tools.postFileToServer = function (postUrl, fileObj, onLoadCallback) {
    let formData = new FormData()
    // 'file' is the "name" of the form input being uploaded
    // We explicitly pass the filename as the 3rd argument, as IE has a habit of
    // incorrectly inferring the file name from the file object
    formData.append('file', fileObj, fileObj.name)

    let req = new XMLHttpRequest()
    req.open("POST", postUrl);
    req.onload = function (event) {
        if (onLoadCallback) {
            onLoadCallback(event);
        }
    }
    // Send the "Form"
    req.send(formData)
}

Tools.redirect = function (ui, page) {
    ide.load(ui, page);
}

Tools.go = function (pageOrAnchor, top) {
    if ((typeof pageOrAnchor === 'string') && pageOrAnchor.startsWith('#')) {
        location.hash = pageOrAnchor;
    } else {
        if (top) {
            window.top.ide.router.push(pageOrAnchor);
        } else {
            ide.router.push(pageOrAnchor);
        }
    }
}

Tools.currentPage = function () {
    return ide.router.currentRoute.name;
}

Tools.notifyParentApplication = function (messageName, ...args) {
    console.info('notify parent application (if any)', messageName, ...args);
    if (window.parent !== window) {
        window.parent.postMessage({
            applicationName: applicationModel.name,
            messageName: messageName,
            args: args,
        }, '*');
    }
}

Tools.requestFromParentApplication = function (messageName, responseHandler, ...args) {
    if (window.parent !== window) {
        const request = {
            applicationName: applicationModel.name,
            messageName: messageName,
            requestId: $tools.uuid(),
            args: args
        };
        window.parent.postMessage(request, '*');
        const wrappedHandler = event => {
            window.removeEventListener("message", wrappedHandler);
            if (event.data.responseName === "RESPONSE_" + request.messageName && event.data.requestId === request.requestId) {
                responseHandler(event.data.result);
            }
        };
        window.addEventListener("message", wrappedHandler, false);
        // 5-second timeout to receive the response from the parent
        setTimeout(() => {
            window.removeEventListener("message", wrappedHandler);
        }, 5000);
    }

}

let _registeredMessageHandlers = new Map();

Tools.onChildApplicationMessage = function (applicationName, messageName, handler) {
    if (!applicationName || !messageName || !handler) {
        throw new Error('wrong message handler definition');
    }
    const handlerKey = applicationName + "::" + messageName;
    const wrappedHandler = event => {
        if (event.data.applicationName === applicationName || applicationName === '*') {
            if (event.data.messageName === messageName) {
                const result = handler(...event.data.args);
                if (event.data.requestId && result) {
                    const response = {
                        applicationName: event.data.applicationName,
                        responseName: 'RESPONSE_' + event.data.messageName,
                        requestId: event.data.requestId,
                        result: result
                    };
                    for (let i = 0; i < window.frames.length; i++) {
                        if (window.frames[i].applicationModel?.name === event.data.applicationName) {
                            window.frames[i].postMessage(response, '*');
                        }
                    }
                }
            }
        }
    };
    if (_registeredMessageHandlers.has(handlerKey)) {
        window.removeEventListener("message", _registeredMessageHandlers.get(handlerKey));
    }
    window.addEventListener("message", wrappedHandler, false);
    _registeredMessageHandlers.set(handlerKey, wrappedHandler);
    return handler;
}

// =====================================================================
// string functions

Tools.stringFunctions = undefined;

Tools.linkify = function (text) {
    if (!(typeof text === 'string')) {
        return text;
    }

    // http://, https://, ftp://
    let urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

    // www. sans http:// or https://
    let pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    // Email addresses
    let emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

    return text
        .replace(urlPattern, '<a target="_blank" href="$&">$&</a>')
        .replace(pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
}

Tools.validateEmail = function (email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

Tools.indexOf = function (string, substring, occurrence) {
    return string.split(substring, occurrence).join(substring).length;
}

Tools.isValidEmail = function (email) {
    return Tools.validateEmail(email);
}

Tools.isNotEmpty = function (string) {
    return string !== undefined && string.length > 0;
}

Tools.truncate = function (str, size) {
    if (str.length > size - 6) {
        return str.substring(0, size - 6) + "(...)";
    } else {
        return str;
    }
}

// =====================================================================
// UI functions

Tools.uiFunctions = undefined;

Tools.toast = function (component, title, message, variant = null) {
    component.$bvToast.toast(message, {
        title: title,
        variant: variant,
        solid: true,
        size: 'lg'
    });
}

let CustomIconComponent = Vue.extend(Vue.component('CustomIconComponent', {
    template: `
        <b-icon :icon="icon" 
            :flip-h="options.flipH" 
            :flip-v="options.flipV" 
            :shift-h="options.shiftH" 
            :shift-v="options.shiftV" 
            :font-scale="options.fontScale"
            :rotate="options.rotate"
            :scale="options.scale"
            :variant="options.variant"
            :animation="options.animation"
        />
    `,
    props: ['icon', 'options']
}));

Tools.icon = function (icon, options) {
    let iconComponent = new CustomIconComponent({
        propsData: {icon: icon, options: options || {}}
    });
    iconComponent.$mount();
    return iconComponent.$el.outerHTML;
}

Tools.publicResourceUrl = function (owner, path) {
    return `api/file_get.php?user=${encodeURIComponent(owner)}&path=${encodeURIComponent(path)}`;
}

// =====================================================================
// utilities

Tools.utilities = undefined;

Tools.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

Tools.setTimeoutWithRetry = function (handler, retries, interval) {
    retries = (retries === undefined) ? 1 : retries;
    interval = interval || 100;

    if (retries > 0) {
        setTimeout(() => {
            if (!handler(retries - 1)) {
                Tools.setTimeoutWithRetry(handler, retries - 1, interval);
            }
        }, interval);
    }
}

Tools.setTimeoutWhileTrue = function (handler, predicate, interval) {
    interval = interval || 100;

    if (predicate()) {
        setTimeout(() => {
            if (predicate()) {
                handler();
                Tools.setTimeoutWhileTrue(handler, predicate, interval);
            }
        }, interval);
    }
}

Tools.toSimpleName = function (qualifiedName) {
    return qualifiedName.substring(qualifiedName.lastIndexOf('.') + 1);
}

Tools.functionBody = function (f) {
    let entire = f.toString();
    return entire.toString().slice(entire.toString().indexOf("{") + 1, entire.lastIndexOf("}"));
}

Tools.functionParams = function (f) {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    //const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = f.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).split(',').map(p => p.trim());
    if (result == null)
        result = [];
    return result;
}

Tools.inputType = function (type) {
    switch (type) {
        case 'java.lang.String':
        case 'string':
        case 'text':
            return 'text';
        case 'java.util.Date':
        case 'java.sql.Date':
        case 'date':
            return 'date';
        case 'number':
        case 'int':
        case 'float':
            return 'number';
    }
    return 'text';
}

Tools.diff = function (array, fields) {
    if (!Array.isArray(array)) {
        return [];
    }
    if (fields) {
        return array.map((e, i) => {
            let o = JSON.parse(JSON.stringify(e));
            for (let field of fields) {
                if (i === 0) {
                    o[field] = 0;
                } else {
                    o[field] = o[field] - array[i - 1][field];
                }
            }
            return o;
        });
    } else {
        return array.map((e, i) => {
            let r = 0;
            if (i > 0) {
                r = e - array[i - 1];
            }
            return r;
        });
    }
}

Tools.fireCustomEvent = function (eventName, element, data) {
    'use strict';
    let event;
    data = data || {};
    if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent(eventName, true, true);
    } else {
        event = document.createEventObject();
        event.eventType = eventName;
    }

    event.eventName = eventName;
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            event[key] = data[key];
        }
    }

    if (document.createEvent) {
        element.dispatchEvent(event);
    } else {
        element.fireEvent("on" + event.eventType, event);
    }
}

Tools.cloneData = function (data) {
    const newData = JSON.parse(JSON.stringify(data));
    return newData;
}

Tools.filterData = function (data, filter) {
    return Object
        .fromEntries(Object.entries(data)
            .filter(([key, value]) => filter(value, key)));
}

Tools.mapData = function (data, mapper) {
    return Object
        .fromEntries(Object.entries(data)
            .map(([key, value]) => mapper(value, key)));
}

Tools.rect = function (component) {
    return component.$el.getBoundingClientRect();
}

Tools.remSize = function () {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

// ========================================================================

CollaborationTools.synchronize = async function () {
    return ide.synchronize();
}

CollaborationTools.share = async function (key, target, readOnlyTarget) {
    try {
        return await ide.sync.share(ide.sync.buildKeyString(key), target, readOnlyTarget);
    } catch (e) {
        ide.reportError('danger', 'Sharing failed', e.message);
    }
}

CollaborationTools.unshare = async function (key, targetUserId) {
    return await ide.sync.unshare(ide.sync.buildKeyString(key), targetUserId);
}

CollaborationTools.sendMail = async function (targetUserId, subject, body) {
    return ide.sync.sendMail(targetUserId, subject, body);
}

CollaborationTools.clearSyncDescriptor = function (key) {
    ide.sync.clearSyncDescriptor(ide.sync.buildKeyString(key));
}

CollaborationTools.deleteRemote = function (key) {
    ide.sync.delete(ide.sync.buildKeyString(key));
}

CollaborationTools.identityManagementFunctions = undefined;

CollaborationTools.logInWithCredentials = async function (login, password) {
    return ide.authenticate(login, password);
}

CollaborationTools.getLoggedUser = function () {
    return ide.user;
}

CollaborationTools.logOut = async function () {
    return ide.signOut();
}

CollaborationTools.groupFunctions = undefined;

CollaborationTools.joinGroup = async function (group) {
    return await ide.sync.joinGroup(group);
}

CollaborationTools.leaveGroup = async function (group) {
    return await ide.sync.leaveGroup(group);
}

CollaborationTools.groupMembers = async function (group) {
    return await ide.sync.groupMembers(group);
}

CollaborationTools.deplrecatedFunctions = undefined;

CollaborationTools.authenticate = async function (userId, password) {
    return ide.authenticate(userId, password);
}

CollaborationTools.getUserId = function () {
    return ide.sync.userId;
}

CollaborationTools.getUserEmail = function () {
    return ide.user.email;
}

let XS = 0;
let SM = 576;
let MD = 768;
let LG = 992;
let XL = 1200;
let XXL = 1400;
let PRIMARY;
let SECONDARY;
let SUCCESS;
let INFO;
let WARNING;
let DANGER;
let LIGHT;
let DARK;
let DARK_MODE = false;

/*********************************************************************************************************/

let applicationModel = {
    defaultPage: "index",
    navbar: {
        cid: "navbar",
        type: "NavbarView",
        brand: "App name",
        navigationItems: [{
            pageId: "index",
            label: "Index"
        }]
    },
    autoIncrementIds: {}
};

class Components {
    repository = {};

    applyRenaming(targetModel, oldName, newName) {
        const regexp = new RegExp("(\\$d|\\$c|\\$v)\\(('|\"|`)" + oldName + "\\2", 'g');
        for (let prop of this.propDescriptors(targetModel)) {
            const propValue = targetModel[prop.name];
            if (prop.name === 'dataSource' && propValue === oldName) {
                targetModel[prop.name] = newName;
            } else if (prop.name === 'eventHandlers' && propValue) {
                propValue.forEach(handler => {
                    if (handler.actions) {
                        handler.actions.forEach(action => {
                            if (action.targetId === oldName) {
                                action.targetId = newName;
                            }
                            if (typeof action.condition === 'string') {
                                action.condition = action.condition.replaceAll(regexp, '$1($2' + newName + '$2');
                            }
                            if (typeof action.argument === 'string') {
                                action.argument = action.argument.replaceAll(regexp, '$1($2' + newName + '$2');
                            }
                        });
                    }
                });
            } else {
                if (typeof propValue === 'string' && (prop.type === 'code/javascript' || propValue.startsWith('='))) {
                    targetModel[prop.name] = propValue.replaceAll(regexp, '$1($2' + newName + '$2');
                }
            }
        }
    }

    hasGeneratedId(model) {
        if (model.type.endsWith('Connector') || model.type.endsWith('Mapper')) {
            return false;
        }
        switch (model.type) {
            case 'DialogView':
                return false;
        }
        const chunks = model.cid.split('-');
        return chunks.length > 1 && !isNaN(chunks[chunks.length - 1]) &&
            !isNaN(parseInt(chunks[chunks.length - 1]));
    }

    publicId(model) {
        let publicId;
        if (this.hasGeneratedId(model)) {
            publicId = this.baseId(model.type);
        } else {
            publicId = model.cid;
        }
        return publicId;
    }

    nextId(componentType) {
        if (!applicationModel.autoIncrementIds[componentType]) {
            applicationModel.autoIncrementIds[componentType] = 0;
        }
        let nextId = 0;
        const prefix = this.baseId(componentType) + '-';
        do {
            nextId = applicationModel.autoIncrementIds[componentType];
            applicationModel.autoIncrementIds[componentType] = nextId + 1;
        } while (this.repository.hasOwnProperty(prefix + nextId));
        return prefix + nextId;
    }

    getComponentModels() {
        return Object.values(this.repository);
    }

    getComponentIds() {
        return Object.keys(this.repository);
    }

    clear() {
        this.repository = {};
        Vue.prototype.$eventHub.$emit('repository-cleared');
    }

    getModelNames() {
        return Tools.arrayConcat([], JSON.parse(localStorage.getItem('dlite.models'))).map(model => model.name);
    }

    getModels() {
        let models = JSON.parse(localStorage.getItem('dlite.models'));
        if (models && models.length > 0) {
            models = models.filter(model => model);
        }
        if (!(models && models.length > 0 && models.findIndex(model => model.name === 'default') > -1)) {
            // seeding default model
            const defaultModel = [
                {
                    name: "Login",
                    fields: [
                        {
                            name: "login", type: "string", kind: "value"
                        },
                        {
                            name: "password", type: "string", kind: "value"
                        }
                    ]
                }, {
                    name: "Contact",
                    fields: [
                        {
                            name: "firstName", type: "string", kind: "value"
                        },
                        {
                            name: "lastName", type: "string", kind: "value"
                        },
                        {
                            name: "title",
                            type: "date",
                            kind: "value",
                            options: "=['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']"
                        },
                        {
                            name: "birthDate", type: "date", kind: "value"
                        },
                        {
                            name: "email", type: "string", kind: "value"
                        },
                        {
                            name: "phone", type: "string", kind: "value"
                        },
                    ]
                },
            ];
            localStorage.setItem('dlite.models.default', JSON.stringify(defaultModel));
            models = Tools.arrayConcat([{name: 'default'}], models);
            localStorage.setItem('dlite.models', JSON.stringify(models));
        }
        return models;
    }

    getModelClasses(modelName) {
        return Tools.arrayConcat([], JSON.parse(localStorage.getItem('dlite.models.' + modelName)));
    }

    renameModelClass(modelName, oldClassName, newClassName) {
        console.info('renaming model class: ' + modelName + '.' + oldClassName + " -> " + modelName + '.' + newClassName);
        let modelClasses = $tools.getStoredArray('dlite.models.' + modelName);
        const modelClass = modelClasses.find(modelClass => modelClass.name === oldClassName);
        if (modelClass) {
            modelClass.name = newClassName;
            $tools.setStoredArray('dlite.models.' + modelName, modelClasses);
            this.getModelNames().forEach(modelName => {
                let dirty = false;
                const modelClasses = this.getModelClasses(modelName);
                modelClasses.forEach(modelClass => modelClass.fields.forEach(field => {
                    if (field.type === modelName + '.' + oldClassName) {
                        field.type = modelName + '.' + newClassName;
                        dirty = true;
                    }
                }));
                if (dirty) {
                    $tools.setStoredArray('dlite.models.' + modelName, modelClasses);
                }
            });
        }
    }

    renameModel(oldModelName, newModelName) {
        console.info('renaming model: ' + oldModelName + " -> " + newModelName);
        let models = $tools.getStoredArray('dlite.models');
        const model = models.find(model => model.name === oldModelName);
        if (model) {
            this.getModelNames().forEach(modelName => {
                let dirty = false;
                const modelClasses = this.getModelClasses(modelName);
                modelClasses.forEach(modelClass => modelClass.fields.forEach(field => {
                    const typeModelName = field.type && field.type.split('.').length === 2 ? field.type.split('.')[0] : undefined;
                    if (typeModelName === oldModelName) {
                        field.type = newModelName + '.' + field.type.split('.')[1];
                        dirty = true;
                    }
                }));
                if (dirty) {
                    $tools.setStoredArray('dlite.models.' + modelName, modelClasses);
                }
            });
            model.name = newModelName;
            $tools.setStoredArray('dlite.models', models);
            $tools.setStoredArray('dlite.models.' + newModelName, $tools.getStoredArray('dlite.models.' + oldModelName));
            localStorage.removeItem('dlite.models.' + oldModelName);
        }

    }

    fillComponentModelRepository(viewModel) {
        if (Array.isArray(viewModel)) {
            for (const subModel of viewModel) {
                this.fillComponentModelRepository(subModel);
            }
        } else if (typeof viewModel === 'object') {
            for (const key in viewModel) {
                if (key === 'cid') {
                    this.registerComponentModel(viewModel);
                } else {
                    this.fillComponentModelRepository(viewModel[key]);
                }
            }
        }
    }

    checkIntegrity(viewModel) {
        if (viewModel === undefined) {
            for (let viewModel of this.getRoots()) {
                this.checkIntegrity(viewModel);
            }
            return;
        }
        if (Array.isArray(viewModel)) {
            for (const subModel of viewModel) {
                if (subModel !== undefined) {
                    this.checkIntegrity(subModel);
                }
            }
        } else if (typeof viewModel === 'object') {
            for (const key in viewModel) {
                if (key === 'cid') {
                    if (this.repository[viewModel[key]] !== viewModel) {
                        console.error("integrity error: wrong reference", viewModel);
                    }
                    if (!this.repository.hasOwnProperty(viewModel[key])) {
                        console.error("integrity error: wrong cid", viewModel);
                    }
                    if (viewModel[key]._parentId !== undefined) {
                        console.error("integrity error: parent id is defined", viewModel);
                    }
                } else {
                    if (viewModel[key] !== undefined) {
                        this.checkIntegrity(viewModel[key]);
                    }
                }
            }
        }
    }

    mapTemplate(template, models, mapping) {
        if (Array.isArray(template)) {
            for (const subModel of template) {
                this.mapTemplate(subModel, models, mapping);
            }
        } else if (typeof template === 'object') {
            for (const key in template) {
                if (key === 'cid') {
                    models.push(template);
                    let current = template.cid;
                    if (this.hasGeneratedId(template)) {
                        template.cid = this.nextId(template.type);
                    } else {
                        let index = 1;
                        while (this.getComponentIds().includes(template.cid)) {
                            template.cid = current + (index++);
                        }
                    }
                    if (current !== template.cid) {
                        mapping[current] = template.cid;
                    }
                } else {
                    this.mapTemplate(template[key], models, mapping);
                }
            }
        }
    }

    redirectTemplate(template, models, mapping) {
        for (let model of models) {
            for (let [oldName, newName] of Object.entries(mapping)) {
                this.applyRenaming(model, oldName, newName);
            }
        }
    }

    registerTemplate(template) {
        const mapping = {};
        const models = [];
        this.mapTemplate(template, models, mapping);
        this.redirectTemplate(template, models, mapping);
        this.fillComponentModelRepository(template);
        return template;
    }

    getChildren(viewModel, directChildrenOnly, children) {
        children = children || [];
        const directChildren = this.getDirectChildren(viewModel, true);
        for (const c of directChildren) {
            children.push(c);
            if (directChildrenOnly !== true) {
                this.getChildren(c, directChildrenOnly, children);
            }
        }
        return children;
    }

    getDirectChildren(viewModel, fillParents) {
        let children = [];
        for (const key in viewModel) {
            if (viewModel[key] != null && typeof viewModel[key] === 'object' && viewModel[key].cid !== undefined) {
                if (fillParents) {
                    if (!viewModel[key].hasOwnProperty('_parentId')) {
                        Object.defineProperty(viewModel[key], '_parentId', {enumerable: false, writable: true});
                    }
                    viewModel[key]._parentId = viewModel.cid;
                }
                children.push(viewModel[key]);
            } else if (Array.isArray(viewModel[key])) {
                for (const subModel of viewModel[key]) {
                    if (typeof subModel === 'object' && subModel.cid !== undefined) {
                        if (fillParents) {
                            if (!subModel.hasOwnProperty('_parentId')) {
                                Object.defineProperty(subModel, '_parentId', {enumerable: false, writable: true});
                            }
                            subModel._parentId = viewModel.cid;
                        }
                        children.push(subModel);
                    }
                }
            }
        }
        return children;
    }

    /**
     * Search for a child component in the given parent and returns the key and index.
     * @param parentViewModel the parent model to search into
     * @param childCid the child to find the key / index in the given parent model
     * @returns {undefined|{index: number, key: string}} undefined if the cid does not correspond to any direct child,
     * or an object containing the key and the index where the child is located. Note that the index is -1 if the key
     * is not a array but a simple reference
     */
    getKeyAndIndexInParent(parentViewModel, childCid) {
        for (const key in parentViewModel) {
            if (parentViewModel[key] != null && typeof parentViewModel[key] === 'object' && parentViewModel[key].cid === childCid) {
                return {cid: parentViewModel.cid, key: key, index: -1};
            } else if (Array.isArray(parentViewModel[key])) {
                let index = 0;
                for (const subModel of parentViewModel[key]) {
                    if (typeof subModel === 'object' && subModel.cid === childCid) {
                        return {cid: parentViewModel.cid, key: key, index: index};
                    }
                    index++;
                }
            }
        }
        return undefined;
    }


    hasTrashedComponents() {
        for (let root of this.getRoots()) {
            if (!(root.cid === 'navbar' || root.cid === 'shared' || applicationModel.navbar.navigationItems.find(navItem => navItem.pageId === root.cid))) {
                return true;
            }
        }
        return false;
    }

    emptyTrash() {
        while (this.hasTrashedComponents()) {
            for (let root of this.getRoots()) {
                if (!(root.cid === 'navbar' || root.cid === 'shared' || applicationModel.navbar.navigationItems.find(navItem => navItem.pageId === root.cid))) {
                    this.deleteComponentModel(root.cid);
                }
            }
        }
    }

    getReplacedComponentIdAtLocation(targetLocation) {
        if (targetLocation.cid) {
            let parentComponentModel = components.getComponentModel(targetLocation.cid);
            let keyField = parentComponentModel[targetLocation.key];
            if (!Array.isArray(keyField)) {
                return parentComponentModel[targetLocation.key]?.cid;
            }
        }
        return undefined;
    }

    setChild(targetLocation, childViewModel) {
        if (targetLocation.cid) {
            let parentComponentModel = components.getComponentModel(targetLocation.cid);
            let keyField = parentComponentModel[targetLocation.key];
            if (Array.isArray(keyField)) {
                if (targetLocation.index === undefined) {
                    throw new Error("undefined index for array key")
                }
                if (targetLocation.index >= keyField.length) {
                    keyField.push(childViewModel);
                } else {
                    keyField.splice(targetLocation.index, 0, childViewModel);
                }
            } else {
                if (parentComponentModel[targetLocation.key]) {
                    components.cleanParentId(parentComponentModel[targetLocation.key].cid);
                }
                $set(parentComponentModel, targetLocation.key, childViewModel);
            }
        }
    }

    unsetChild(targetLocation) {
        let unsetComponent;
        if (targetLocation.cid) {
            let parentComponentModel = components.getComponentModel(targetLocation.cid);
            if (Array.isArray(parentComponentModel[targetLocation.key])) {
                if (targetLocation.index === undefined) {
                    throw new Error("undefined index for array key");
                }
                unsetComponent = parentComponentModel[targetLocation.key][targetLocation.index];
                parentComponentModel[targetLocation.key].splice(targetLocation.index, 1);
            } else {
                unsetComponent = parentComponentModel[targetLocation.key];
                parentComponentModel[targetLocation.key] = undefined;
            }
        }
        return unsetComponent?.cid;
    }

    findParent(cid) {
        // for (let model of Object.values(this.repository)) {
        //     if (this.getDirectChildren(model, false).map(c => c.cid).indexOf(cid) > -1) {
        //         return model.cid;
        //     }
        // }
        return this.getComponentModel(cid)._parentId;
    }

    findPathToRoot(cid, path) {
        path = path || [];
        path.unshift(cid);
        const parentId = this.getComponentModel(cid)?._parentId;
        if (!parentId) {
            return path;
        } else {
            return this.findPathToRoot(parentId, path);
        }
    }

    cleanParentIds() {
        for (let model of Object.values(this.repository)) {
            if (model._parentId) model._parentId = undefined;
        }
    }

    cleanParentId(cid) {
        const model = this.getComponentModel(cid);
        if (model && model._parentId) model._parentId = undefined;
    }

    updateParentIds() {
        this.getRoots();
    }

    getRoots() {
        for (let model of Object.values(this.repository)) {
            this.getDirectChildren(model, true);
        }
        let roots = [];
        for (let model of Object.values(this.repository)) {
            if (!model._parentId) {
                roots.push(model);
            }
        }
        if (!roots.find(model => model.cid === "shared")) {
            const sharedContainer = components.createComponentModel('ContainerView');
            sharedContainer.cid = 'shared';
            components.registerComponentModel(sharedContainer)
            roots.push(sharedContainer);
            Vue.prototype.$eventHub.$emit('component-updated', 'shared');
        }
        //this.cleanParentIds();
        return roots;
    }

    deleteComponentModel(cid) {
        delete this.repository[cid];
        Vue.prototype.$eventHub.$emit('component-deleted', this.repository[cid]);
    }

    getComponentModel(componentId) {
        return componentId ? this.repository[componentId] : undefined;
    }

    hasComponent(componentId) {
        return this.repository[componentId] != null;
    }

    getComponentOptions(component) {
        if (typeof component === 'string') {
            component = this.getComponentModel(component);
        }
        return Vue.component(Tools.camelToKebabCase(component.type)).options;
    }

    getViewComponent(componentId) {
        return Vue.component(Tools.camelToKebabCase(this.getComponentModel(componentId).type));
    }

    getView(elementOrComponentId) {
        if (elementOrComponentId instanceof Element) {
            while (elementOrComponentId && !elementOrComponentId['__vue__']) {
                elementOrComponentId = elementOrComponentId.parentElement;
            }
            return elementOrComponentId['__vue__'];
        } else {
            if (elementOrComponentId && elementOrComponentId.viewModel) {
                return elementOrComponentId;
            }
            let element = document.getElementById(elementOrComponentId);
            return element ? this.getView(element) : undefined;
        }
    }

    getHtmlElement(componentId) {
        return document.getElementById(componentId);
    }

    getContainerView(componentId) {
        let view = this.getView(componentId);
        return view ? view.$parent : undefined;
    }

    types = [
        {name: 'NavbarView', label: 'Navigation bar', switchable: false},
        {name: 'ContainerView', label: 'Container', switchable: false},
        {name: 'TableView', label: 'Table', switchable: true},
        {name: 'IteratorView', label: 'Iterator', switchable: false},
        {name: 'HttpConnector', label: 'HTTP connector', switchable: false},
        {name: 'InputView', label: 'Input', switchable: true},
        {name: 'TagsView', label: 'Tags', switchable: true},
        {name: 'TextareaView', label: 'Text area', switchable: true},
        {name: 'TextView', label: 'Text view', switchable: true},
        {name: 'DatepickerView', label: 'Date picker', switchable: true},
        {name: 'TimepickerView', label: 'Time picker', switchable: true},
        {name: 'CheckboxView', label: 'Checkbox', switchable: true},
        {name: 'SelectView', label: 'Select', switchable: true},
        {name: 'ChartView', label: 'Chart', switchable: true},
        {name: 'TimeSeriesChartView', label: 'Time series chart', switchable: true},
        {name: 'CookieConnector', label: 'Cookie connector', switchable: false},
        {name: 'LocalStorageConnector', label: 'Local storage connector', switchable: false},
        {name: 'DataMapper', label: 'Data mapper', switchable: false},
        {name: 'ProgressView', label: 'Progress bar', switchable: true}
    ];

    switchHandlers = {
        "InputView->SelectView": (cid) => {
            const parentIterator = $c(cid).findParent(viewModel => viewModel.type === 'IteratorView');
            const field = $v(cid).field;
            if (parentIterator && Array.isArray($d(parentIterator)) && field && !$v(cid).options) {
                const options = [];
                for (let item of $d(parentIterator)) {
                    if (!options.includes(item[field])) {
                        options.push(item[field]);
                    }
                }
                $v(cid).options = JSON.stringify(options);
            }
        }
    };

    getSwitchHandler(fromType, toType) {
        return this.switchHandlers[fromType + '->' + toType];
    }

    compatibleComponentTypes(dataType) {
        const componentTypes = [];
        if (!dataType) {
            return componentTypes;
        }
        for (const componentType of this.types.filter(type => type.switchable).map(type => type.name)) {
            const allowedDataTypes = this.allowedDataTypes(componentType);
            if (dataType === 'any' || allowedDataTypes.includes(dataType)) {
                componentTypes.push(componentType);
            }
        }
        return componentTypes;
    }

    isValidDataModel(dataType, value) {
        if (dataType === 'text') {
            dataType = 'string';
        }
        switch (dataType) {
            case 'any':
                return true;
            case 'object':
                return (typeof value) === 'object' && !Array.isArray(value);
            case 'string':
            case 'number':
            case 'boolean':
                return (typeof value) === dataType;
            case 'integer':
            case 'int':
                return (typeof value) === 'number' && Number.isInteger(value);
            case 'date':
            case 'datetime':
                return $tools.isValidDate(value);
            case 'color':
                return $tools.isValidColor(value);
            case 'array':
            case 'list':
            case 'set':
                return Array.isArray(value);
        }
        return false;
    }

    getDataTypeForValue(value) {
        if (Array.isArray(value)) {
            return 'array';
        } else {
            return typeof value;
        }
    }

    allowedDataTypes(componentType) {
        switch (componentType) {
            case 'ContainerView':
                return ['object', 'array'];
            case 'TableView':
            case 'IteratorView':
                return ['array'];
            case 'HttpConnector':
                return ['object', 'array', 'any'];
            case 'TagsView':
                return ['array'];
            case 'InputView':
                return ['string', 'number', 'integer', 'date', 'datetime', 'time', 'color'];
            case 'TextareaView':
            case 'TextView':
                return ['string'];
            case 'DatepickerView':
                return ['datetime', 'date'];
            case 'TimepickerView':
                return ["time"];
            case 'CheckboxView':
                return ["boolean"];
            case 'SelectView':
                return ['string', 'number', 'integer', 'date', 'datetime', 'time', 'color'];
            case 'ChartView':
                return ['array', 'object'];
            case 'TimeSeriesChartView':
                return ['array'];
            case 'CookieConnector':
                return ['object', 'array', 'any'];
            case 'LocalStorageConnector':
                return ['object', 'array'];
            case 'DataMapper':
                return ['object', 'array', 'any'];
            case 'ProgressView':
                return ['number', 'integer'];
        }

    }

    createComponentModel(type, targetId) {
        let viewModel = undefined;
        const targetModel = this.getComponentModel(targetId);
        switch (type) {
            case 'SplitView':
                viewModel = {
                    dataSource: targetModel ? '$parent' : undefined,
                    orientation: 'VERTICAL',
                    primaryComponentSize: 50,
                    secondaryComponentSize: 50,
                    primaryComponent: {},
                    secondaryComponent: {}
                };
                break;
            case 'ContainerView':
                viewModel = {
                    dataType: "object",
                    layout: "block",
                    components: [],
                    defaultValue: "={}"
                };
                if (targetModel) {
                    viewModel.dataSource = '$parent';
                    if (targetModel.type !== 'IteratorView') {
                        viewModel.dataType = targetModel.dataType;
                    }
                }
                break;
            case 'TabsView':
                const tab = this.createComponentModel('ContainerView');
                tab.title = '(no title)';
                tab.dataSource = '$parent';
                this.registerComponentModel(tab);
                viewModel = {
                    tabs: [tab],
                    lazy: true
                };
                if (targetModel) {
                    tab.dataSource = viewModel.dataSource = '$parent';
                    tab.dataType = viewModel.dataType = targetModel.dataType;
                }
                break;
            case 'CardView':
                viewModel = {
                    imgPosition: "top",
                    header: {},
                    body: {},
                    footer: {}
                };
                if (targetModel) {
                    viewModel.dataSource = '$parent';
                    viewModel.dataType = targetModel.dataType;
                }
                break;
            case 'CollapseView':
                viewModel = {
                    body: {}
                };
                break;
            case 'IteratorView':
                viewModel = {
                    dataType: "array",
                    defaultValue: '=[]',
                    body: {}
                };
                if (targetModel && targetModel.dataType === 'array') {
                    viewModel.dataSource = '$parent';
                    viewModel.dataType = targetModel.dataType;
                }
                break;
            case 'DialogView':
                viewModel = {
                    title: "",
                    content: {}
                };
                break;
            case 'PopoverView':
                viewModel = {
                    title: "",
                    content: {}
                };
                break;
            case 'TableView':
                viewModel = {
                    dataType: "array",
                    fields: [],
                    defaultValue: '=([\n' +
                        '        {x: "a", data1: 30, data2: 4}, \n' +
                        '        {x: "b", data1: 37, data2: 12},\n' +
                        '        {x: "c", data1: 22, data2: 8}\n' +
                        '])'
                };
                if (targetModel && targetModel.dataType === 'array') {
                    viewModel.dataSource = '$parent';
                    viewModel.dataType = targetModel.dataType;
                }
                break;
            case 'ApplicationConnector':
                viewModel = {
                    kind: 'repository',
                    className: "",
                    methodName: "",
                    arguments: "",
                    content: {}
                };
                break;
            case 'HttpConnector':
                viewModel = {
                    dataType: "object",
                    method: 'GET'
                };
                break;
            case 'InputView':
                viewModel = {
                    dataType: "string",
                    label: "",
                    inputType: "text",
                    description: "",
                    field: "",
                    size: "default",
                    disabled: false,
                    placeholder: "",
                    state: undefined,
                    validFeedback: undefined,
                    invalidFeedback: undefined
                };
                break;
            case 'TagsView':
                viewModel = {
                    dataType: "array",
                    size: "default"
                };
                break;
            case 'TextareaView':
                viewModel = {
                    dataType: "string",
                    label: "",
                    description: "",
                    field: "",
                    size: "default",
                    rows: undefined,
                    maxRows: undefined,
                    disabled: false,
                    placeholder: "",
                    state: undefined,
                    validFeedback: undefined,
                    invalidFeedback: undefined
                };
                break;
            case 'ButtonView':
                viewModel = {
                    dataSource: "$parent",
                    label: "Click me",
                    buttonType: "button",
                    eventHandlers: [
                        {
                            global: false,
                            name: '@click',
                            actions: [
                                {
                                    targetId: '$self',
                                    name: 'eval',
                                    description: undefined,
                                    argument: undefined
                                }
                            ]
                        }
                    ]
                };
                break;
            case 'DatepickerView':
                viewModel = {
                    dataType: "datetime",
                    label: '',
                    disabled: false
                };
                break;
            case 'TimepickerView':
                viewModel = {
                    dataType: "time",
                    label: '',
                    disabled: false
                };
                break;
            case 'CheckboxView':
                viewModel = {
                    dataType: "boolean",
                    label: "",
                    size: "default",
                    description: "",
                    field: "",
                    disabled: false,
                    switch: true
                };
                break;
            case 'SelectView':
                viewModel = {
                    label: "",
                    size: "default",
                    description: "",
                    field: "",
                    disabled: false,
                    options: "[]"
                };
                break;
            case 'ImageView':
                viewModel = {
                    src: "https://picsum.photos/600/400/?image=12",
                    blank: false,
                    blankColor: undefined,
                    display: "fluid",
                    layoutClass: "text-center"
                };
                break;
            case 'EmbedView':
                viewModel = {
                    src: "https://www.youtube.com/embed/lNLjD7_doMY",
                    embedType: "iframe",
                    tag: 'div',
                    aspect: "16by9"
                };
                break;
            case 'IconView':
                viewModel = {
                    icon: "exclamation-triangle"
                };
                break;
            case 'ChartView':
                viewModel = {
                    dataType: "array",
                    label: undefined,
                    chartType: 'line',
                    labels: undefined,
                    width: '400',
                    height: '400',
                    backgroundColor: undefined,
                    borderColor: undefined,
                    borderWidth: undefined,
                    seriesList: [],
                    options: {},
                    defaultValue: '=([\n' +
                        '        {x: "a", data1: 30, data2: 4}, \n' +
                        '        {x: "b", data1: 37, data2: 12},\n' +
                        '        {x: "c", data1: 22, data2: 8}\n' +
                        '])'
                };
                if (targetModel && targetModel.dataType === 'array') {
                    viewModel.dataSource = '$parent';
                    viewModel.dataType = targetModel.dataType;
                }
                break;
            case 'TimeSeriesChartView':
                viewModel = {
                    dataType: "array",
                    chartType: 'line',
                    width: '400',
                    height: '400',
                    timeSeriesList: [
                        {
                            key: 'value1',
                            label: 'Value 1',
                            borderColor: 'red'
                        },
                        {
                            key: 'value2',
                            label: 'Value 2',
                            borderColor: 'blue'
                        }
                    ],
                    defaultValue: '=([\n' +
                        '    {x:moment().format(), value1:23, value2:3}, \n' +
                        '    {x:moment().add(\'hour\', 2).format(), value1:30, value2:17}, \n' +
                        '    {x:moment().add(\'hour\', 3).format(), value1:41, value2:7}\n' +
                        '])'
                };
                if (targetModel && targetModel.dataType === 'array') {
                    viewModel.dataSource = '$parent';
                    viewModel.dataType = targetModel.dataType;
                }
                break;
            case 'CookieConnector':
                viewModel = {
                    dataType: "object",
                    name: undefined,
                    expirationDate: undefined
                };
                break;
            case 'LocalStorageConnector':
                viewModel = {
                    dataType: "array",
                    key: undefined,
                    autoIds: true,
                    defaultValue: '=[]'
                };
                break;
            case 'DataMapper':
                viewModel = {
                    dataType: "array",
                    mapper: undefined
                };
                break;
            case 'TextView':
                viewModel = {
                    dataType: "string",
                    tag: 'div',
                    text: 'Lorem ipsum dolor sit amet.'
                };
                break;
            case 'ApplicationView':
                viewModel = {
                    fillHeight: true
                };
                break;
            case 'PaginationView':
                viewModel = {
                    dataSource: ""
                };
                break;
            case 'PdfView':
                viewModel = {
                    documentPath: basePath + "assets/sample.pdf",
                    class: "w-100",
                    page: 1,
                    scrollbar: true,
                    toolbar: true,
                    messages: false,
                    navbar: true,
                    statusbar: false
                };
                break;
            case 'CarouselView':
                viewModel = {
                    slides: []
                };
                break;
            case 'ProgressView':
                viewModel = {
                    dataType: "number",
                    defaultValue: '=0'
                };
                break;
        }
        if (viewModel) {
            viewModel = Object.assign({cid: undefined, type: type}, viewModel);
            viewModel.type = type;
            if (!viewModel.eventHandlers) {
                viewModel.eventHandlers = [];
            }
        }
        return viewModel;
    }

    baseId(type) {
        let base = Tools.camelToKebabCase(type);
        if (base.endsWith('-view')) {
            return base.substring(0, base.length - 5);
        }
        if (base === 'application-connector') {
            return 'connector';
        }
        if (base.endsWith('-connector')) {
            return base.substring(0, base.length - 10);
        }
        if (base === 'data-mapper') {
            return 'mapper';
        }
        return base;
    }

    unregisterComponentModel(componentId) {
        delete this.repository[componentId];
    }

    registerComponentModel(viewModel, componentId) {
        if (viewModel) {
            if (componentId) {
                viewModel.cid = componentId;
            } else {
                if (viewModel.cid == null) {
                    viewModel.cid = this.nextId(viewModel.type);
                }
            }
            this.repository[viewModel.cid] = viewModel;
            Vue.prototype.$eventHub.$emit('component-created', viewModel.cid);
        }
    }

    loadRoots(roots) {
        this.clear();
        for (let root of roots) {
            this.fillComponentModelRepository(root);
        }
        for (let root of roots) {
            this.checkIntegrity(root);
        }
        for (let root of roots) {
            Vue.prototype.$eventHub.$emit('component-updated', root.cid);
        }
        for (let root of roots) {
            this.checkIntegrity(root);
        }
        // this.repository = repository;
        // this.ids = [];
        // for (let cid in repository) {
        //     this.ids.push(cid);
        // }
        // for (let cid in repository) {
        //     Vue.prototype.$eventHub.$emit('component-updated', cid);
        // }
        // Vue.prototype.$eventHub.$emit('repository-loaded', this.ids);
    }

    isVisibleComponent(viewModel) {
        return viewModel.type.endsWith('View');
    }

    isInteractiveComponent(viewModel) {
        return this.isVisibleComponent(viewModel) && viewModel.type !== 'NavbarView';
    }

    propNames(viewModel) {
        let f = this.getComponentOptions(viewModel).methods.propNames;
        let propNames = f ? f() : undefined;
        if (!propNames) {
            propNames = [];
            for (const propName in viewModel) {
                propNames.push(propName);
            }
        }
        if (propNames.indexOf('publicName') === -1) {
            propNames.unshift('publicName');
        }
        if (this.isVisibleComponent(viewModel)) {
            if (propNames.indexOf('class') === -1) {
                propNames.push('class');
            }
            if (propNames.indexOf('style') === -1) {
                propNames.push('style');
            }
            if (propNames.indexOf('layoutClass') === -1) {
                propNames.push('layoutClass');
            }
            if (propNames.indexOf('layoutStyle') === -1) {
                propNames.push('layoutStyle');
            }
            if (propNames.indexOf('hidden') === -1) {
                propNames.push('hidden');
            }
        }

        // if (propNames.indexOf('dataSource') !== -1 && propNames.indexOf('mapper') === -1) {
        //     propNames.splice(propNames.indexOf('dataSource') + 1, 0, 'mapper');
        // }
        if (propNames.indexOf('defaultValue') === -1) {
            propNames.push('defaultValue');
        }
        if (this.isVisibleComponent(viewModel)) {
            if (this.isInteractiveComponent(viewModel)) {
                if (propNames.indexOf('resizeDirections') === -1) {
                    propNames.push('resizeDirections');
                }
                if (propNames.indexOf('draggable') === -1) {
                    propNames.push('draggable');
                }
                if (propNames.indexOf('dropTarget') === -1) {
                    propNames.push('dropTarget');
                }
                if (propNames.indexOf('checkCanDrop') === -1) {
                    propNames.push('checkCanDrop');
                }
            }
            if (propNames.indexOf('observeIntersections') === -1) {
                propNames.push('observeIntersections');
            }
            // animations
            if (propNames.indexOf('revealAnimation') === -1) {
                propNames.push('revealAnimation');
            }
            if (propNames.indexOf('revealAnimationOccurrence') === -1) {
                propNames.push('revealAnimationOccurrence');
            }
            if (propNames.indexOf('revealAnimationDuration') === -1) {
                propNames.push('revealAnimationDuration');
            }
            if (propNames.indexOf('revealAnimationDelay') === -1) {
                propNames.push('revealAnimationDelay');
            }
        }
        if (propNames.indexOf('init') === -1) {
            if (viewModel.cid === 'shared') {
                propNames.unshift('init');
            } else {
                propNames.push('init');
            }
        }

        return propNames;
    }

    propDescriptors(viewModel) {
        let propDescriptors = [];
        let f = this.getComponentOptions(viewModel).methods.customPropDescriptors;
        let customPropDescriptors = f ? f() : {};

        if (!customPropDescriptors.publicName) {
            customPropDescriptors.publicName = {
                type: 'text',
                label: 'Anchor name',
                editable: true,
                description: 'Generate an anchor for visible components (to be used as navigation points in links or in menus)'
            }
        }
        if (!customPropDescriptors.init) {
            customPropDescriptors.init = {
                type: 'code/javascript',
                label: 'Initialization code',
                editable: true,
                literalOnly: true,
                manualApply: true,
                showActions: true,
                description: "Some JavaScript code to initialize the 'this' component (to be avoided - for advanced users)"
            }
        }
        if (!customPropDescriptors.eventHandlers) {
            customPropDescriptors.eventHandlers = {
                type: 'custom',
                editor: 'events-panel',
                label: 'Events',
                name: 'eventHandlers'
            };
        }
        if (!customPropDescriptors.dataSource) {
            customPropDescriptors.dataSource = {
                type: 'select',
                label: 'Data source',
                name: 'dataSource',
                editable: true,
                options: Tools.arrayConcat(['', '$parent'], components.getComponentModels()
                    .filter(viewModel => components.isComponentInActivePage(viewModel.cid) && !components.hasGeneratedId(viewModel))
                    .map(viewModel => viewModel.cid)
                    .sort())
            };
        }
        if (!customPropDescriptors.mapper) {
            customPropDescriptors.mapper = {
                type: 'code/javascript',
                editable: true,
                literalOnly: true,
                manualApply: true,
                hidden: viewModel => !viewModel.dataSource,
                description: 'A functional expression that maps (transforms, filters, sorts, reduces, ...) the data from the data source to the data model. For example: dataSource => transform(dataSource)'
            };
        }
        if (!customPropDescriptors.class) {
            customPropDescriptors.class = {
                type: 'text',
                label: 'Class',
                editable: true,
                docLink: 'https://bootstrap-vue.org/docs/reference/utility-classes',
                description: 'Class(es) (space-separated) to configure the appearance or layout of the component (see the doc)'
            }
        }
        if (!customPropDescriptors.layoutClass) {
            customPropDescriptors.layoutClass = {
                type: 'text',
                label: 'Container class',
                editable: true,
                docLink: 'https://bootstrap-vue.org/docs/reference/utility-classes',
                description: 'Class(es) (space-separated) to configure the appearance or layout of the component container'
            }
        }
        if (!customPropDescriptors.layoutStyle) {
            customPropDescriptors.layoutStyle = {
                type: 'text',
                label: 'Container CSS style',
                editable: true,
                docLink: 'https://www.w3schools.com/cssref/',
                description: 'CSS to configure the appearance or layout of the component container'
            }
        }
        if (!customPropDescriptors.style) {
            customPropDescriptors.style = {
                type: 'text',
                label: 'CSS style',
                editable: true,
                docLink: 'https://www.w3schools.com/cssref/'
            }
        }
        if (!customPropDescriptors.defaultValue) {
            customPropDescriptors.defaultValue = {
                type: 'textarea',
                label: 'Default value',
                editable: true,
                description: "If undefined, the data model will be initialized with this default value"
            }
        }
        if (!customPropDescriptors.hidden) {
            customPropDescriptors.hidden = {
                type: 'checkbox',
                label: 'Hidden',
                editable: true
            }
        }
        if (!customPropDescriptors.resizeDirections) {
            customPropDescriptors.resizeDirections = {
                type: 'select',
                label: 'Resize direction(s)',
                editable: true,
                options: ['none', 'horizontal', 'vertical', 'both'],
                description: "If a value other than 'none' is selected, the component will be resizable against the given direction(s)"
            }
        }
        if (!customPropDescriptors.draggable) {
            customPropDescriptors.draggable = {
                type: 'checkbox',
                label: 'Draggable',
                editable: true
            }
        }
        if (!customPropDescriptors.dropTarget) {
            customPropDescriptors.dropTarget = {
                type: 'checkbox',
                label: 'Drop target',
                editable: true
            }
        }
        if (!customPropDescriptors.checkCanDrop) {
            customPropDescriptors.checkCanDrop = {
                type: 'checkbox',
                label: 'Drop allowed',
                editable: true,
                description: 'An expression that should return true if dropping the given data is allowed on the current component'
            }
        }
        if (!customPropDescriptors.observeIntersections) {
            customPropDescriptors.observeIntersections = {
                type: 'checkbox',
                editable: true,
                literalOnly: true,
                description: 'When checked, the @intersect event is fired whenever the component intersection with the viewport changes (enters/leaves)'
            }
        }
        if (!customPropDescriptors.revealAnimation) {
            customPropDescriptors.revealAnimation = {
                type: 'select',
                editable: (viewModel => viewModel.observeIntersections === true),
                description: 'An animation to apply to this component when revealed to the user (when entering the viewport)',
                options: [
                    '',
                    'bounce',
                    'flash',
                    'pulse',
                    'rubberBand',
                    'shakeX',
                    'shakeY',
                    'headShake',
                    'swing',
                    'tada',
                    'wobble',
                    'jello',
                    'heartBeat',

                    'backInDown',
                    'backInLeft',
                    'backInRight',
                    'backInUp',

                    'bounceIn',
                    'bounceInDown',
                    'bounceInLeft',
                    'bounceInRight',
                    'bounceInUp',

                    'fadeIn',
                    'fadeInDown',
                    'fadeInDownBig',
                    'fadeInLeft',
                    'fadeInLeftBig',
                    'fadeInRight',
                    'fadeInRightBig',
                    'fadeInUp',
                    'fadeInUpBig',
                    'fadeInTopLeft',
                    'fadeInTopRight',
                    'fadeInBottomLeft',
                    'fadeInBottomRight',

                    'rotateIn',
                    'rotateInDownLeft',
                    'rotateInDownRight',
                    'rotateInUpLeft',
                    'rotateInUpRight',

                    'zoomIn',
                    'zoomInDown',
                    'zoomInLeft',
                    'zoomInRight',
                    'zoomInUp',

                    'slideInDown',
                    'slideInLeft',
                    'slideInRight',
                    'slideInUp'
                ]
            };
        }
        if (!customPropDescriptors.revealAnimationOccurrence) {
            customPropDescriptors.revealAnimationOccurrence = {
                type: 'select',
                label: 'Reveal occurrence',
                editable: (viewModel => (viewModel.observeIntersections === true && viewModel.revealAnimation)),
                options: ['', 'once', 'always'],
                description: "When 'once' is selected, the component is animated only the first time it appears"
            }
        }
        if (!customPropDescriptors.revealAnimationDuration) {
            customPropDescriptors.revealAnimationDuration = {
                type: 'text',
                label: 'Reveal animation duration (ms)',
                editable: (viewModel => (viewModel.observeIntersections === true && viewModel.revealAnimation))
            }
        }
        if (!customPropDescriptors.revealAnimationDelay) {
            customPropDescriptors.revealAnimationDelay = {
                type: 'text',
                label: 'Reveal animation delay (ms)',
                editable: (viewModel => (viewModel.observeIntersections === true && viewModel.revealAnimation))
            }
        }

        if (this.getComponentOptions(viewModel).methods.propNames().indexOf('field') !== -1 && !customPropDescriptors.field) {
            customPropDescriptors.field = {
                type: 'text',
                label: 'Field',
                editable: true,
                description: 'The identifier of the field in the data source (only if the data source is an object)'
            }
        }

        for (const propName of this.propNames(viewModel)) {
            let propDescriptor = customPropDescriptors[propName] ? customPropDescriptors[propName] : {
                type: typeof viewModel[propName] === 'string'
                    ? 'text' : typeof viewModel[propName] === 'boolean'
                        ? 'checkbox' : Array.isArray(viewModel[propName])
                            ? 'table' : (viewModel[propName] && viewModel[propName].cid)
                                ? 'ref' : 'text'
            };
            if (propDescriptor.editable === undefined) {
                propDescriptor.editable = (propName !== 'cid');
            }
            if (propDescriptor.label === undefined) {
                propDescriptor.label = propName === 'cid' ? 'ID' : Tools.camelToLabelText(propName);
            }
            propDescriptor.name = propName;
            propDescriptors.push(propDescriptor);
        }

        for (const propDescriptor of propDescriptors) {
            if (!propDescriptor.category) {
                switch (propDescriptor.name) {
                    case 'eventHandlers':
                        propDescriptor.category = 'events';
                        break;
                    case 'dataSource':
                    case 'mapper':
                    case 'field':
                    case 'defaultValue':
                        propDescriptor.category = 'data';
                        break;
                    case 'class':
                    case 'layoutClass':
                    case 'layoutStyle':
                    case 'style':
                    case 'variant':
                    case 'size':
                        propDescriptor.category = 'style';
                        break;
                    case 'publicName':
                    case 'draggable':
                    case 'dropTarget':
                    case 'checkCanDrop':
                    case 'resizeDirections':
                    case 'revealAnimationOccurrence':
                    case 'revealAnimation':
                    case 'revealAnimationDuration':
                    case 'revealAnimationDelay':
                    case 'observeIntersections':
                    case 'init':
                        propDescriptor.category = '...';
                        break;
                    default:
                        propDescriptor.category = 'main';
                }
            }
        }

        return propDescriptors;
    }

    defaultModelProvider() {
        return {
            lookupType(modelName, className) {
                return JSON.parse(localStorage.getItem('dlite.models.' + modelName)).find(c => c.name === className)
            }
        }
    }

    buildInstanceForm(modelProvider, instanceType, inline, disabled, dataSource) {
        let instanceContainer = this.createComponentModel("ContainerView");
        instanceContainer.dataSource = dataSource;

        if (inline) {
            instanceContainer.direction = 'row';
        }

        for (let propName of instanceType.fields) {
            let prop = undefined;
            if (typeof propName !== 'string') {
                prop = propName;
                propName = prop.name;
            } else {
                prop = instanceType.fieldDescriptors[propName];
            }
            let component = undefined;
            if (prop.options) {
                component = components.createComponentModel("SelectView");
                if (typeof prop.options === 'string' && prop.options.startsWith('=')) {
                    component.options = prop.options;
                } else {
                    component.options = '=' + JSON.stringify(prop.options);
                }
                if (prop.kind === 'set' || prop.kind === 'list') {
                    component.multiple = true;
                    if (!prop.defaultValue) {
                        component.defaultValue = '=[]';
                    }
                }
            } else {
                switch (prop.type) {
                    case 'java.lang.Boolean':
                    case 'boolean':
                        component = components.createComponentModel("CheckboxView");
                        component.dataType = 'boolean';
                        break;
                    case 'date':
                    case 'java.lang.Date':
                        component = components.createComponentModel("DatepickerView");
                        component.dataType = 'date';
                        break;
                    case 'text':
                    case 'string':
                    case 'int':
                    case 'float':
                        component = components.createComponentModel("InputView");
                        component.inputType = Tools.inputType(prop.type);
                        component.dataType = component.inputType === 'text' ? 'string' : 'number';
                        break;
                    default:
                        if (prop.type) {
                            const i = prop.type.lastIndexOf('.');
                            if (i !== -1) {
                                const className = prop.type.slice(i + 1);
                                const modelName = prop.type.slice(0, i);
                                const type = modelProvider.lookupType(modelName, className); // JSON.parse(localStorage.getItem('dlite.models.' + modelName)).find(c => c.name === className);
                                console.info("building instance form", className, modelName);
                                component = components.createComponentModel("CardView");
                                component.headerEnabled = true;
                                component.header = components.createComponentModel("TextView");
                                component.header.tag = 'b';
                                component.header.text = Tools.toLabelText(prop.field ? prop.field : prop.name);
                                components.registerComponentModel(component.header);
                                switch (prop.kind) {
                                    case 'value':
                                    case 'reference':
                                        component.body = this.buildInstanceForm(modelProvider, type);
                                        if (!prop.defaultValue) {
                                            component.body.defaultValue = '={}';
                                        }
                                        break;
                                    case 'set':
                                    case 'list':
                                        component.body = this.buildCollectionForm(modelProvider, type, prop);
                                        if (!prop.defaultValue) {
                                            component.body.defaultValue = '=[]';
                                        }
                                        break;
                                }
                            }
                        } else {
                            component = components.createComponentModel("InputView");
                            break;
                        }
                }
            }
            if (!component) {
                console.error('cannot build component for prop', prop);
            } else {
                if (disabled) {
                    component.disabled = true;
                }
                if (inline) {
                    component.size = 'sm';
                    component.class = 'mr-2 mb-0';
                    component.layoutClass = 'align-self-end';
                }
                if (component.type === 'CardView') {
                    component.body.field = prop.field ? prop.field : prop.name;
                    component.body.dataSource = '$parent';
                    component.dataSource = '$parent';
                    if (prop.defaultValue) {
                        component.body.defaultValue = prop.defaultValue;
                    }
                    components.registerComponentModel(component.body);
                } else {
                    component.field = prop.field ? prop.field : prop.name;
                    component.dataSource = '$parent';
                    component.label = Tools.toLabelText(prop.field ? prop.field : prop.name);
                    if (prop.defaultValue) {
                        component.defaultValue = prop.defaultValue;
                    }
                }
                components.registerComponentModel(component);
                instanceContainer.components.push(component);
            }
        }
        return instanceContainer;
    }

    fillTableFields(tableView, instanceType) {
        for (let prop of instanceType.fields) {
            tableView.fields.push({
                key: prop.name,
                label: Tools.toLabelText(prop.name)
            });
        }
        return tableView;
    }

    // buildCollectionAddDialog(
    //     modelProvider, instanceType, key,
    //     split, collectionContainerType, createInstance, updateInstance, deleteInstance,
    //     useClassNameInButtons, dataSource
    // ) {
    //     let createDialog = undefined;
    //         createDialog = components.createComponentModel("DialogView");
    //         createDialog.title = "Create" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
    //         let createInstanceContainer = components.buildInstanceForm(modelProvider, instanceType);
    //         createInstanceContainer.dataSource = '$object';
    //         let doCreateButton = components.createComponentModel("ButtonView");
    //         doCreateButton.block = true;
    //         doCreateButton.variant = 'primary';
    //         doCreateButton.label = "Create";
    //         doCreateButton.icon = "plus";
    //         doCreateButton.eventHandlers[0].actions[0] = {
    //             targetId: collectionConnector.cid,
    //             name: 'eval',
    //             description: 'Add ID if not exist',
    //             condition: '!parent.dataModel.id',
    //             argument: 'parent.dataModel.id = Tools.uuid()'
    //         }
    //         doCreateButton.eventHandlers[0].actions.push({
    //             targetId: collectionConnector.cid,
    //             name: 'addData',
    //             description: 'Update collection content',
    //             argument: '$d(parent)'
    //         });
    //
    //         components.registerComponentModel(doCreateButton);
    //         createInstanceContainer.components.push(doCreateButton);
    //         components.registerComponentModel(createInstanceContainer);
    //         createDialog.content = createInstanceContainer;
    //         components.registerComponentModel(createDialog);
    //
    //         doCreateButton.eventHandlers[0].actions.push({
    //             targetId: createDialog.cid,
    //             name: 'hide',
    //             description: 'Close dialog'
    //         });
    //
    //         let createButton = components.createComponentModel("ButtonView");
    //         createButton.block = true;
    //         createButton.variant = 'primary';
    //         createButton.label = "Create" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
    //         createButton.icon = "plus";
    //         createButton.eventHandlers[0].actions[0] = {
    //             targetId: createDialog.cid,
    //             name: 'show',
    //             description: 'Open create dialog',
    //         }
    //         components.registerComponentModel(createButton);
    //         tableContainer.components.push(createButton);
    //         return createDialog;
    //
    // }

    buildCollectionEditor(
        modelProvider, instanceType, key,
        split, collectionContainerType, createInstance, updateInstance, deleteInstance,
        useClassNameInButtons, dataSource
    ) {
        if (!instanceType) {
            return;
        }
        console.info("building collection editor", instanceType);

        let container = components.createComponentModel("ContainerView");

        let collectionConnector;
        if (dataSource) {
            collectionConnector = $v(dataSource);
        } else {
            collectionConnector = components.createComponentModel("LocalStorageConnector");
            collectionConnector.key = key;
            collectionConnector.defaultValue = '=[]';
            components.registerComponentModel(collectionConnector);
            container.components.push(collectionConnector);
        }

        if (collectionContainerType === 'Iterator') {

            let collectionComponent = components.buildCollectionForm(
                modelProvider, instanceType, undefined, !createInstance, !updateInstance, !deleteInstance
            );
            collectionComponent.dataSource = collectionConnector.cid;
            components.registerComponentModel(collectionComponent);
            container.components.push(collectionComponent);

        } else {

            let splitContainer = undefined;
            if (split) {
                splitContainer = components.createComponentModel("SplitView");
                splitContainer.class = "=this.screenWidth <= 800 ? 'p-0' : ''";
                splitContainer.resizableSplit = true;
            }

            let tableContainer = components.createComponentModel("ContainerView");
            tableContainer.class = "=this.screenWidth <= 800 ? 'p-0' : ''";
            let table;

            if (collectionContainerType === 'IteratorTable') {
                table = components.buildCollectionForm(
                    modelProvider, instanceType, undefined, true, !updateInstance, !deleteInstance
                );
            } else {
                table = components.createComponentModel("TableView");
                table.selectMode = 'single';
                this.fillTableFields(table, instanceType);
            }
            table.dataSource = collectionConnector.cid;

            let updateButton = undefined;
            let updateInstanceContainer = undefined;
            if (splitContainer) {
                updateInstanceContainer = components.buildInstanceForm(modelProvider, instanceType);
                updateInstanceContainer.hidden = "=this.screenWidth <= 800";
                if (updateInstance && collectionContainerType !== 'IteratorTable') {
                    updateButton = components.createComponentModel("ButtonView");
                    updateButton.block = true;
                    updateButton.variant = 'primary';
                    updateButton.label = "Update" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
                    updateButton.icon = "check";
                    components.registerComponentModel(updateButton);
                    updateInstanceContainer.components.push(updateButton);
                }

                components.registerComponentModel(updateInstanceContainer);

                table.eventHandlers.push(
                    {
                        global: false,
                        name: '@item-selected',
                        actions: [
                            {
                                targetId: updateInstanceContainer.cid,
                                name: 'setData',
                                description: 'Update instance form',
                                condition: 'value',
                                argument: 'value'
                            }
                        ]
                    }
                );
            }

            components.registerComponentModel(table);
            tableContainer.components.push(table);

            if (updateButton) {
                updateButton.eventHandlers[0].actions[0] = {
                    targetId: collectionConnector.cid,
                    name: 'replaceDataAt',
                    description: 'Update collection',
                    condition: `$c('${table.cid}').selectedItem`,
                    argument: `$d(parent), $d('${table.cid}').indexOf($c('${table.cid}').selectedItem)`
                }
            }

            // UPDATE DIALOG (for mobile or !split)

            let updateDialog = components.createComponentModel("DialogView");
            updateDialog.title = "Update" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
            let updateInstanceDialogContainer = components.buildInstanceForm(modelProvider, instanceType);
            updateInstanceDialogContainer.dataSource = '$object';
            let doUpdateButton = undefined;
            if (updateInstance) {
                doUpdateButton = components.createComponentModel("ButtonView");
                doUpdateButton.block = true;
                doUpdateButton.variant = 'primary';
                doUpdateButton.label = "Update" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
                doUpdateButton.icon = "check";
                doUpdateButton.eventHandlers[0].actions.push({
                    targetId: collectionConnector.cid,
                    name: 'replaceDataAt',
                    description: 'Update collection content',
                    condition: `$c('${table.cid}').selectedItem`,
                    argument: `$d(parent), $d('${table.cid}').indexOf($c('${table.cid}').selectedItem)`
                });
                components.registerComponentModel(doUpdateButton);
                updateInstanceDialogContainer.components.push(doUpdateButton);
            }
            components.registerComponentModel(updateInstanceDialogContainer);
            updateDialog.content = updateInstanceDialogContainer;
            components.registerComponentModel(updateDialog);

            if (doUpdateButton) {
                doUpdateButton.eventHandlers[0].actions.push({
                    targetId: updateDialog.cid,
                    name: 'hide',
                    description: 'Close dialog'
                });
            }

            if (collectionContainerType !== 'IteratorTable') {
                let openButton = components.createComponentModel("ButtonView");
                openButton.block = true;
                if (splitContainer) {
                    openButton.hidden = "=this.screenWidth > 800";
                }
                openButton.disabled = `=!$c('${table.cid}').selectedItem`;
                openButton.label = "Edit" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
                openButton.icon = "pencil";
                openButton.eventHandlers[0].actions[0] = {
                    targetId: updateDialog.cid,
                    name: 'show',
                    description: 'Open update dialog',
                };
                openButton.eventHandlers[0].actions.push(
                    {
                        targetId: updateInstanceDialogContainer.cid,
                        name: 'setData',
                        argument: `$c('${table.cid}').selectedItem`,
                        description: 'Fill dialog container'
                    }
                );
                components.registerComponentModel(openButton);
                tableContainer.components.push(openButton);
            }

            // END OF UPDATE DIALOG

            let createDialog = undefined;
            if (createInstance) {
                createDialog = components.createComponentModel("DialogView");
                createDialog.title = "Create" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
                let createInstanceContainer = components.buildInstanceForm(modelProvider, instanceType);
                createInstanceContainer.dataSource = '$object';
                let doCreateButton = components.createComponentModel("ButtonView");
                doCreateButton.block = true;
                doCreateButton.variant = 'primary';
                doCreateButton.label = "Create";
                doCreateButton.icon = "plus";
                doCreateButton.eventHandlers[0].actions[0] = {
                    targetId: collectionConnector.cid,
                    name: 'eval',
                    description: 'Add ID if not exist',
                    condition: '!parent.dataModel.id',
                    argument: 'parent.dataModel.id = Tools.uuid()'
                }
                doCreateButton.eventHandlers[0].actions.push({
                    targetId: collectionConnector.cid,
                    name: 'addData',
                    description: 'Update collection content',
                    argument: '$d(parent)'
                });

                components.registerComponentModel(doCreateButton);
                createInstanceContainer.components.push(doCreateButton);
                components.registerComponentModel(createInstanceContainer);
                createDialog.content = createInstanceContainer;
                components.registerComponentModel(createDialog);

                doCreateButton.eventHandlers[0].actions.push({
                    targetId: createDialog.cid,
                    name: 'hide',
                    description: 'Close dialog'
                });

                let createButton = components.createComponentModel("ButtonView");
                createButton.block = true;
                createButton.variant = 'primary';
                createButton.label = "Create" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
                createButton.icon = "plus";
                createButton.eventHandlers[0].actions[0] = {
                    targetId: createDialog.cid,
                    name: 'show',
                    description: 'Open create dialog',
                }
                components.registerComponentModel(createButton);
                tableContainer.components.push(createButton);
            }

            if (deleteInstance && collectionContainerType !== 'IteratorTable') {
                let deleteButton = components.createComponentModel("ButtonView");
                deleteButton.block = true;
                deleteButton.variant = 'danger';
                deleteButton.label = "Delete" + (useClassNameInButtons ? ' ' + Tools.toLabelText(Tools.toSimpleName(instanceType.name), true) : '');
                deleteButton.icon = "trash";
                deleteButton.disabled = `=!$c('${table.cid}').selectedItem`;
                deleteButton.eventHandlers[0].actions[0] = {
                    targetId: collectionConnector.cid,
                    name: 'removeDataAt',
                    description: 'Delete from collection',
                    condition: `$c('${table.cid}').selectedItem`,
                    argument: `$d(target).findIndex(data => data.id === $c('${table.cid}').selectedItem.id)`
                }

                components.registerComponentModel(deleteButton);
                tableContainer.components.push(deleteButton);
            }

            components.registerComponentModel(tableContainer);

            if (splitContainer) {
                splitContainer.primaryComponent = tableContainer;
                splitContainer.secondaryComponent = updateInstanceContainer;
                components.registerComponentModel(splitContainer);
                container.components.push(splitContainer);
            } else {
                container.components.push(tableContainer);
            }

            container.components.push(updateDialog);

            if (createDialog) {
                container.components.push(createDialog);
            }
        }
        return container;

    }

    buildCollectionForm(modelProvider, instanceType, prop, disableCreateInstance, disableUpdateInstance, disableDeleteInstance) {
        let container = this.createComponentModel("ContainerView");
        if (prop) {
            container.dataSource = '$parent';
            container.field = prop.name;
        }
        container.dataType = 'array';
        container.defaultValue = '=[]';
        let iterator = this.createComponentModel("IteratorView");
        let form = this.buildInstanceForm(modelProvider, instanceType, true, disableUpdateInstance);
        form.dataSource = "$parent";
        components.registerComponentModel(form);
        iterator.dataSource = '$parent';
        iterator.body = form;
        components.registerComponentModel(iterator);

        if (!disableUpdateInstance) {
            let upButton = this.createComponentModel("ButtonView");
            upButton.size = 'sm';
            upButton.icon = 'arrow-up';
            upButton.layoutClass = 'align-self-end';
            upButton.label = '';
            upButton.disabled = `=(iteratorIndex === 0)`;
            upButton.eventHandlers[0].actions[0] = {
                targetId: iterator.cid,
                name: 'moveDataFromTo',
                description: 'Move up',
                argument: 'iteratorIndex, iteratorIndex - 1'
            }
            components.registerComponentModel(upButton);
            form.components.push(upButton);

            let downButton = this.createComponentModel("ButtonView");
            downButton.size = 'sm';
            downButton.icon = 'arrow-down';
            downButton.layoutClass = 'align-self-end';
            downButton.label = '';
            downButton.disabled = `=(iteratorIndex === $d('${iterator.cid}').length - 1)`;
            downButton.eventHandlers[0].actions[0] = {
                targetId: iterator.cid,
                name: 'moveDataFromTo',
                description: 'Move down',
                argument: 'iteratorIndex, iteratorIndex + 1'
            }
            components.registerComponentModel(downButton);
            form.components.push(downButton);
        }

        if (!disableDeleteInstance) {
            let deleteButton = this.createComponentModel("ButtonView");
            deleteButton.size = 'sm';
            deleteButton.icon = 'trash';
            deleteButton.layoutClass = 'align-self-end';
            deleteButton.label = '';
            deleteButton.variant = 'danger';
            deleteButton.eventHandlers[0].actions[0] = {
                targetId: iterator.cid,
                name: 'removeDataAt',
                description: 'Remove',
                argument: 'iteratorIndex'
            }
            components.registerComponentModel(deleteButton);
            form.components.push(deleteButton);
        }

        if (!disableCreateInstance) {
            let addButton = this.createComponentModel("ButtonView");
            addButton.size = 'sm';
            addButton.icon = 'plus-circle';
            addButton.label = 'Add';
            addButton.icon = 'plus';
            addButton.variant = 'primary';
            addButton.eventHandlers[0].actions[0] = {
                targetId: '$self',
                name: 'addData',
                description: 'Add instance',
                argument: `{}`
            }
            components.registerComponentModel(addButton);
            container.components.push(addButton);
        }

        container.components.push(iterator);
        return container;
    }

    ensureReactiveBindings() {
        for (const cid in this.repository) {
            for (const prop in this.repository[cid]) {
                const val = this.repository[cid][prop];
                if (typeof val === 'string' && val.startsWith('=') && (val.indexOf('$d(') !== -1 || val.indexOf('$c(') !== -1)) {
                    this.repository[cid][prop] = '';
                    this.repository[cid][prop] = val;
                }
            }
        }
    }

    isComponentInActivePage(cid) {
        const pathToRoot = this.findPathToRoot(cid);
        return pathToRoot[0] === 'shared' || pathToRoot[0] === $c('navbar')?.activeNavItem()?.pageId;
    }

}

let components = window.components = new Components();

function $c(elementOrComponentId) {
    return components.getView(elementOrComponentId);
}

function $v(componentOrComponentId) {
    if (typeof componentOrComponentId === 'string') {
        return components.getComponentModel(componentOrComponentId);
    } else {
        if (componentOrComponentId.getViewModel) {
            return componentOrComponentId.getViewModel();
        }
    }
    return undefined;
}

function $d(componentOrComponentId, optionalValue) {
    if (!componentOrComponentId) {
        return undefined;
    }
    let view = typeof componentOrComponentId === 'string' ? components.getView(componentOrComponentId) : componentOrComponentId;
    if (!view) {
        return optionalValue;
    } else {
        let value = view.value;
        if (value === undefined && optionalValue !== undefined) {
            return optionalValue;
        } else {
            return value;
        }
    }
}

function $set(object, key, value) {
    Vue.set(object, key, value);
}

// TODO: add 'getParent' to editable components
// function $parent(componentOrComponentId) {
//     let view = typeof componentOrComponentId === 'string' ? components.getView(componentOrComponentId) : componentOrComponentId;
//     if (!view) {
//         return undefined;
//     }
//     return view.$parent.$parent;
// }

