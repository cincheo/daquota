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

Vue.component('http-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="isEditable() && isData()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-collapse v-if="isEditable()" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
            </b-collapse>
        </div>
    `,
    computed: {
        cacheBaseKey: function () {
            return Sync.LOCAL_KEY + '::' + applicationModel.name + '::' + this.cid;
        },
        cacheExpirationMilliseconds: function () {
            const expiration = this.$eval(this.viewModel.cacheExpiration, null);
            if (expiration) {
                return 1000 * 60 * expiration;
            } else {
                // 24 hours
                return 1000 * 60 * 60 * 24;
            }
        }
        // url: function() {
        //     let url = this.$eval(this.viewModel.baseUrl);
        //     if (this.viewModel.path) {
        //         let path = this.$eval(this.viewModel.path);
        //         if (!url.endsWith('/') && !path.startsWith('/')) {
        //             url += '/';
        //         }
        //         url += this.$eval(this.viewModel.path);
        //     }
        //     return url;
        // }
    },
    watch: {
        'viewModel.enableCache': function () {
            if (this.viewModel.enableCache) {
                this.initCache();
            } else {
                if (this._cache) {
                    this.clearCache();
                }
            }
        },
        'viewModel.cacheExpiration': function () {
            this._cache.expirationMilliseconds = this.cacheExpirationMilliseconds;
        },
        'viewModel.cacheMaxEntries': function () {
            this._cache.maxEntries = this.$eval(this.viewModel.cacheMaxEntries, null) || 100;
        },
        'viewModel.cacheEvictionStrategy': function () {
            this._cache.evictionStrategy = this.$eval(this.viewModel.cacheEvictionStrategy, null) || 'LRU';
        },
        'viewModel.resultType': function () {
            this.update();
        },
        'viewModel.csvSeparator': function () {
            this.update();
        }
    },
    created() {
        this.invokeParams = [];
        this.$eventHub.$on('before-component-renamed', (newName, oldName) => {
            console.info('before rename', newName, oldName);
            if (oldName === this.cid) {
                if (this._cache) {
                    this.clearCache();
                    this._cache.baseKey = this.cacheBaseKey;
                }
            }
        });
        if (this.viewModel.enableCache) {
            this.initCache();
        }
    },
    methods: {
        initCache() {
            if (!this._cache) {
                this._cache = new StorageCache(
                    this.cacheBaseKey,
                    this.cacheExpirationMilliseconds,
                    this.$eval(this.viewModel.cacheMaxEntries, null) || 100
                );
            }
        },
        async clearCache() {
            if (this._cache) {
                await this._cache.clear();
            }
        },
        async invoke(...invokeParams) {
            try {
                this.invokeParams = invokeParams ? invokeParams : [];
                let body = this.$eval(this.viewModel.body, null);
                if (body) {
                    if ((this.viewModel.bodyType === undefined && this.viewModel.form) || this.viewModel.bodyType === 'FORM-DATA') {
                        let formData = new FormData();
                        for (const key in body) {
                            formData.append(key, body[key]);
                        }
                        body = formData;
                    } else {
                        if (this.viewModel.bodyType === undefined || typeof this.viewModel.bodyType === 'JSON') {
                            body = JSON.stringify(body);
                        }
                    }
                }
                let url = this.$eval(this.viewModel.baseUrl);
                if (url === undefined) {
                    return;
                }
                const path = this.$eval(this.viewModel.path);
                if (path) {
                    if (!url.endsWith('/') && !path.startsWith('/')) {
                        url += '/';
                    }
                    url += path;
                }
                console.info("fetch", url);
                if (this._cache) {
                    const cached = await this._cache.getValue(url);
                    if (cached) {
                        return this.applyResultType(cached);
                    }
                }
                if (this.viewModel.proxy) {
                    url = corsProxy(url);
                }
                let init = {
                    method: this.$eval(this.viewModel.method),
                }
                if (body) {
                    init.body = body;
                }
                if (this.viewModel.headers) {
                    init.headers = typeof this.viewModel.headers === "string" ? this.$eval(this.viewModel.headers, null) : this.viewModel.headers;
                }
                if (this.viewModel.bodyType === undefined || this.viewModel.bodyType === 'JSON') {
                    if (!init.headers) {
                        init.headers = {};
                    }
                    if (!init.headers["Content-Type"]) {
                        init.headers["Content-Type"] = "application/json";
                    }
                }
                if (this.viewModel.mode) {
                    init.mode = this.$eval(this.viewModel.mode);
                }
                if (this.viewModel.credentials) {
                    init.credetials = this.$eval(this.viewModel.credentials);
                }
                let result = await fetch(url, init).then(response => {
                    if (response?.ok) {
                        this.$emit('error', undefined);
                        return response.text();
                    } else {
                        if (response.status !== 200) {
                            console.error('http invocation error, status: ' + response.status, url, init);
                            this.componentError('http invocation error, status: ' + response.status + ' - url: ' + url);
                            const handler = this.$evalCode(this.viewModel.errorHandler);
                            if (typeof handler === 'function') {
                                handler(response.status, url, init);
                            }
                            return undefined;
                        }
                    }
                })
                    .catch((error) => {
                        console.error(error);
                        this.componentError(error.message + ' - ' + url);
                        this.$emit('@http-invocation-ends', this.viewModel.cid);
                        return undefined;
                    });

                if (result && result.length) {
                    ide.monitor('DOWNLOAD', 'REST', result.length);
                }
                if (body && body.length) {
                    ide.monitor('UPLOAD', 'REST', body.length);
                }

                if (this._cache) {
                    await this._cache.setValue(url, result);
                }

                this.$emit('@http-invocation-ends', this.viewModel.cid);

                return this.applyResultType(result);
            } catch (e) {
                console.error(e);
                this.componentError(e.message);
            }
        },
        applyResultType(result) {
            if (result == null) {
                return undefined;
            }
            switch (this.$eval(this.viewModel.resultType)) {
                case 'TEXT':
                    break;
                case 'CSV (with headers)':
                    result = $tools.csvToArray(result, this.$evalWithDefault(this.viewModel.csvSeparator, ','));
                    break;
                default:
                    result = JSON.parse(result);
            }
            return result;
        },
        async update() {
            this.dataModel = await this.invoke();
        },
        customEventNames() {
            return ["@http-invocation-ends"];
        },
        customActionNames(viewModel) {
            let actions = [{value: "invoke", text: "invoke(...invokeParams)"}];
            if (viewModel.enableCache) {
                actions.push(
                    {value: "clearCache", text: "clearCache()"}
                )
            }
            return actions;
        },
        propNames() {
            return [
                "cid",
                "baseUrl",
                "path",
                "proxy",
                "enableCache",
                "cacheExpiration",
                "cacheMaxEntries",
                "cacheEvictionStrategy",
                "clearCache",
                "method",
                "resultType",
                "csvSeparator",
                "headers",
                "credentials",
                "mode",
                "bodyType",
                "body",
                "errorHandler",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                baseUrl: {
                    type: 'text',
                    label: "Base URL",
                    editable: true,
                    placeholder: "https://api.myservice.com/v1/"
                },
                errorHandler: {
                    type: 'code/javascript',
                    editable: true,
                    literalOnly: true,
                    description: 'A function to handle http errors: (errorStatus, url, initializationObject) => { ... }'
                },
                resultType: {
                    type: 'select',
                    editable: true,
                    literalOnly: true,
                    options: ["JSON", "TEXT", "CSV (with headers)"],
                    description: "Select the type of result expected when invoking the endpoint (default is JSON, parsed to an object)"
                },
                csvSeparator: {
                    type: 'select',
                    editable: true,
                    options: [
                        {
                            text: ",",
                            value: ","
                        }, {
                            text: ";",
                            value: ";"
                        }, {
                            text: "tab",
                            value: "\t"
                        }, {
                            text: "space",
                            value: " "
                        }, {
                            text: "pipe (|)",
                            value: "|"
                        }
                    ],
                    description: "If unspecified, defaults to comma (English standard)",
                    hidden: viewModel => viewModel.resultType !== 'CSV (with headers)'
                },
                method: {
                    type: 'select',
                    editable: true,
                    literalOnly: true,
                    options: ["GET", "POST", "PUT", "DELETE"]
                },
                proxy: {
                    type: 'checkbox',
                    editable: true,
                    literalOnly: true,
                    description: 'Use a proxy (to be used to allow CORS when accessing REST APIs)'
                },
                enableCache: {
                    type: 'checkbox',
                    category: 'cache',
                    editable: true,
                    literalOnly: true,
                    description: 'Cache the invocation results in the local storage when possible'
                },
                cacheExpiration: {
                    type: 'number',
                    category: 'cache',
                    label: 'Cache expiration (in minutes)',
                    editable: true,
                    hidden: viewModel => !viewModel.enableCache,
                    description: 'The number of minutes before a cache key expires (when not defined, default is 24 hours)'
                },
                cacheMaxEntries: {
                    type: 'number',
                    category: 'cache',
                    editable: true,
                    hidden: viewModel => !viewModel.enableCache,
                    description: 'The maximum number of entries in the cache (each entry corresponds to a set of specific parameter values), default is 100. Note that cache eviction takes place when the number of entries reaches the max number of entries and frees 10% of the cache.'
                },
                cacheEvictionStrategy: {
                    type: 'select',
                    category: 'cache',
                    label: 'Cache eviction strategy (LRU/LFU)',
                    literalOnly: true,
                    editable: true,
                    hidden: viewModel => !viewModel.enableCache,
                    description: 'LRU: Least Recently Used, LFU: Least Frequently Used',
                    options: ['LRU', 'LFU']
                },
                clearCache: {
                    type: 'action',
                    variant: 'warning',
                    category: 'cache',
                    label: viewModel => {
                        const size = $c(viewModel.cid) ? $c(viewModel.cid)._cache.size() : 0;
                        return 'Clear cache [' + (size > 1 ? size + ' entries]' : size + ' entry]');
                    },
                    icon: 'trash',
                    action: viewModel => {
                        if (confirm(`Are you sure you want to clear the cache for '${viewModel.cid}'?`)) {
                            $c(viewModel.cid).clearCache();
                        }
                    },
                    hidden: viewModel => !viewModel.enableCache
                },
                path: {
                    type: 'text',
                    label: 'Request path',
                    editable: true,
                    placeholder: "path/to/resource",
                    description: "The path to the http endpoint. When using the 'invoke(...params)' action on this component, you can access invocation parameters with the 'this.invokeParams' variable (for instance: x/y/${this.invokeParams[0]}/z)"
                },
                credentials: {
                    type: 'select',
                    label: 'Credentials',
                    editable: true,
                    literalOnly: true,
                    options: ['omit', 'same-origin', 'include']
                },
                mode: {
                    type: 'select',
                    label: 'Mode',
                    literalOnly: true,
                    editable: true,
                    options: ['cors', 'no-cors', 'same-origin', 'navigate']
                },
                form: {
                    type: 'checkbox',
                    label: 'Use form data',
                    literalOnly: true,
                    editable: true,
                    description: 'Sends the body as a form data instead of serialized JSON (default)'
                },
                bodyType: {
                    type: 'select',
                    literalOnly: true,
                    editable: true,
                    options: ['JSON', 'FORM-DATA', 'TEXT'],
                    description: 'Specifies how the body should be sent (default is serialized JSON). FORM-DATA sends the body as form data. TEXT sends the body as is.'
                },
                headers: {
                    type: 'code/json',
                    label: 'Headers',
                    editable: true,
                    description: 'A JSON object containing the headers to be added to the request.',
                    docLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers'
                },
                body: {
                    type: 'code/json',
                    label: 'Request body',
                    editable: true,
                    description: "An object containing the body of the request. However, when the selected body type is 'raw-text', you should write a formula that evaluates to a string. When using the 'invoke(...params)' action on this component, you can access invocation parameters with the 'this.invokeParams' variable (for instance: { key: ${this.invokeParams[0]} })"
                }
            }
        }

    }
});


