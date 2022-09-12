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
    // computed: {
    //     url: function() {
    //         let url = this.$eval(this.viewModel.baseUrl);
    //         if (this.viewModel.path) {
    //             let path = this.$eval(this.viewModel.path);
    //             if (!url.endsWith('/') && !path.startsWith('/')) {
    //                 url += '/';
    //             }
    //             url += this.$eval(this.viewModel.path);
    //         }
    //         return url;
    //     }
    // },
    created() {
        this.invokeParams = [];
    },
    methods: {
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
                if (this.viewModel.proxy) {
                    url = corsProxy(url);
                    console.log("proxied url", url);
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
                    this.$emit('error', undefined);
                    return response.text();
                })
                    .catch((error) => {
                        console.error(error);
                        this.$emit('error', error.message + ' - ' + url);
                        this.$emit('@http-invocation-ends', this.viewModel.cid);
                        return undefined;
                    });

                ide.monitor('DOWNLOAD', 'REST', result?.length);
                ide.monitor('UPLOAD', 'REST', body?.length);
                if (this.$eval(this.viewModel.resultType) !== 'TEXT') {
                    result = JSON.parse(result);
                }

                this.$emit('@http-invocation-ends', this.viewModel.cid);
                return result;
            } catch (e) {
                console.error(e);
            }
        },
        async update() {
            this.dataModel = await this.invoke();
        },
        customEventNames() {
            return ["@http-invocation-ends"];
        },
        customActionNames() {
            return [{value:"invoke",text:"invoke(...invokeParams)"}];
        },
        propNames() {
            return [
                "cid",
                "baseUrl",
                "path",
                "proxy",
                "method",
                "headers",
                "credentials", "mode",
                "bodyType",
                "body",
                "resultType",
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
                resultType: {
                    type: 'select',
                    editable: true,
                    literalOnly: true,
                    options: ["JSON", "TEXT"],
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


