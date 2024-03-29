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
            if (pullResult.keys != null && Object.keys(pullResult.keys).length > 0) {
                this.update();
            }
        });
    },
    mounted: function () {
        this._ready = true;
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
            let keyString = storage.buildKeyString(key);
            if (this.viewModel.partitionKey) {
                // for a partition, the computed key is a query for all the partitions
                keyString += '::.*';
            }
            return keyString;
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
                await this.syncAndShare();
                this.update();
            },
            immediate: true
        },
        'viewModel.readOnlyShares': {
            handler: async function () {
                await this.syncAndShare();
                this.update();
            },
            immediate: true
        },
        value: {
            handler: async function () {
                if (ide.sync._session) {
                    console.debug('adding modified storage', this.cid);
                    ide.sync._session.addModifiedStorage(this);
                }
                await this._readPromise;
                if (this.viewModel.key === 'dlite.myapps') {
                    if (Array.isArray(this.dataModel) && this.dataModel.length <= 1) {
                        console.error('DANGER WARNING: personal apps bug?', this.dataModel, this._ready, this._writePromise, this._readPromise);
                    }
                }
                if (this._writePromise) {
                    return this._writePromise;
                }
                if (this.$eval(this.viewModel.query, null)) {
                    // queries are read-only
                    return;
                }
                if (this.value == null) {
                    // do not save
                    return;
                }
                const computedKey = this.computedKey;
                if (!computedKey) {
                    return;
                }
                if (this._dataInitialized !== computedKey) {
                    return;
                }
                try {
                    const autoSync = this.$eval(this.viewModel.autoSync, null);
                    if (this.viewModel.partitionKey) {

                        this._writePromise = storage.getMatchingKeys(computedKey)
                            .then(async initialKeys => {
                                const replacedOrIgnoredKeys = [];
                                for (const partition of this.getPartitions()) {
                                    // console.info('partition', partition)
                                    // console.info('value', this.value);
                                    // console.info('viewModel', this.viewModel);
                                    const valuesToStore = this.value.filter(item => item[this.viewModel.partitionKey] === partition);
                                    const partitionKey = this.computedPartitionKey(partition);
                                    const storedValues = await this.storeValues(partitionKey, valuesToStore);
                                    replacedOrIgnoredKeys.push(...storedValues);
                                }
                                for (const key of initialKeys) {
                                    if (!replacedOrIgnoredKeys.includes(key)) {
                                        console.error('key does not exist anymore (SHOULD DELETE)', key);
                                        // console.error('initial keys', initialKeys);
                                        // console.error('replaced or ignored keys', replacedOrIgnoredKeys);
                                        // console.error('value', this.value);

                                        // clear the collection rather than removing the key so that it will be synced even when the
                                        // partition is deleted (locally-deleted keys don't get synced otherwise)
                                        await storage.setItem(key, JSON.stringify([]));
                                        //console.error('deleted', key);
                                        //storage.getItem(key).then(item => console.error('read', key, item));
                                    }
                                }
                                if (autoSync) {
                                    await this.syncAndShare();
                                }
                                //this._writePromise = undefined;
                        });

                    } else {
                        if (this.viewModel.dataType === 'object') {
                            this._writePromise = storage.setItem(computedKey, JSON.stringify(this.removeMetadata(this.value))).then(async () => {
                                if (autoSync) {
                                    await this.syncAndShare();
                                }
                                //this._writePromise = undefined;
                            });
                        } else {
                            this._writePromise = this.storeValues(computedKey, this.value).then(async () => {
                                if (autoSync) {
                                    await this.syncAndShare();
                                }
                                //this._writePromise = undefined;
                            });
                        }
                    }
                    // if (this.$eval(this.viewModel.autoSync, null)) {
                    //     this._writePromise.then(() => {
                    //         return this.syncAndShare();
                    //     })
                    // }
                    this._writePromise.finally(() => {
                        this._writePromise = undefined;
                    });


                } catch (e) {
                    ide.reportError('danger', 'Cannot store local data', 'An error occurred while saving the data of "' + this.cid + '": ' + e.message);
                }
            },
            deep: true
        }
    },
    methods: {
        async update() {
            await this._writePromise;
            if (this._readPromise) {
                return this._readPromise;
            }
            const computedKey = this.computedKey;
            if (!computedKey) {
                // transient storage
                return;
            }
            const query = this.$eval(this.viewModel.query, null);
            this._readPromise = storage.getMatchingKeys(computedKey)
                .then(async matchingKeys => {
                    if (matchingKeys.length === 0) {
                        //this._dataInitialized = computedKey;
                        this.value = undefined;
                    } else {
                        if (this.viewModel.dataType === 'object') {
                            if (matchingKeys.length > 1) {
                                console.error('invalid matching keys for data type in ' + this.cid, computedKey, matchingKeys);
                            }
                            //this._dataInitialized = computedKey;
                            const item = await storage.getItem(matchingKeys[0]);
                            this.value = JSON.parse(item);
                        } else {
                            if (matchingKeys.length > 0 || query) {
                                const mergedValue = [];
                                await Promise.all(matchingKeys.map(key => storage.getItem(key).then(storedValue => {
                                    const explodedKey = storage.explodeKeyString(key);
                                    if (storedValue != null && storedValue !== 'undefined') {
                                        const parsedStoredValue = JSON.parse(storedValue);
                                        if (Array.isArray(parsedStoredValue)) {
                                            mergedValue.push(...parsedStoredValue.map(value => this.injectMetadata(value, explodedKey)));
                                        } else {
                                            mergedValue.push(this.injectMetadata(parsedStoredValue));
                                        }
                                    }
                                })));

                                if (this.viewModel.partitionKey) {
                                    mergedValue.sort((item1, item2) => {
                                        const v1 = item1[this.viewModel.partitionKey];
                                        const v2 = item2[this.viewModel.partitionKey];
                                        if (v1 === v2) {
                                            return 0;
                                        }
                                        if (v2 > v1) {
                                            return -1;
                                        } else {
                                            return 1;
                                        }
                                    });
                                }
                                //this._dataInitialized = computedKey;
                                if (!(JSON.stringify(mergedValue) === JSON.stringify(this.value))) {
                                    this.value = mergedValue;
                                }
                            }
                        }
                    }

                    if (this.value == null) {
                        const defaultValue = this.$eval(this.viewModel.defaultValue, null);
                        if (defaultValue != null) {
                            this.value = defaultValue;
                        }
                    }

                })
                .finally(() => {
                    this._dataInitialized = computedKey;
                    this._readPromise = undefined;
                });
            return this._readPromise;

        },
        async storeValues(key, values) {
            const replacedOrIgnoredKeys = [];
            if (values == null) {
                return replacedOrIgnoredKeys;
            }
            const sharedByValues = $tools.collectUniqueFieldValues(values, '$sharedBy');
            if (sharedByValues.length === 0) {
                sharedByValues[0] = undefined;
            }
            for (let sharedBy of sharedByValues) {
                if (!sharedBy || sharedBy === $collab.getLoggedUser()?.email) {
                    replacedOrIgnoredKeys.push(key);
                    await storage.setItem(key,
                        JSON.stringify(
                            this.removeMetadata(
                                values.filter(value => !value.$sharedBy || value.$sharedBy === $collab.getLoggedUser()?.email)
                            )
                        )
                    );
                } else {
                    const filteredValues = values.filter(value => value.$sharedBy === sharedBy);
                    const shareModeValues = $tools.collectUniqueFieldValues(filteredValues, '$shareMode');
                    for (let shareMode of shareModeValues) {
                        replacedOrIgnoredKeys.push(key + shareMode + sharedBy);
                        if (shareMode !== '-&-') {
                            await storage.setItem(key + shareMode + sharedBy,
                                JSON.stringify(
                                    this.removeMetadata(
                                        filteredValues.filter(value => value.$shareMode === shareMode)
                                    )
                                )
                            );
                        }
                    }
                }
            }
            return replacedOrIgnoredKeys;
        },
        async syncAndShare() {
            if (!this._ready) {
                return;
            }
            await $collab.synchronize();
            let shares = this.$evalCode(this.viewModel.shares, null);
            let readOnlyShares = this.$evalCode(this.viewModel.readOnlyShares, null);
            if (shares || readOnlyShares) {
                await this.share(shares, readOnlyShares);
            }
        },
        shareArrayForPartition(partition, shares) {
            if (Array.isArray(shares)) {
                return shares;
            } else if (typeof shares === 'object') {
                return shares[partition];
            } else if (typeof shares === 'function') {
                return shares(partition, this.value.find(item => item[this.viewModel.partitionKey] === partition))
            } else if (typeof shares === 'string') {
                return [shares];
            }
        },
        async share(shares, readOnlyShares) {
            if (!shares && !readOnlyShares) {
                return;
            }
            if ($collab.getLoggedUser() && this.computedKey) {
                if (this.viewModel.partitionKey) {
                    for (const partition of this.getOwnedPartitions()) {
                        const partitionKey = this.computedPartitionKey(partition);
                        await $collab.share(
                            partitionKey,
                            this.shareArrayForPartition(partition, shares),
                            this.shareArrayForPartition(partition, readOnlyShares)
                        );
                    }
                } else {
                    await $collab.share(this.computedKey, shares, readOnlyShares);
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
        getOwnedPartitions() {
            if (!this.viewModel.partitionKey) {
                return [];
            } else {
                return $tools.collectUniqueFieldValues(this.value.filter(item => !item.$sharedBy), this.viewModel.partitionKey);
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
            let keyString = storage.buildKeyString(key);
            keyString += '::' + partition;
            return keyString;
        },
        initAutoSync() {
            if (this.$eval(this.viewModel.autoSync, null)) {
                this.beforeDataChange = async () => {
                    await this._readPromise;
                    await this.syncAndShare();
                }
            }
        },
        injectMetadata(target, explodedKey) {
            if (typeof target !== 'object' || Array.isArray(target)) {
                console.warn('trying to inject metadata in non-object', target);
                return target;
            }
            if (explodedKey) {
                if (!target.hasOwnProperty('$key')) {
                    Object.defineProperty(target, '$key', {enumerable: false, value: explodedKey.key});
                }
                if (!target.hasOwnProperty('$sharedBy')) {
                    Object.defineProperty(target, '$sharedBy', {
                        enumerable: true,
                        value: explodedKey.sharedBy
                    });
                }
                if (!target.hasOwnProperty('$shareMode')) {
                    Object.defineProperty(target, '$shareMode', {
                        enumerable: true,
                        value: explodedKey.shareMode
                    });
                }
                //return Object.assign(target, { '$key': explodedKey.key, '$sharedBy': explodedKey.sharedBy });
                return target;
            } else {
                return target;
            }
        },
        wait() {
            return this._writePromise;
        },
        propNames() {
            return [
                "cid",
                "query",
                "autoSync",
                "key",
                "shares",
                "readOnlyShares",
                "partitionKey",
                "dataType",
                "defaultValue",
                "autoIds",
                "eventHandlers"
            ];
        },
        customActionNames() {
            return [
                {value: "rename", text: "rename(newName)"},
                {value: "wait", text: "wait()"}
            ];
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
                autoIds: {
                    type: 'checkbox',
                    label: 'Auto IDs',
                    editable: true,
                    literalOnly: true,
                    category: "data",
                    hidden: viewModel => viewModel.query,
                    description: 'If set, this connector automatically injects IDs to the data objects.'
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
                    category: 'sharing',
                    hidden: viewModel => viewModel.dataType !== 'array'
                },
                shares: {
                    type: 'code/javascript',
                    editable: true,
                    label: 'Shares (read/write permissions)',
                    description: 'A list of user ids to share this data with (read/write permissions). For partitioned data, can be a function returning a list of user ids: (id, data) => ...',
                    hidden: viewModel => viewModel.query || viewModel.dataType !== 'array',
                    manualApply: true,
                    literalOnly: true,
                    category: 'sharing',
                },
                readOnlyShares: {
                    type: 'code/javascript',
                    editable: true,
                    label: 'Shares (read-only permission)',
                    description: 'A list of user ids to share this data with (read-only permission). For partitioned data, can be a function returning a list of user ids: (id, data) => ...',
                    hidden: viewModel => viewModel.query || viewModel.dataType !== 'array',
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
