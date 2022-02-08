Vue.component('http-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="isEditable() && isData()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-badge v-if="isEditable() && this.error" pill variant="danger" class="float-right mt-1" size="sm"> ! </b-badge>
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
                return {};
            }
            try {
                if (body === undefined) {
                    body = this.viewModel.body;
                }
                if (body) {
                    if (this.viewModel.form) {
                        let formData = new FormData();
                        for (const key in body) {
                            formData.append(key, body.key);
                        }
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
                const template = assemble(this.viewModel.path === undefined ? '' : this.viewModel.path, "pathParams");
                let url = this.viewModel.baseUrl + '/' + template(pathParams);
                console.info("fetch", url);
                if (this.viewModel.proxy != null && this.viewModel.proxy !== '') {
                    url = this.viewModel.proxy + encodeURIComponent(url);
                    console.log("proxied url", url);
                }
                let init = {
                    method: this.$eval(this.viewModel.method),
                }
                if (body) {
                    init.body = body;
                }
                if (this.viewModel.headers) {
                    init.headers = this.$eval(this.viewModel.headers);
                }
                if (this.viewModel.mode) {
                    init.mode = this.$eval(this.viewModel.mode);
                }
                if (this.viewModel.credentials) {
                    init.credetials = this.$eval(this.viewModel.credentials);
                }
                const result = await fetch(url, init).then(response => {
                    this.error = false;
                    if (this.$eval(this.viewModel.resultType) === 'TEXT') {
                        return response.text();
                    } else {
                        return response.json();
                    }
                })
                    .catch((error) => {
                        console.error(error);
                        this.error = true;
                        this.$emit('@http-invocation-ends', this.viewModel.cid);
                        return {};
                    });
                this.$emit('@http-invocation-ends', this.viewModel.cid);
                return result;
            } catch (e) {
                console.error(e);
            }
        },
        async update(pathParams, body) {
            this.dataModel = await this.invoke(pathParams || this.viewModel.pathParams, body || this.viewModel.body);
        },
        customEventNames() {
            return ["@http-invocation-ends"];
        },
        customActionNames() {
            return [{value:"invoke",text:"invoke(pathParams, body)"}];
        },
        propNames() {
            return ["cid", "baseUrl", "path", "proxy", "method", "headers", "form", "credentials", "mode", "body", "pathParams", "resultType", "eventHandlers"];
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
                    type: 'text',
                    editable: true,
                    description: 'A proxy URL (to be use to allow CORS)'
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
                    type: 'body',
                    label: 'Request body',
                    editable: true
                }
            }
        }

    }
});


