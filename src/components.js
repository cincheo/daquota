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
            return 'text';
        case 'java.util.Date':
        case 'java.sql.Date':
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
        reader.readAsText(file); // this is reading as data url
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

let domainModel = {};

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
                    template.cid = Tools.camelToKebabCase(template.type) + '-' + this.nextId(template.type);
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
            if (typeof viewModel[key] === 'object' && viewModel[key].cid !== undefined) {
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
            case 'ButtonView':
                viewModel = {
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
                    src: "",
                    blank: false,
                    blankColor: undefined,
                    display: "default",
                    width: "",
                    height: "",
                    rounded: false,
                    thumbnail: false
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
                    tag: 'p',
                    text: ''
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
        this.repository = [];
        this.ids = [];
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
                options: Tools.arrayConcat(['', '$parent', '$object', '$array'], components.getComponentIds())
            };
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
        return propDescriptors;
    }

    buildInstanceForm(instanceType) {
        let instanceContainer = this.createComponentModel("ContainerView");

        for (let propName of instanceType.fields) {
            let prop = instanceType.fieldDescriptors[propName];
            let component = undefined;
            if (prop.options) {
                component = components.createComponentModel("SelectView");
                component.options = '=' + JSON.stringify(prop.options);
            } else {
                switch (prop.type) {
                    case 'java.lang.Boolean':
                    case 'boolean':
                        component = components.createComponentModel("CheckboxView");
                        break;
                    default:
                        component = components.createComponentModel("InputView");
                        component.inputType = Tools.inputType(prop.type);
                }
            }
            component.field = prop.field;
            component.dataSource = '$parent';
            component.label = Tools.camelToLabelText(prop.field);
            components.registerComponentModel(component);
            instanceContainer.components.push(component);
        }
        return instanceContainer;
    }

    fillTableFields(tableView, instanceType) {
        for (let propName of instanceType.fields) {
            //let prop = instanceType.fieldDescriptors[propName];
            tableView.fields.push({
                key: propName,
                label: Tools.camelToLabelText(propName)
            });
        }
        return tableView;
    }

}

let components = new Components();

function $c(componentId) {
    return components.getView(componentId);
}

function $v(componentOrComponentId) {
    if (componentOrComponentId === 'string') {
        let c = components.getView(componentOrComponentId);
        if (c) {
            return c.getViewModel();
        }
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
        return undefined;
    }
    if (optionalValue !== undefined) {
        view.dataModel = optionalValue;
    }
    return view.dataModel;
}

// TODO: add 'getParent' to editable components
// function $parent(componentOrComponentId) {
//     let view = typeof componentOrComponentId === 'string' ? components.getView(componentOrComponentId) : componentOrComponentId;
//     if (!view) {
//         return undefined;
//     }
//     return view.$parent.$parent;
// }

// class TouchManager {
//     constructor(element) {
//         this.xDown = null;
//         this.yDown = null;
//         this.start = null;
//         this.element = typeof(element) === 'string' ? document.querySelector(element) : element;
//
//         this.element.addEventListener('touchstart', (evt) => {
//             this.xDown = evt.touches[0].clientX;
//             this.yDown = evt.touches[0].clientY;
//             this.start = Date.now();
//         });
//
//     }
//
//     onLeft(callback) {
//         this.onLeft = callback;
//         return this;
//     }
//
//     onRight(callback) {
//         this.onRight = callback;
//         return this;
//     }
//
//     onUp(callback) {
//         this.onUp = callback;
//         return this;
//     }
//
//     onDown(callback) {
//         this.onDown = callback;
//         return this;
//     }
//
//     onTouch(callback) {
//         this.onTouch = callback;
//         return this;
//     }
//
//     handleTouchMove(evt) {
//         if ( ! this.xDown || ! this.yDown ) {
//             return;
//         }
//         // Tools.fireCustomEvent('dragover', evt.target);
//         //fireCustomEvent('drop', someDomObject, {dataTransfer: {files: [mockedfile]}});
//         //fireCustomEvent('dragend', someDomObject);
//
//         if (Date.now() - this.start > 200) {
//             return;
//         }
//
//         let xUp = evt.touches[0].clientX;
//         let yUp = evt.touches[0].clientY;
//
//         this.xDiff = this.xDown - xUp;
//         this.yDiff = this.yDown - yUp;
//
//         if (Math.max(Math.abs(this.xDiff), Math.abs(this.yDiff)) < 20) {
//             return;
//         }
//
//         try {
//             if (Math.abs(this.xDiff) > Math.abs(this.yDiff)) { // Most significant.
//                 if (this.xDiff > 0) {
//                     if (this.onLeft) this.onLeft();
//                 } else {
//                     if (this.onRight) this.onRight();
//                 }
//             } else {
//                 if (this.yDiff > 0) {
//                     if (this.onUp) this.onUp();
//                 } else {
//                     if (this.onDown) this.onDown();
//                 }
//             }
//         } catch (e) {
//             console.error("error in handler", e);
//         }
//
//         // avoid subsequent firing
//         this.xDown = undefined;
//         this.yDown = undefined;
//
//
//     }
//
//     handleTouchEnd(evt) {
//         if ( ! this.xDown || ! this.yDown ) {
//             return;
//         }
//         if (Date.now() - this.start > 100) {
//             return;
//         }
//
//         let xUp = evt.changedTouches[0].clientX;
//         let yUp = evt.changedTouches[0].clientY;
//
//         this.xDiff = this.xDown - xUp;
//         this.yDiff = this.yDown - yUp;
//
//         if (Math.max(Math.abs(this.xDiff), Math.abs(this.yDiff)) < 3) {
//             this.onTouch(xUp, yUp);
//         }
//
//     }
//
//     run() {
//         this.element.addEventListener('touchmove', evt => {
//             this.handleTouchMove(evt);
//         });
//         this.element.addEventListener('touchend', evt => {
//             this.handleTouchEnd(evt);
//         });
//
//     }
// }