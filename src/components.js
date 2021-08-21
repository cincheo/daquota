let Tools = {};

Tools.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

Tools.camelToKebabCase = function (str) {
    if (str.charAt(0).toUpperCase() === str.charAt(0)) {
        str = str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
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
        array.splice(array.indexOf(data), 1);
    } else {
        array.splice(array.findIndex(d => d.id === data.id), 1);
    }
    localStorage.setItem(key, JSON.stringify(array));
}

Tools.replaceInStoredArray = function (key, data) {
    let array = Tools.getStoredArray(key);
    if (data.id) {
        array.splice(array.indexOf(data), 1, data);
    } else {
        array.splice(array.findIndex(d => d.id === data.id), 1, data);
    }
    localStorage.setItem(key, JSON.stringify(array));
}

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

Tools.camelToLabelText = function (str, lowerCase) {
    str = str.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);
    if (lowerCase) {
        return str;
    } else {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

Tools.truncate = function (str, size) {
    if (str.length > size - 6) {
        return str.substring(0, size - 6) + "(...)";
    } else {
        return str;
    }
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


Tools.range = function (start, end) {
    return [...Array(end - start).keys()].map(i => i + start);
}

Tools.characterRange = function (startChar, endChar) {
    return String.fromCharCode(...Tools.range(startChar.charCodeAt(0), endChar.charCodeAt(0)))
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

Tools.toSimpleName = function (qualifiedName) {
    return qualifiedName.substring(qualifiedName.lastIndexOf('.') + 1);
}

Tools.arrayMove = function (arr, fromIndex, toIndex) {
    let element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    return arr;
}

Tools.arrayConcat = function (array, arrayOrItem) {
    if (array === undefined) {
        return undefined;
    }
    if (Array.isArray(arrayOrItem)) {
        Array.prototype.push.apply(array, arrayOrItem);
    } else {
        array.push(arrayOrItem);
    }
    return array;
}

Tools.functionBody = function (f) {
    let entire = f.toString();
    return entire.toString().slice(entire.toString().indexOf("{") + 1, entire.lastIndexOf("}"));
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

Tools.download = function(data, filename, type) {
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

Tools.upload = function(callback) {
    let input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = readerEvent => {
            let content = readerEvent.target.result; // this is the content!
            callback(content);
        }
        reader.readAsText(file);
    }
    input.click();
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
                                console.info("SUBST", key, id, template[key]);
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
        console.info("MAPPINGS", mapping);
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
            console.info("set child component");
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
            console.info("unset child component");
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
        console.info("find parent for " + cid);
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

    getView(componentId) {
        let element = document.getElementById(componentId);
        return element ? element['__vue__'] : undefined;
    }

    getHtmlElement(componentId) {
        return document.getElementById(componentId);
    }

    getContainerView(componentId) {
        let view = this.getView(componentId);
        return view ? view.$parent : undefined;
    }

    createComponentModel(type) {
        console.info("CREATING COMPONENT FOR " + type);
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
                    dataSource: "$object",
                    layout: "block",
                    components: []
                };
                break;
            case 'DialogView':
                viewModel = {
                    title: "",
                    content: {}
                };
                break;
            case 'TableView':
                viewModel = {
                    dataSource: "$parent",
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
                    dataSource: "$parent",
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
                    dataSource: "$parent",
                    label: '',
                    disabled: false
                };
                break;
            case 'TimepickerView':
                viewModel = {
                    dataSource: "$parent",
                    label: '',
                    disabled: false
                };
                break;
            case 'CheckboxView':
                viewModel = {
                    dataSource: "$parent",
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
                    dataSource: "$parent",
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
                    body: {}
                };
                break;
            case 'IteratorView':
                viewModel = {
                    dataSource: "$array",
                    body: {}
                };
                break;
            case 'ImageView':
                viewModel = {
                    dataSource: "$parent",
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
            case 'IconView':
                viewModel = {
                    dataSource: "$parent",
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
                    options: {}
                };
                break;
            case 'TimeSeriesChartView':
                viewModel = {
                    dataSource: "$parent",
                    chartType: 'line',
                    width: '400',
                    height: '400',
                    timeSeriesList: [
                        {
                            key: 'y',
                            label: 'Value'
                        }
                    ]
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
                    key: 'undefined'
                };
                break;
            case 'DataMapper':
                viewModel = {
                    mapper: undefined
                };
                break;
            case 'TextView':
                viewModel = {
                    dataSource: "$parent",
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
                break;
        }
        if (viewModel) {
            viewModel.type = type;
            if (!viewModel.eventHandlers) {
                viewModel.eventHandlers = [];
            }
        }
        console.info("created new component model", viewModel);
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
        console.info("unregistering view model", componentId);
        let index = this.ids.indexOf(componentId);
        if (index !== -1) {
            this.ids.splice(index, 1);
            delete this.repository[componentId];
        }
    }

    registerComponentModel(viewModel, componentId) {
        if (viewModel) {
            console.info("registering view model", viewModel, componentId);
            if (componentId) {
                viewModel.cid = componentId;
            } else {
                if (viewModel.cid == null) {
                    viewModel.cid = this.baseId(viewModel.type) + '-' + this.nextId(viewModel.type);
                }
            }
            this.repository[viewModel.cid] = viewModel;
            this.ids.push(viewModel.cid);
            Vue.prototype.$eventHub.$emit('component-created', viewModel.cid);
        }
    }

    loadRoots(roots) {
        console.info("load root");
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

    propNames(viewModel) {
        let f = this.getComponentOptions(viewModel.cid).methods.propNames;
        let propNames = f ? f() : undefined;
        if (!propNames) {
            propNames = [];
            for (const propName in viewModel) {
                propNames.push(propName);
            }
        }
        if (propNames.indexOf('layoutClass') === -1) {
            propNames.push('layoutClass');
        }
        if (propNames.indexOf('hidden') === -1) {
            propNames.push('hidden');
        }
        if (propNames.indexOf('dataSource') !== -1 && propNames.indexOf('mapper') === -1) {
            propNames.splice(propNames.indexOf('dataSource') + 1, 0, 'mapper');
        }
        if (propNames.indexOf('defaultValue') === -1) {
            propNames.push('defaultValue');
        }
        return propNames;
    }

    propDescriptors(viewModel) {
        let propDescriptors = [];
        let f = this.getComponentOptions(viewModel.cid).methods.customPropDescriptors;
        let customPropDescriptors = f ? f() : {};

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
                options: Tools.arrayConcat(['', '$parent', '$object', '$array'], components.getComponentIds().filter(cid => document.getElementById(cid)).sort())
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
                type: 'text',
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
        if (this.getComponentOptions(viewModel.cid).methods.propNames().indexOf('field') !== -1 && !customPropDescriptors.field) {
            customPropDescriptors.field = {
                type: 'text',
                label: 'Field',
                editable: true,
                description: 'The identifier of the field in the data source (only if the data source is an object)'
            }
        }

        for (const propName of this.propNames(viewModel)) {
            console.info(propName, viewModel);
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
                    case 'style':
                    case 'variant':
                    case 'size':
                        propDescriptor.category = 'style';
                        break;
                    default:
                        propDescriptor.category = 'main';
                }
            }
        }

        return propDescriptors;
    }

    buildInstanceForm(instanceType, inline) {
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
                            switch (prop.kind) {
                                case 'value':
                                case 'reference':
                                    component = this.buildInstanceForm(type);
                                    break;
                                case 'set':
                                case 'list':
                                    component = this.buildCollectionForm(type, prop);
                                    break;
                            }
                        }
                }
            }
            if (!component) {
                console.error('cannot build component for prop', prop);
            } else {
                if (prop.defaultValue) {
                    component.defaultValue = prop.defaultValue;
                }
                if (inline) {
                    component.size = 'sm';
                    component.class = 'mr-2 mb-0';
                    component.layoutClass = 'align-self-end';
                }
                component.field = prop.field ? prop.field : prop.name;
                component.dataSource = '$parent';
                component.label = Tools.camelToLabelText(prop.field ? prop.field : prop.name);
                components.registerComponentModel(component);
                instanceContainer.components.push(component);
            }
        }
        return instanceContainer;
    }

    buildCollectionForm(instanceType, prop) {
        let container = this.createComponentModel("ContainerView");
        if (prop) {
            container.dataSource = '$parent';
            container.field = prop.name;
        }
        container.defaultValue = '=[]';
        let iterator = this.createComponentModel("IteratorView");
        let form = this.buildInstanceForm(instanceType, true);
        form.dataSource = "$parent";
        components.registerComponentModel(form);
        iterator.dataSource = '$parent';
        iterator.body = form;
        components.registerComponentModel(iterator);

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
        container.components.push(iterator);
        return container;
    }


    ensureReactiveBindings() {
        for (const cid in this.repository) {
            for (const prop in this.repository[cid]) {
                const val = this.repository[cid][prop];
                if (typeof val === 'string' && val.startsWith('=') && val.indexOf('$d(') !== -1) {
                    console.info('reinitialize dependent prop', prop, val);
                    this.repository[cid][prop] = '';
                    this.repository[cid][prop] = val;
                }
            }
        }
    }

}

let components = new Components();

function $c(componentId) {
    return components.getView(componentId);
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

