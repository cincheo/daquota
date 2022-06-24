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

class ModelParser {

    modelName;
    parsedClasses = [];

    constructor(modelName) {
        this.modelName = modelName || 'newModel';
    }

    lookupType(modelName, className) {
        if (modelName !== this.modelName) {
            return undefined;
        }
        return this.parsedClasses.find(parsedClass => parsedClass.name === className);
    }

    parseJson(json) {
        let modelInstance = JSON.parse(json);
        this.inferModelInstance(modelInstance);
        console.info('parsed model', this);
        return this;
    }

    inferModelInstance(modelInstance) {
        this.inferValue(undefined, modelInstance);
        return this;
    }

    inferValue(currentField, value) {
        if (value == null) {
            return this;
        }
        if (Array.isArray(value)) {
            this.inferArray(currentField, value);
        } else if (typeof value !== 'object') {
            this.inferPrimitive(currentField, value);
        } else {
            this.inferObject(currentField, value);
        }
        return this;
    }

    inferArray(currentField, array) {
        if (currentField) {
            currentField.kind = 'list';
        }
        for (const value of array) {
            this.inferValue(currentField, value);
        }
        return this;
    }

    typeOfPrimitive(primitive) {
        let type = typeof primitive;
        if (type === 'number') {
            type = 'float';
        }
        return type;
    }

    inferPrimitive(currentField, primitive) {
        if (!currentField) {
            throw new Error('Cannot infer model from primitive: '+primitive)
        }

        const typeName = this.typeOfPrimitive(primitive);
        currentField.addParsedType(typeName);
        currentField.setKind('value');
        try {
            currentField.inferCommonType();
        } catch (e) {
            console.error('error', this);
            throw e;
        }
        return this;
    }

    freshClassName(name) {
        const duplicates = this.parsedClasses.filter(parsedClass => parsedClass.name === name);
        return duplicates.length > 0 ? name + duplicates.length : name;
    }

    inferObject(currentField, object) {
        let parsedClass = this.findClassForObject(object);
        if (!parsedClass) {
            parsedClass = new ParsedClass(this.freshClassName(currentField ? $tools.snakeToCamelCase(currentField.name, false) : 'Main'));
            this.parsedClasses.push(parsedClass);
            for (const property in object) {
                parsedClass.fields.push(new ParsedField(property))
            }
        }
        const typeName = this.modelName + '.' + parsedClass.name;
        if (currentField) {
            currentField.setKind('reference');
            currentField.addParsedType(typeName);
            try {
                currentField.inferCommonType();
            } catch (e) {
                console.error('error', this);
                throw e;
            }
            if (!currentField.type) {
                currentField.type = typeName;
            }
        }
        for (const field of parsedClass.fields) {
            this.inferValue(field, object[field.name]);
        }
        return this;
    }

    findClassForObject(object) {
        for (const parsedClass of this.parsedClasses) {
            if (parsedClass.fields.length === Object.keys(object).length) {
                let match = true;
                for (const property in object) {
                    const field = parsedClass.findField(property);
                    if (!field) {
                        match = false;
                        break;
                    }
                    if (!field.isCompatibleValue(object[property])) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    return parsedClass;
                }
            }
        }
    }

}

class ParsedClass {

    name;
    fields = [];

    constructor(name) {
        this.name = name;
    }

    findField(name) {
        return this.fields.find(field => field.name === name);
    }
}

class ParsedField {

    name;
    parsedTypes = [];
    type;
    kind;

    constructor(name, type, kind) {
        this.name = name;
        this.type = type;
        this.kind = kind;
    }

    addParsedType(type) {
        if (type === undefined || type === 'undefined') {
            throw new Error('type cannot be undefined');
        }
        if (this.parsedTypes.indexOf(type) === -1) {
            this.parsedTypes.push(type);
        }
    }

    isObjectType() {
        return this.type && this.type.indexOf('.') > -1;
    }

    isCompatibleValue(value) {
        if (value == null) {
            return true;
        }
        if (Array.isArray(value)) {
            if (value.length > 0) {
                return this.kind === 'list' && this.isCompatibleValue(value[0]);
            } else {
                return this.kind === 'list';
            }
        } else if (typeof value === 'object' ) {
            return this.isObjectType();
        } else {
            // primitives
            return !this.isObjectType();
        }
    }

    inferCommonType() {
        if (this.parsedTypes.length === 1) {
            this.type = this.parsedTypes[0];
        } else {
            for (const type of this.parsedTypes) {
                if (type.indexOf('.') > -1) {
                    throw new Error("Incompatible types for parsed field '" + this.name + "': " + this.parsedTypes);
                }
            }
            this.type = 'string';
        }
    }

    setKind(kind) {
        if (this.kind !== 'list' && this.kind !== 'set' ) {
            this.kind = kind;
        }
    }

    toString() {
        return this.name + ':' + this.type + ' (' + this.kind + ')';
    }
}
