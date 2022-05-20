/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2022 CINCHEO
 *                    https://www.cincheo.com
 *                    renaud.pawlak@cincheo.com
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

generateFunctionDescriptors = function(object, sort) {
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

let variants  = [
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
    {"text":" --- Array functions --- ","disabled":true},
    {"value":"arrayConcat","text":"arrayConcat(array, arrayOrItem)"},
    {"value":"arrayMove","text":"arrayMove(arr, fromIndex, toIndex)"},
    {"value":"getStoredArray","text":"getStoredArray(key)"},
    {"value":"setStoredArray","text":"setStoredArray(key, array)"},
    {"value":"addToStoredArray","text":"addToStoredArray(key, data)"},
    {"value":"removeFromStoredArray","text":"removeFromStoredArray(key, data)"},
    {"value":"replaceInStoredArray","text":"replaceInStoredArray(key, data)"},
    {"value":"range","text":"range(start, end)"},
    {"value":"characterRange","text":"characterRange(startChar, endChar)"},
    {"value":"series","text":"series(initialData, nextFunction: (data, series, index) => data, size = undefined)"},
    {"text":" --- Color functions --- ","disabled":true},
    {"value":"defaultColor","text":"defaultColor(index, opacity)"},
    {"text":" --- Conversion functions --- ","disabled":true},
    {"value":"camelToKebabCase","text":"camelToKebabCase(str)"},
    {"value":"camelToSnakeCase","text":"camelToSnakeCase(str)"},
    {"value":"camelToLabelText","text":"camelToLabelText(str, lowerCase = false)"},
    {"value":"kebabToCamelCase","text":"kebabToCamelCase(str, lowerCase = false)"},
    {"value":"kebabToLabelText","text":"kebabToLabelText(str, lowerCase = false)"},
    {"value":"snakeToCamelCase","text":"snakeToCamelCase(str, lowerCase = false)"},
    {"value":"snakeToLabelText","text":"snakeToLabelText(str, lowerCase = false)"},
    {"value":"csvToArray","text":"csvToArray(csv, separator, hasHeaders, headers)"},
    {"value":"arrayToCsv","text":"arrayToCsv(array, separator, keys, headers)"},
    {"value":"convertImage","text":"convertImage(sourceImage, dataCallback, quality = 0.5, maxWidth = 800, outputMimeType = 'image/jpg')"},
    {"text":" --- Date functions --- ","disabled":true},
    {"value":"now","text":"now()"},
    {"value":"date","text":"date(date)"},
    {"value":"datetime","text":"datetime(date)"},
    {"value":"time","text":"time(date)"},
    {"value":"dateRange","text":"dateRange(dateStart, dateEnd, step, stepKind)"},
    {"value":"diffBusinessDays","text":"diffBusinessDays(firstDate, secondDate)"},
    {"text":" --- Io and navigation functions --- ","disabled":true},
    {"value":"loadScript","text":"loadScript(url, callback)"},
    {"value":"deleteCookie","text":"deleteCookie(name)"},
    {"value":"getCookie","text":"getCookie(name)"},
    {"value":"setCookie","text":"setCookie(name, value, expirationDate)"},
    {"value":"download","text":"download(data, filename, type)"},
    {"value":"upload","text":"upload(callback, resultType = 'text', maxSize = undefined, sizeExceededCallback = undefined, conversionOptions = undefined)"},
    {"value":"postFileToServer","text":"postFileToServer(postUrl, file, onLoadCallback = undefined)"},
    {"value":"redirect","text":"redirect(ui, page)"},
    {"value":"go","text":"go(page)"},
    {"text":" --- String functions --- ","disabled":true},
    {"value":"linkify","text":"linkify(text)"},
    {"value":"validateEmail","text":"validateEmail(email)"},
    {"value":"isValidEmail","text":"isValidEmail(email)"},
    {"value":"isNotEmpty","text":"isNotEmpty(string)"},
    {"value":"truncate","text":"truncate(str, size)"},
    {"text":" --- Ui functions --- ","disabled":true},
    {"value":"toast","text":"toast(component, title, message, variant = null)"},
    {"text":" --- Utilities --- ","disabled":true},
    {"value":"uuid","text":"uuid()"},
    {"value":"setTimeoutWithRetry","text":"setTimeoutWithRetry(handler, retries, interval)"},
    {"value":"toSimpleName","text":"toSimpleName(qualifiedName)"},
    {"value":"functionBody","text":"functionBody(f)"},
    {"value":"functionParams","text":"functionParams(f)"},
    {"value":"inputType","text":"inputType(type)"},
    {"value":"diff","text":"diff(array, fields)"},
    {"value":"fireCustomEvent","text":"fireCustomEvent(eventName, element, data)"},
    {"value":"cloneData","text":"cloneData(data)"},
    {"value":"rect","text":"rect(component)"},
    {"value":"remSize","text":"remSize()"}];
// console.info(JSON.stringify(generateFunctionDescriptors($collab)))
CollaborationTools.FUNCTION_DESCRIPTORS = [
    {"value":"synchronize","text":"synchronize()"},
    {"value":"share","text":"share(key, targetUserId)"},
    {"value":"unshare","text":"unshare(key, targetUserId)"},
    {"value":"sendMail","text":"sendMail(targetUserId, subject, message)"},
    {"value":"clearSyncDescriptor","text":"clearSyncDescriptor(key = undefined)"},
    {"value":"deleteRemote","text":"deleteRemote(key)"},
    {"text":" --- Identity management functions --- ","disabled":true},
    {"value":"logInWithCredentials","text":"logInWithCredentials(login, password)"},
    {"value":"getLoggedUser","text":"getLoggedUser()"},
    {"value":"logOut","text":"logOut()"}];

let $key = function(key, sharedBy) {
    if (sharedBy) {
        return key + '-$-' + sharedBy;
    }
}

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
    if (Array.isArray(arrayOrItem)) {
        Array.prototype.push.apply(array, arrayOrItem);
    } else {
        array.push(arrayOrItem);
    }
    return array;
}

Tools.arrayMove = function (arr, fromIndex, toIndex) {
    let element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    return arr;
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

Tools.series =  function (initialData, nextFunction, maxSize) {
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
        return defaultColors[index%20] + Number((opacity * 255 / 100) | 0).toString(16).padStart(2, '0');
    } else {
        return defaultColors[index%20];
    }
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

        canvasElement.getContext("2d").drawImage(sourceImageObject, 0, 0, natW, natH);
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

Tools.diffBusinessDays = function(firstDate, secondDate) {
    // EDIT : use of startOf
    let day1 = moment(firstDate).startOf('day');
    let day2 = moment(secondDate).startOf('day');
    // EDIT : start at 1
    let adjust = 1;

    if((day1.dayOfYear() === day2.dayOfYear()) && (day1.year() === day2.year())){
        return 0;
    }

    if(day2.isBefore(day1)){
        const temp = day1;
        day1 = day2;
        day2 = temp;
    }

    //Check if first date starts on weekends
    if(day1.day() === 6) { //Saturday
        //Move date to next week monday
        day1.day(8);
    } else if(day1.day() === 0) { //Sunday
        //Move date to current week monday
        day1.day(1);
    }

    //Check if second date starts on weekends
    if(day2.day() === 6) { //Saturday
        //Move date to current week friday
        day2.day(5);
    } else if(day2.day() === 0) { //Sunday
        //Move date to previous week friday
        day2.day(-2);
    }

    const day1Week = day1.week();
    let day2Week = day2.week();

    //Check if two dates are in different week of the year
    if(day1Week !== day2Week){
        //Check if second date's year is different from first date's year
        if (day2Week < day1Week){
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

Tools.loadScript = function(url, callback) {
    console.info("loading remote script", url);
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    script.onreadystatechange = callback;
    script.onload = callback;

    head.appendChild(script);
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
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

Tools.b64toBlob = function (b64Data, contentType='', sliceSize=512) {
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

Tools.download = function(data, filename = 'data.txt', mimeType = 'text/plain') {
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
        Tools.convertImage(data, undefined, 1, undefined, mimeType,blob => {
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

Tools.upload = function(callback,
                        resultType = 'text',
                        maxSize = undefined,
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
                    alert("Uploaded file exceeds maximum size...");
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
                                alert("Uploaded file exceeds maximum size...");
                            }
                        } else {
                            callback(content);
                        }
                    },
                    conversionOptions.quality, conversionOptions.maxWidth, conversionOptions.mimeType);
                //content = Tools.convertImage(window.content, 0.5, 200, 'image/jpeg');
            } else {
                if (maxSize && content.length > maxSize) {
                    if (sizeExceededCallback) {
                        sizeExceededCallback();
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
    req.onload = function(event) {
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

Tools.go = function(page) {
    ide.router.push(page);
}

// =====================================================================
// string functions

Tools.stringFunctions = undefined;

Tools.linkify = function(text) {
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

Tools.toast = function(component, title, message, variant = null) {
    component.$bvToast.toast(message, {
        title: title,
        variant: variant,
        solid: true,
        size: 'lg'
    });
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

Tools.setTimeoutWithRetry = function(handler, retries, interval) {
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
    let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).split(',').map(p => p.trim());
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

Tools.fireCustomEvent = function(eventName, element, data) {
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
    for(let key in data) {
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

Tools.cloneData = function(data) {
    return JSON.parse(JSON.stringify(data));
}

Tools.rect = function(component) {
    return component.$el.getBoundingClientRect();
}

Tools.remSize = function() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

// ========================================================================

CollaborationTools.synchronize = async function () {
    return ide.synchronize();
}

CollaborationTools.share = async function (key, targetUserId) {
    return ide.sync.share(ide.sync.buildKeyString(key), targetUserId);
}

CollaborationTools.unshare = async function (key, targetUserId) {
    return ide.sync.unshare(ide.sync.buildKeyString(key), targetUserId);
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

CollaborationTools.getSharedArray = function (userId, key) {
    let array = JSON.parse(localStorage.getItem($key(key, userId)));
    return array == null ? [] : array;
}

CollaborationTools.setSharedArray = function (userId, key, array) {
    localStorage.setItem($key(key, userId), JSON.stringify(array));
}

CollaborationTools.addToSharedArray = function (userId, key, data) {
    let array = Tools.getStoredArray($key(key, userId));
    array.push(data);
    localStorage.setItem($key(key, userId), JSON.stringify(array));
}

CollaborationTools.removeFromSharedArray = function (userId, key, data) {
    let array = Tools.getStoredArray($key(key, userId));
    if (data.id) {
        array.splice(array.findIndex(d => d.id === data.id), 1);
    } else {
        array.splice(array.indexOf(data), 1);
    }
    localStorage.setItem($key(key, userId), JSON.stringify(array));
}

CollaborationTools.replaceInSharedArray = function (userId, key, data) {
    let array = Tools.getStoredArray($key(key, userId));
    if (data.id) {
        array.splice(array.findIndex(d => d.id === data.id), 1, data);
    } else {
        array.splice(array.indexOf(data), 1, data);
    }
    localStorage.setItem($key(key, userId), JSON.stringify(array));
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
    ids = [];

    nextId(componentType) {
        if (!applicationModel.autoIncrementIds[componentType]) {
            applicationModel.autoIncrementIds[componentType] = 0;
        }
        let nextId = applicationModel.autoIncrementIds[componentType];
        applicationModel.autoIncrementIds[componentType] = nextId + 1;
        return nextId;
    }

    getComponentModels() {
        return this.repository;
    }

    getComponentIds() {
        return this.ids;
    }

    clear() {
        this.repository = {};
        this.ids = [];
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
                            name: "email", type: "string", kind: "value"
                        },
                        {
                            name: "phone", type: "string", kind: "value"
                        },
                    ]
                },
            ];
            localStorage.setItem('dlite.models.default', JSON.stringify(defaultModel));
            models = Tools.arrayConcat([{name:'default'}], models);
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
                    if (this.ids.indexOf(viewModel[key]) === -1) {
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

    mapTemplate(template, mapping) {
        if (Array.isArray(template)) {
            for (const subModel of template) {
                this.mapTemplate(subModel, mapping);
            }
        } else if (typeof template === 'object') {
            for (const key in template) {
                if (key === 'cid') {
                    let current = template.cid;
                    template.cid = this.baseId(template.type) + '-' + this.nextId(template.type);
                    if (current !== template.cid) {
                        mapping[current] = template.cid;
                    }
                } else {
                    this.mapTemplate(template[key], mapping);
                }
            }
        }
    }

    redirectTemplate(template, mapping) {
        if (Array.isArray(template)) {
            for (const subModel of template) {
                this.redirectTemplate(subModel, mapping);
            }
        } else if (typeof template === 'object') {
            for (const key in template) {
                if (key !== 'cid') {
                    if (typeof template[key] === 'string') {
                        for (let id in mapping) {
                            if (template[key].indexOf(id) !== -1) {
                                template[key] = template[key].replaceAll(id, mapping[id]);
                                // stop to avoid replacing back already replaced ids
                                // TODO: clever way
                                break;
                            }
                        }
                    } else {
                        this.redirectTemplate(template[key], mapping);
                    }
                }
            }
        }
    }

    registerTemplate(template) {
        let mapping = {};
        this.mapTemplate(template, mapping);
        this.redirectTemplate(template, mapping);
        this.fillComponentModelRepository(template);
        return template;
    }

    getDirectChildren(viewModel, fillParents) {
        let children = [];
        for (const key in viewModel) {
            if (viewModel[key] != null && typeof viewModel[key] === 'object' && viewModel[key].cid !== undefined) {
                if (fillParents) {
                    viewModel[key]._parentId = viewModel.cid;
                }
                children.push(viewModel[key]);
            } else if (Array.isArray(viewModel[key])) {
                for (const subModel of viewModel[key]) {
                    if (typeof subModel === 'object' && subModel.cid !== undefined) {
                        if (fillParents) {
                            subModel._parentId = viewModel.cid;
                        }
                        children.push(subModel);
                    }
                }
            }
        }
        return children;
    }

    hasTrashedComponents() {
        for (let root of this.getRoots()) {
            if (!(root.cid === 'navbar' || applicationModel.navbar.navigationItems.find(navItem => navItem.pageId === root.cid))) {
                return true;
            }
        }
        return false;
    }

    emptyTrash() {
        while (this.hasTrashedComponents()) {
            for (let root of this.getRoots()) {
                if (!(root.cid === 'navbar' || applicationModel.navbar.navigationItems.find(navItem => navItem.pageId === root.cid))) {
                    this.deleteComponentModel(root.cid);
                }
            }
        }
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
                    //keyField[targetLocation.index] = childViewModel;
                }
            } else {
                parentComponentModel[targetLocation.key] = childViewModel;
            }
        }
    }

    unsetChild(targetLocation) {
        if (targetLocation.cid) {
            let parentComponentModel = components.getComponentModel(targetLocation.cid);
            if (Array.isArray(parentComponentModel[targetLocation.key])) {
                if (targetLocation.index === undefined) {
                    throw new Error("undefined index for array key");
                }
                parentComponentModel[targetLocation.key].splice(targetLocation.index, 1);
            } else {
                parentComponentModel[targetLocation.key] = undefined;
            }
        }
    }

    findParent(cid) {
        for (let model of Object.values(this.repository)) {
            if (this.getDirectChildren(model, false).map(c => c.cid).indexOf(cid) > -1) {
                return model.cid;
            }
        }
    }

    cleanParentIds() {
        for (let model of Object.values(this.repository)) {
            delete model._parentId;
        }
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
        this.cleanParentIds();
        return roots;
    }

    deleteComponentModel(cid) {
        delete this.repository[cid];
        this.ids.splice(this.ids.indexOf(cid), 1);
        Vue.prototype.$eventHub.$emit('component-deleted', this.repository[cid]);
    }

    getComponentModel(componentId) {
        return componentId ? this.repository[componentId] : undefined;
    }

    hasComponent(componentId) {
        return this.repository[componentId] != null;
    }

    getComponentOptions(componentId) {
        return Vue.component(Tools.camelToKebabCase(this.getComponentModel(componentId).type)).options;
    }

    getViewComponent(componentId) {
        return Vue.component(Tools.camelToKebabCase(this.getComponentModel(componentId).type));
    }

    getView(elementOrComponentId) {
        if (elementOrComponentId instanceof Element) {
            return elementOrComponentId['__vue__'];
        } else {
            if (elementOrComponentId && elementOrComponentId.viewModel) {
                return elementOrComponentId;
            }
            let element = document.getElementById(elementOrComponentId);
            return element ? element['__vue__'] : undefined;
        }
    }

    getHtmlElement(componentId) {
        return document.getElementById(componentId);
    }

    getContainerView(componentId) {
        let view = this.getView(componentId);
        return view ? view.$parent : undefined;
    }

    createComponentModel(type) {
        let viewModel = undefined;
        switch (type) {
            case 'SplitView':
                viewModel = {
                    orientation: 'VERTICAL',
                    primaryComponent: {},
                    secondaryComponent: {}
                };
                break;
            case 'CollectionView':
                viewModel = {
                    repositoryType: "",
                    collectionName: ""
                };
                break;
            case 'InstanceView':
                viewModel = {
                    kind: 'entity',
                    className: undefined,
                    editable: false
                };
                break;
            case 'ContainerView':
                viewModel = {
                    layout: "block",
                    components: [],
                    defaultValue: "={}"
                };
                break;
            case 'TabsView':
                const tab = this.createComponentModel('ContainerView');
                tab.title = '(no title)';
                this.registerComponentModel(tab);
                viewModel = {
                    tabs: [tab]
                };
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
                    selectMode: "single",
                    selectable: true,
                    striped: false,
                    hover: true,
                    small: false,
                    fields: [],
                    perPage: "0",
                    stacked: undefined,
                    filterIncludedFields: undefined,
                    filterExcludedFields: undefined
                };
                break;
            case 'CollectionProvider':
                viewModel = {
                    repositoryType: "",
                    collectionName: "",
                    content: {}
                };
                break;
            case 'InstanceProvider':
                viewModel = {
                    repositoryType: "",
                    selectorMethodName: "",
                    selectorArgument: "",
                    content: {}
                };
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
                    method: 'GET'
                };
                break;
            case 'InputView':
                viewModel = {
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
            case 'TextareaView':
                viewModel = {
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
                    variant: "secondary",
                    size: "default",
                    pill: false,
                    squared: false,
                    block: false,
                    disabled: false,
                    eventHandlers: [
                        {
                            global: false,
                            name: '@click',
                            actions: [
                                {
                                    targetId: '$self',
                                    name: 'eval',
                                    description: 'Default action',
                                    argument: undefined
                                }
                            ]
                        }
                    ]
                };
                break;
            case 'DatepickerView':
                viewModel = {
                    label: '',
                    disabled: false
                };
                break;
            case 'TimepickerView':
                viewModel = {
                    label: '',
                    disabled: false
                };
                break;
            case 'CheckboxView':
                viewModel = {
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
                    options: "=[]"
                };
                break;
            case 'CardView':
                viewModel = {
                    title: "",
                    subTitle: "",
                    imgSrc: "",
                    imgPosition: "top",
                    imgWidth: "",
                    imgHeight: "",
                    text: "",
                    headerEnabled: undefined,
                    footerEnabled: undefined,
                    headerClass: undefined,
                    footerClass: undefined,
                    bodyClass: undefined,
                    headerBgVariant: undefined,
                    footerBgVariant: undefined,
                    bodyBgVariant: undefined,
                    headerTextVariant: undefined,
                    footerTextVariant: undefined,
                    bodyTextVariant: undefined,
                    headerBorderVariant: undefined,
                    footerBorderVariant: undefined,
                    bodyBorderVariant: undefined,
                    header: {},
                    body: {},
                    footer: {}
                };
                break;
            case 'CollapseView':
                viewModel = {
                    body: {}
                };
                break;
            case 'IteratorView':
                viewModel = {
                    defaultValue: '=[]',
                    body: {}
                };
                break;
            case 'ImageView':
                viewModel = {
                    src: "https://picsum.photos/600/400/?image=82",
                    blank: false,
                    blankColor: undefined,
                    display: "default",
                    width: "",
                    height: "",
                    rounded: false,
                    thumbnail: false,
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
                break;
            case 'TimeSeriesChartView':
                viewModel = {
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
                break;
            case 'CookieConnector':
                viewModel = {
                    name: undefined,
                    expirationDate: undefined
                };
                break;
            case 'LocalStorageConnector':
                viewModel = {
                    key: 'undefined',
                    defaultValue: '=[]'
                };
                break;
            case 'DataMapper':
                viewModel = {
                    mapper: undefined
                };
                break;
            case 'TextView':
                viewModel = {
                    tag: 'p',
                    text: 'Lorem ipsum dolor sit amet.'
                };
                break;
            case 'PaginationView':
                viewModel = {
                    dataSource: ""
                };
                break;
            case 'PdfView':
                viewModel = {
                    documentPath: "assets/sample.pdf",
                    class: "w-100",
                    page: 1,
                    scrollbar: true,
                    toolbar: true,
                    messages: false,
                    navbar: true,
                    statusbar: false
                };
            case 'CarouselView':
                viewModel = {
                    slides: []
                };
                break;
            case 'ProgressView':
                viewModel = {
                    defaultValue: '=0'
                };
                break;
        }
        if (viewModel) {
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
        let index = this.ids.indexOf(componentId);
        if (index !== -1) {
            this.ids.splice(index, 1);
            delete this.repository[componentId];
        }
    }

    registerComponentModel(viewModel, componentId) {
        if (viewModel) {
            if (componentId) {
                viewModel.cid = componentId;
            } else {
                if (viewModel.cid == null) {
                    viewModel.cid = this.baseId(viewModel.type) + '-' + this.nextId(viewModel.type);
                }
            }
            // special case for tabs because $parent cannot work and a direct ref is required
            if (viewModel.type === 'TabsView') {
                for (const tab of viewModel.tabs) {
                    tab.dataSource = viewModel.cid;
                }
            }
            this.repository[viewModel.cid] = viewModel;
            this.ids.push(viewModel.cid);
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
        let f = this.getComponentOptions(viewModel.cid).methods.propNames;
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
        if (propNames.indexOf('dataSource') !== -1 && propNames.indexOf('mapper') === -1) {
            propNames.splice(propNames.indexOf('dataSource') + 1, 0, 'mapper');
        }
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
            propNames.push('init');
        }

        return propNames;
    }

    propDescriptors(viewModel) {
        let propDescriptors = [];
        let f = this.getComponentOptions(viewModel.cid).methods.customPropDescriptors;
        let customPropDescriptors = f ? f() : {};

        if (!customPropDescriptors.publicName) {
            customPropDescriptors.publicName = {
                type: 'text',
                label: 'Public name / anchor name',
                editable: true,
                description: 'A public name for referring to the component (also used to generate an anchor for visible components)'
            }
        }
        if (!customPropDescriptors.init) {
            customPropDescriptors.init = {
                type: 'code/javascript',
                label: 'Initialization code',
                editable: true,
                literalOnly: true,
                manualApply: true,
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
                options: Tools.arrayConcat(['', '$parent'], components.getComponentIds().filter(cid => document.getElementById(cid)).sort())
            };
        }
        if (!customPropDescriptors.mapper) {
            customPropDescriptors.mapper = {
                type: 'textarea',
                editable: true,
                description: 'A functional expression that maps (transforms, filters, sorts, reduces, ...) the data from the data source to the data model.'
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

        if (this.getComponentOptions(viewModel.cid).methods.propNames().indexOf('field') !== -1 && !customPropDescriptors.field) {
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

    buildInstanceForm(instanceType, inline, disabled) {
        let instanceContainer = this.createComponentModel("ContainerView");

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
                        break;
                    case 'date':
                    case 'java.lang.Date':
                        component = components.createComponentModel("DatepickerView");
                        break;
                    case 'text':
                    case 'string':
                    case 'int':
                    case 'float':
                        component = components.createComponentModel("InputView");
                        component.inputType = Tools.inputType(prop.type);
                        break;
                    default:
                        const i = prop.type.lastIndexOf('.');
                        if (i !== -1) {
                            const className = prop.type.slice(i + 1);
                            const modelName = prop.type.slice(0, i);
                            const type = JSON.parse(localStorage.getItem('dlite.models.' + modelName)).find(c => c.name === className);
                            console.info("building instance form", className, modelName);
                            component = components.createComponentModel("CardView");
                            component.headerEnabled = true;
                            component.header = components.createComponentModel("TextView");
                            component.header.tag = 'b';
                            component.header.text = Tools.camelToLabelText(prop.field ? prop.field : prop.name);
                            components.registerComponentModel(component.header);
                            switch (prop.kind) {
                                case 'value':
                                case 'reference':
                                    component.body = this.buildInstanceForm(type);
                                    if (!prop.defaultValue) {
                                        component.body.defaultValue = '={}';
                                    }
                                    break;
                                case 'set':
                                case 'list':
                                    component.body = this.buildCollectionForm(type, prop);
                                    if (!prop.defaultValue) {
                                        component.body.defaultValue = '=[]';
                                    }
                                    break;
                            }
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
                    component.label = Tools.camelToLabelText(prop.field ? prop.field : prop.name);
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

    buildCollectionForm(instanceType, prop, disableCreateInstance, disableUpdateInstance, disableDeleteInstance) {
        let container = this.createComponentModel("ContainerView");
        if (prop) {
            container.dataSource = '$parent';
            container.field = prop.name;
        }
        container.defaultValue = '=[]';
        let iterator = this.createComponentModel("IteratorView");
        let form = this.buildInstanceForm(instanceType, true, disableUpdateInstance);
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
            addButton.label = 'Add ' + Tools.camelToLabelText(Tools.toSimpleName(instanceType.name), true);
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
                if (typeof val === 'string' && val.startsWith('=') && val.indexOf('$d(') !== -1) {
                    this.repository[cid][prop] = '';
                    this.repository[cid][prop] = val;
                }
            }
        }
    }

}

let components = new Components();

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

