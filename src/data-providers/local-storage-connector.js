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
                    v-model="value"
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
        this.initAutoSync();
    },
    computed: {
        computedKey: function () {
            if (this.viewModel.key == null) {
                return undefined;
            }
            const key = this.$eval(this.viewModel.key, null);
            if (Array.isArray(key) && key.some(keyChunk => keyChunk == null)) {
                return undefined;
            }
            let keyString = ide.sync.buildKeyString(key);
            if (this.viewModel.partitionKey) {
                // for a partition, the computed key is a query for all the partitions
                keyString += '::.*';
            }
            const sharedBy = this.$eval(this.viewModel.sharedBy, null);
            return sharedBy ? keyString + (this.$eval(this.viewModel.query, null) || this.viewModel.partitionKey ? '-\\$-' : '-$-') + sharedBy : keyString
        }
    },
    watch: {
        'viewModel.autoSync': {
            handler: function () {
                this.initAutoSync();
            },
            immediate: true
        },
        computedKey: {
            handler: function () {
                this.update();
            },
            immediate: true
        },
        'viewModel.shares': {
            handler: async function () {
                console.info("shares", $collab.getLoggedUser(), this.viewModel.shares, this.computedKey);
                const shares = this.$evalCode(this.viewModel.shares, null);
                if (shares) {
                    await this.share(shares);
                }
                this.update();
            },
            immediate: true
        },
        'viewModel.readOnlyShares': {
            handler: async function () {
                console.info("read-only shares", $collab.getLoggedUser(), this.viewModel.readOnlyShares, this.computedKey);
                const shares = this.$evalCode(this.viewModel.readOnlyShares, null);
                if (shares) {
                    await this.share(shares);
                }
                this.update();
            },
            immediate: true
        },
        value: {
            handler: function() {
                if (this.$eval(this.viewModel.query, null)) {
                    // queries are read-only
                    return;
                }
                const computedKey = this.computedKey;
                if (!computedKey) {
                    return;
                }
                // clear all existing partitions (could be more efficient!)
                if (this.viewModel.partitionKey) {
                    for (const key of this.getMatchingKeys(computedKey)) {
                        localStorage.removeItem(key);
                    }
                }

                if (this.value == null) {
                    console.info("local storage remove", computedKey);
                    localStorage.removeItem(computedKey);
                } else {
                    console.info("local storage update", computedKey, JSON.stringify(this.value, undefined, 2));
                    if (this.viewModel.partitionKey) {
                        for (const partition of this.getPartitions()) {
                            localStorage.setItem(
                                this.computedPartitionKey(partition),
                                JSON.stringify(this.value.filter(item => item[this.viewModel.partitionKey] === partition))
                            );
                        }
                    } else {
                        localStorage.setItem(computedKey, JSON.stringify(this.value));
                    }
                }
                if (this.$eval(this.viewModel.autoSync, null)) {
                    $collab.synchronize();
                }
            },
            deep: true
        }
    },
    methods: {
        async share(shares, readOnly) {
            if ($collab.getLoggedUser() && shares && this.computedKey) {
                if (this.viewModel.partitionKey) {
                    for (const partition of this.getPartitions()) {
                        const partitionKey = this.computedPartitionKey(partition);
                        await $collab.share(partitionKey, typeof shares === 'array' ? shares : shares[partition], readOnly);
                    }
                } else {
                    await $collab.share(this.computedKey, shares, readOnly);
                }
            }
        },
        getPartitions() {
            if (!this.viewModel.partitionKey) {
                return [];
            } else {
                return $tools.collectUniqueFieldValues(this.value, this.viewModel.partitionKey);
            }
        },
        computedPartitionKey: function (partition) {
            if (this.viewModel.key == null) {
                return undefined;
            }
            const key = this.$eval(this.viewModel.key, null);
            if (Array.isArray(key) && key.some(keyChunk => keyChunk == null)) {
                return undefined;
            }
            let keyString = ide.sync.buildKeyString(key);
            keyString += '::' + partition;
            const sharedBy = this.$eval(this.viewModel.sharedBy, null);
            return sharedBy ? keyString + '-$-' + sharedBy : keyString;
        },
        initAutoSync() {
            if (this.$eval(this.viewModel.autoSync, null)) {
                this.beforeDataChange = async () => {
                    await $collab.synchronize();
                }
            }
        },
        async update() {
            const computedKey = this.computedKey;
            if (!computedKey) {
                // transient storage
                return;
            }
            if (this.$eval(this.viewModel.query, null) || this.viewModel.partitionKey) {
                console.info("local storage update with query", computedKey);
                const matchingKeys = this.getMatchingKeys(computedKey);
                const mergedValue = [];
                matchingKeys.forEach(key => {
                    try {
                        const storedValue = localStorage.getItem(key);
                        if (storedValue != null) {
                            const parsedStoredValue = JSON.parse(storedValue);
                            if (Array.isArray(parsedStoredValue)) {
                                mergedValue.push(...parsedStoredValue);
                            } else {
                                mergedValue.push(parsedStoredValue);
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                });
                if (!(JSON.stringify(mergedValue) === JSON.stringify(this.value))) {
                    this.value = mergedValue;
                }
            } else {
                try {
                    const storedValue = localStorage.getItem(this.computedKey);
                    if (!(storedValue == null && this.value == null || storedValue === JSON.stringify(this.value))) {
                        this.value = JSON.parse(storedValue);
                    }
                } catch (e) {
                    console.error(e);
                }
                if (this.value == null) {
                    const defaultValue = this.$eval(this.viewModel.defaultValue, null);
                    if (defaultValue != null) {
                        this.value = defaultValue;
                    }
                }
            }
        },
        getMatchingKeys(queryString) {
            let matchingKeys = [];
            let regExp = new RegExp(queryString);
            for (let i = 0, len = localStorage.length; i < len; ++i) {
                if (localStorage.key(i).match(regExp)) {
                    matchingKeys.push(localStorage.key(i));
                }
            }
            return matchingKeys;
        },


        // getStoredArray: function (key, sharedBy) {
        //     let matchingKeys = this.getMatchingKeys(key, sharedBy);
        //     let array = [];
        //     matchingKeys.forEach(k => {
        //         try {
        //             let kContent = JSON.parse(localStorage.getItem(k));
        //             if (kContent == null) {
        //                 console.warn("content is null for key " + k);
        //             } else {
        //                 if (!Array.isArray(kContent)) {
        //                     kContent = [kContent];
        //                 }
        //                 array.push(...kContent);
        //             }
        //         } catch (e) {
        //             console.warn('error will getting ' + k, e);
        //         }
        //     });
        //     return array;
        // },
        // removeStoredArray: function (key) {
        //     let matchingKeys = this.getMatchingKeys(key);
        //     matchingKeys.forEach(k => localStorage.removeItem(k));
        // },
        // setStoredArray: function (key, array) {
        //     if (this.isKeyQuery(key)) {
        //         console.error(`${this.cid}: cannot use a query key '${key}' to store an array`);
        //         throw new Error(`${this.cid}: cannot use a query key '${key}' to store an array`)
        //     }
        //     if (!Array.isArray(array)) {
        //         console.error(`The given argument is not an array`);
        //         return;
        //     }
        //     localStorage.setItem(this.buildKeyString(key), JSON.stringify(array));
        // },
        // addToStoredArray: function (key, data) {
        //     if (this.isKeyQuery(key)) {
        //         console.error(`${this.cid}: cannot use a query key '${key}' to store an array`);
        //         throw new Error(`${this.cid}: cannot use a query key '${key}' to store an array`)
        //     }
        //     const keyString = this.buildKeyString(key);
        //     let array = Tools.getStoredArray(keyString);
        //     array.push(data);
        //     localStorage.setItem(keyString, JSON.stringify(array));
        // },
        // removeFromStoredArray: function (key, data) {
        //     if (this.isKeyQuery(key)) {
        //         console.error(`${this.cid}: cannot use a query key '${key}' to store an array`);
        //         throw new Error(`${this.cid}: cannot use a query key '${key}' to store an array`)
        //     }
        //     const keyString = this.buildKeyString(key);
        //     let array = Tools.getStoredArray(keyString);
        //     if (data.id) {
        //         array.splice(array.findIndex(d => d.id === data.id), 1);
        //     } else {
        //         array.splice(array.indexOf(data), 1);
        //     }
        //     localStorage.setItem(keyString, JSON.stringify(array));
        // },
        // replaceInStoredArray: function (key, data) {
        //     if (this.isKeyQuery(key)) {
        //         console.error(`${this.cid}: cannot use a query key '${key}' to store an array`);
        //         throw new Error(`${this.cid}: cannot use a query key '${key}' to store an array`)
        //     }
        //     const keyString = this.buildKeyString(key);
        //     let array = Tools.getStoredArray(keyString);
        //     if (data.id) {
        //         array.splice(array.findIndex(d => d.id === data.id), 1, data);
        //     } else {
        //         array.splice(array.indexOf(data), 1, data);
        //     }
        //     localStorage.setItem(keyString, JSON.stringify(array));
        // },
        // // =========
        // isKeyQuery(key) {
        //     if (key == null) {
        //         return false;
        //     }
        //     return Array.isArray(key) && key.indexOf('*') > -1;
        // },
        // buildKeyStringWithoutSharedBy(key) {
        //     if (key == null) {
        //         return undefined;
        //     }
        //     if (Array.isArray(key)) {
        //         const keyString = key
        //             .map(k => {
        //                 if (k === "*") {
        //                     return "[^::]*";
        //                 } else {
        //                     return k;
        //                 }
        //             })
        //             .join('::');
        //         return keyString;
        //     } else {
        //         return key;
        //     }
        // },
        // buildKeyString(key, query) {
        //     if (key == null) {
        //         return undefined;
        //     }
        //     const sharedBy = this.$eval(this.viewModel.sharedBy, null);
        //     const keyString = this.buildKeyStringWithoutSharedBy(key);
        //     return sharedBy ? keyString + (query ? '-\\$-' : '-$-') + sharedBy : keyString
        // },
        // getMatchingKeys(key, sharedBy) {
        //     console.info('getMatchingKeys', key, sharedBy);
        //     if (this.isKeyQuery(key) || sharedBy) {
        //         let matchingKeys = [];
        //         let regExp = new RegExp(this.buildKeyString(key, true));
        //         console.info('getMatchingKeys - regexp', regExp);
        //         for (let i = 0, len = localStorage.length; i < len; ++i) {
        //             if (localStorage.key(i).match(regExp)) {
        //                 matchingKeys.push(localStorage.key(i));
        //             }
        //
        //             // let chunks = localStorage.key(i).split('-$-');
        //             // if (chunks[0].match(regExp)) {
        //             //     console.info('getMatchingKeys - match', chunks[0]);
        //             //     if (sharedBy) {
        //             //         if (chunks[1] === undefined) {
        //             //             // not a shared key
        //             //             continue;
        //             //         }
        //             //         if (Array.isArray(sharedBy)) {
        //             //             if (sharedBy.indexOf(chunks[1]) === -1) {
        //             //                 continue;
        //             //             }
        //             //         } else if (typeof sharedBy === 'string') {
        //             //             if (sharedBy !== '*') {
        //             //                 if (sharedBy != chunks[1]) {
        //             //                     continue;
        //             //                 }
        //             //             }
        //             //         } else {
        //             //             console.error("invalid sharedBy type", sharedBy);
        //             //             continue;
        //             //         }
        //             //     } else {
        //             //         if (chunks[1] !== undefined) {
        //             //             // shared key
        //             //             continue;
        //             //         }
        //             //     }
        //             //     matchingKeys.push(localStorage.key(i));
        //             // }
        //         }
        //         console.info('getMatchingKeys - result', matchingKeys);
        //         return matchingKeys;
        //     } else {
        //         return [this.buildKeyString(key)];
        //     }
        // },
        propNames() {
            return [
                "cid",
                "query",
                "autoSync",
                "key",
                "sharedBy",
                "shares",
                "readOnlyShares",
                "partitionKey",
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
            if (!this.$eval(this.viewModel.query, null)) {
                localStorage.removeItem(this.computedKey);
                await this.update();
            }
        },
        rename(newName) {
            if (!this.$eval(this.viewModel.query, null)) {
                // queries are read-only
                return;
            }
            // TODO: I don't think it works
            localStorage.setItem(newName, JSON.stringify(this.value));
        },
        customPropDescriptors() {
            return {
                query: {
                    type: 'checkbox',
                    label: 'Query',
                    editable: true,
                    literalOnly: true,
                    description: 'If set, this connector is a query to the local storage (read-only data access). Keys and shared by expressions can be regexp to match existing storage keys - when several keys are matched, the data is merged into a unique collection.'
                },
                autoSync: {
                    type: 'checkbox',
                    label: 'Auto sync',
                    editable: true,
                    hidden: viewModel => viewModel.query,
                    description: 'If set, this connector automatically synchronizes before and after each data change.'
                },
                key: {
                    type: 'text',
                    editable: true,
                    description: 'A string representing key used to store the data in the local storage',
                    manualApply: true
                },
                sharedBy: {
                    type: 'text',
                    editable: true,
                    description: 'A user ID - the given user must share the key with you to have access',
                    manualApply: true,
                    category: 'sharing'
                },
                shares: {
                    type: 'code/javascript',
                    editable: true,
                    label: 'Shares (read/write permissions)',
                    description: 'A list of user ids to share this data with (read/write permissions)',
                    hidden: viewModel => viewModel.query,
                    manualApply: true,
                    literalOnly: true,
                    category: 'sharing'
                },
                readOnlyShares: {
                    type: 'code/javascript',
                    editable: true,
                    label: 'Shares (read-only permission)',
                    description: 'A list of user ids to share this data with (read-only permission)',
                    hidden: viewModel => viewModel.query,
                    manualApply: true,
                    literalOnly: true,
                    category: 'sharing'
                },
                partitionKey: {
                    type: 'text',
                    label: 'Partition key (for arrays only)',
                    editable: true,
                    manualApply: true,
                    literalOnly: true,
                    hidden: viewModel => viewModel.query || viewModel.dataType !== 'array',
                    description: 'If a partition key is defined, the data, which is an array, will be partitioned in several sub-keys (main-key::partition-key), which can be shared and synchronized independently'
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


