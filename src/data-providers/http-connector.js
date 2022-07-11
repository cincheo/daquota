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
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="isEditable() && isData()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-badge v-if="this.error" pill variant="danger" class="float-right mt-1" size="sm"> ! </b-badge>
            <b-collapse v-if="isEditable()" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
            </b-collapse>
        </div>
    `,
    data: function() {
        return {
            error: false
        }
    },
    methods: {
        async invoke(pathParams, body) {
            console.info("invoking http endpoint", this.viewModel.baseUrl + "/" + this.viewModel.path, pathParams, body);
            if (!(this.viewModel.baseUrl && this.viewModel.path)) {
                return undefined;
            }
            try {
                if (body === undefined) {
                    body = this.$eval(this.viewModel.body, null);
                }
                if (body) {
                    if (this.viewModel.form) {
                        let formData = new FormData();
                        for (const key in body) {
                            formData.append(key, body[key]);
                        }
                        body = formData;
                    } else {
                        body = JSON.stringify(body);
                    }
                }
                if (pathParams === undefined) {
                    pathParams = this.viewModel.pathParams;
                }

                function assemble(literal, params) {
                    return new Function(params, "return `"+literal+"`;");
                }
                const template = assemble(this.viewModel.path === undefined ? '' : this.$eval(this.viewModel.path), "pathParams");
                let url = this.$eval(this.viewModel.baseUrl) + '/' + template(pathParams);
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
                if (this.viewModel.mode) {
                    init.mode = this.$eval(this.viewModel.mode);
                }
                if (this.viewModel.credentials) {
                    init.credetials = this.$eval(this.viewModel.credentials);
                }
                let result = await fetch(url, init).then(response => {
                    this.error = false;
                    return response.text();
                })
                    .catch((error) => {
                        console.error(error);
                        this.error = true;
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
        async update(pathParams, body) {
            this.dataModel = await this.invoke(pathParams || this.viewModel.pathParams, body);
        },
        customEventNames() {
            return ["@http-invocation-ends"];
        },
        customActionNames() {
            return [{value:"invoke",text:"invoke(pathParams, body)"}];
        },
        propNames() {
            return [
                "cid",
                "baseUrl",
                "path",
                "proxy",
                "method",
                "headers",
                "form",
                "credentials", "mode", "body", "pathParams", "resultType", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                baseUrl: {
                    type: 'text',
                    label: "Base URL",
                    editable: true
                },
                resultType: {
                    type: 'select',
                    editable: true,
                    options: ["JSON", "TEXT"],
                },
                method: {
                    type: 'select',
                    editable: true,
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
                    description: "The path to the http endpoint, which can contain invocation path params to be substituted (for instance: x/y/${pathParams['param']}/z)"
                },
                credentials: {
                    type: 'select',
                    label: 'Credentials',
                    editable: true,
                    options: ['omit', 'same-origin', 'include']
                },
                mode: {
                    type: 'select',
                    label: 'Mode',
                    editable: true,
                    options: ['cors', 'no-cors', 'same-origin', 'navigate']
                },
                form: {
                    type: 'checkbox',
                    label: 'Use form data',
                    editable: true,
                    description: 'Sends the body as a form data'
                },
                headers: {
                    type: 'code/json',
                    label: 'Headers',
                    editable: true
                },
                pathParams: {
                    type: 'pathParams',
                    label: 'Path parameters',
                    editable: true
                },
                body: {
                    type: 'code/json',
                    label: 'Request body',
                    editable: true
                }
            }
        }

    }
});


