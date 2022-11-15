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

Vue.component('local-storage-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.key" variant="info">{{ viewModel.key }}</b-badge>                
            <b-button v-if="isEditable()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-collapse v-if="isEditable()" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"
                ></b-form-textarea>
            </b-collapse>
        </div>
    `,
    created: function () {
        this.$eventHub.$on('synchronized', (pullResult) => {
            console.info('local storage update for synchronization', this.cid, pullResult);
            if (pullResult.keys != null && Object.keys(pullResult.keys).length > 0) {
                this.update();
            }
        });
    },
    mounted: function () {
        this.update();
    },
    data: function () {
        return {
            unwatchDataModel: undefined
        }
    },
    computed: {
        computedKey: function () {
            const key = this.$eval(this.viewModel.key, null);
            if (Array.isArray(key) && key.some(keyChunk => keyChunk == null)) {
                return undefined;
            }
            return this.buildKeyString(key);
        }
    },
    watch: {
        computedKey: {
            handler: function () {
                this.update();
            },
            immediate: true
        },
        dataModel: {
            handler: function() {
                if (this.dataModel == null) {
                    console.info("local storage remove", this.computedKey);
                    localStorage.removeItem(this.computedKey);
                } else {
                    console.info("local storage update", this.computedKey, JSON.stringify(this.dataModel, undefined, 2));
                    localStorage.setItem(this.computedKey, JSON.stringify(this.dataModel));
                }
            },
            deep: true
        }
    },
    methods: {
        async update() {
            if (!this.computedKey) {
                // transient storage
                return;
            }
            console.info("local storage update", this.computedKey);
            try {
                const storedValue = localStorage.getItem(this.computedKey);
                if (!(storedValue == null && this.dataModel == null || storedValue === JSON.stringify(this.dataModel))) {
                    this.$set(this, 'dataModel', JSON.parse(storedValue));
                }
            } catch (e) {
                console.error(e);
                //this.dataModel = undefined;
            }
            if (this.dataModel == null) {
                const defaultValue = this.$eval(this.viewModel.defaultValue, null);
                if (defaultValue != null) {
                    this.$set(this, 'dataModel', defaultValue);
                }
            }
        },
        getStoredArray: function (key, sharedBy) {
            let matchingKeys = this.getMatchingKeys(key, sharedBy);
            let array = [];
            matchingKeys.forEach(k => {
                try {
                    let kContent = JSON.parse(localStorage.getItem(k));
                    if (kContent == null) {
                        console.warn("content is null for key " + k);
                    } else {
                        if (!Array.isArray(kContent)) {
                            kContent = [kContent];
                        }
                        array.push(...kContent);
                    }
                } catch (e) {
                    console.warn('error will getting ' + k, e);
                }
            });
            return array;
        },
        removeStoredArray: function (key) {
            let matchingKeys = this.getMatchingKeys(key);
            matchingKeys.forEach(k => localStorage.removeItem(k));
        },
        setStoredArray: function (key, array) {
            if (this.isKeyQuery(key)) {
                console.error(`${this.cid}: cannot use a query key '${key}' to store an array`);
                throw new Error(`${this.cid}: cannot use a query key '${key}' to store an array`)
            }
            if (!Array.isArray(array)) {
                console.error(`The given argument is not an array`);
                return;
            }
            localStorage.setItem(this.buildKeyString(key), JSON.stringify(array));
        },
        addToStoredArray: function (key, data) {
            if (this.isKeyQuery(key)) {
                console.error(`${this.cid}: cannot use a query key '${key}' to store an array`);
                throw new Error(`${this.cid}: cannot use a query key '${key}' to store an array`)
            }
            const keyString = this.buildKeyString(key);
            let array = Tools.getStoredArray(keyString);
            array.push(data);
            localStorage.setItem(keyString, JSON.stringify(array));
        },
        removeFromStoredArray: function (key, data) {
            if (this.isKeyQuery(key)) {
                console.error(`${this.cid}: cannot use a query key '${key}' to store an array`);
                throw new Error(`${this.cid}: cannot use a query key '${key}' to store an array`)
            }
            const keyString = this.buildKeyString(key);
            let array = Tools.getStoredArray(keyString);
            if (data.id) {
                array.splice(array.findIndex(d => d.id === data.id), 1);
            } else {
                array.splice(array.indexOf(data), 1);
            }
            localStorage.setItem(keyString, JSON.stringify(array));
        },
        replaceInStoredArray: function (key, data) {
            if (this.isKeyQuery(key)) {
                console.error(`${this.cid}: cannot use a query key '${key}' to store an array`);
                throw new Error(`${this.cid}: cannot use a query key '${key}' to store an array`)
            }
            const keyString = this.buildKeyString(key);
            let array = Tools.getStoredArray(keyString);
            if (data.id) {
                array.splice(array.findIndex(d => d.id === data.id), 1, data);
            } else {
                array.splice(array.indexOf(data), 1, data);
            }
            localStorage.setItem(keyString, JSON.stringify(array));
        },
        // =========
        isKeyQuery(key) {
            if (key == null) {
                return false;
            }
            return Array.isArray(key) && key.indexOf('*') > -1;
        },
        buildKeyString(key, query) {
            if (key == null) {
                return undefined;
            }
            let sharedBy = this.$eval(this.viewModel.sharedBy, null);
            if (Array.isArray(key)) {
                let keyString = key
                    .map(k => {
                        if (k === "*") {
                            return "[^::]*";
                        } else {
                            return k;
                        }
                    })
                    .join('::');
                return sharedBy ? keyString + (query ? '-\\$-' : '-$-') + sharedBy : keyString;
            } else {
                return sharedBy ? key + (query ? '-\\$-' : '-$-') + sharedBy : key;
            }
        },
        getMatchingKeys(key, sharedBy) {
            if (this.isKeyQuery(key) || sharedBy) {
                let matchingKeys = [];
                let regExp = new RegExp(this.buildKeyString(key, true));
                for (let i = 0, len = localStorage.length; i < len; ++i) {
                    let chunks = localStorage.key(i).split('-$-');
                    if (chunks[0].match(regExp)) {
                        if (sharedBy) {
                            if (chunks[1] === undefined) {
                                // not a shared key
                                continue;
                            }
                            if (Array.isArray(sharedBy)) {
                                if (sharedBy.indexOf(chunks[1]) === -1) {
                                    continue;
                                }
                            } else if (typeof sharedBy === 'string') {
                                if (sharedBy !== '*') {
                                    if (sharedBy != chunks[1]) {
                                        continue;
                                    }
                                }
                            } else {
                                console.error("invalid sharedBy type", sharedBy);
                                continue;
                            }
                        } else {
                            if (chunks[1] !== undefined) {
                                // shared key
                                continue;
                            }
                        }
                        matchingKeys.push(localStorage.key(i));
                    }
                }
                return matchingKeys;
            } else {
                return [this.buildKeyString(key)];
            }
        },
        propNames() {
            return [
                "cid",
                "key",
                "sharedBy",
                "dataType",
                "defaultValue",
                "eventHandlers"
            ];
        },
        // TODO: find another way for these static methods
        customActionNames() {
            return [
                {value: "rename", text: "rename(newName)"},
                {text: " --- Arrays ---", disabled: true},
                {value: "getStoredArray", text: "getStoredArray(key, [sharedBy])"},
                {value: "setStoredArray", text: "setStoredArray(key, array)"},
                {value: "addToStoredArray", text: "addToStoredArray(key, data)"},
                {value: "removeFromStoredArray", text: "removeFromStoredArray(key, data)"},
                {value: "removeStoredArray", text: "removeStoredArray(key)"},
                {value: "replaceInStoredArray", text: "replaceInStoredArray(key, data)"}
            ];
        },
        async clear() {
            localStorage.removeItem(this.computedKey);
            await this.update();
        },
        rename(newName) {
            // TODO: I don't this it works
            localStorage.setItem(newName, JSON.stringify(this.dataModel));
        },
        customPropDescriptors() {
            return {
                key: {
                    type: 'text',
                    editable: true,
                    description: 'A string representing key used to store the data in the local storage'
                },
                sharedBy: {
                    type: 'text',
                    editable: true,
                    description: 'A user ID - the given user must share the key with you to have access'
                },
                remote: {
                    type: 'checkbox',
                    editable: true,
                    description: 'If set, the storage is only remote (on the server) and no data is stored locally in the browser - the user must be authenticated'
                },
                dataType: {
                    type: 'select',
                    options: viewModel => components.allowedDataTypes(viewModel.type),
                    category: 'data',
                    description: 'The data type that can will be stored in the storage. Note that only objects and arrays are supported at this point'
                },
                defaultValue: {
                    type: 'text',
                    editable: true,
                    description: 'The default value of the data model when the data does not exist yet in the local storage or when its value is not valid'
                }
            }
        }

    }
});


