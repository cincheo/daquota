
window.plugins.backend4dliteConnector = {

    start: function() {

        Vue.component('application-connector', {
            extends: editableComponent,
            template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected" :link="getLink()"></component-badge>
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
            mounted: async function () {
                await ide.fetchDomainModel(this.viewModel.serverBaseUrl);
                this.update();
            },
            data: function() {
                return {
                    error: false
                }
            },
            watch: {
                'viewModel.serverBaseUrl': {
                    handler: function() {
                        ide.fetchDomainModel(this.viewModel.serverBaseUrl);
                    },
                    immediate: true
                },
                'viewModel.kind': {
                    handler: function () {
                        this.update();
                    },
                    immediate: true
                },
                'viewModel.className': {
                    handler: function () {
                        this.update();
                    },
                    immediate: true
                },
                'viewModel.methodName': {
                    handler: function () {
                        this.update();
                    },
                    immediate: true
                },
                'viewModel.argument': {
                    handler: function () {
                        this.update();
                    },
                    immediate: true
                }
            },
            methods: {
                getLink() {
                    if (this.viewModel.className && this.viewModel.methodName) {
                        return this.viewModel.className.split('.')[this.viewModel.className.split('.').length - 1] + '.' + this.viewModel.methodName;
                    } else {
                        return undefined;
                    }
                },
                async invoke(arguments) {
                    if (typeof arguments !== 'string') {
                        arguments = JSON.stringify(arguments);
                    }
                    console.info("invoking application method", this.viewModel.className, this.viewModel.methodName);
                    if (!(this.viewModel.className && this.viewModel.methodName)) {
                        return;
                    }
                    try {
                        let formData = new FormData();
                        formData.append('className', this.viewModel.className);
                        formData.append('methodName', this.viewModel.methodName);
                        formData.append('arguments', arguments);
                        let url = (this.viewModel.serverBaseUrl ? this.viewModel.serverBaseUrl : baseUrl) + '/invoke';
                        console.log("fetch", url);
                        this.dataModel = await fetch(url, {
                            method: "POST",
                            body: formData
                        }).then(response => {
                            this.error = false;
                            return response.json();
                        })
                            .catch((error) => {
                                console.error(error);
                                this.error = true;
                                return {};
                            });
                    } catch (e) {
                        console.error(e);
                    }
                },
                async update() {
                    if (this.isData()) {
                        await this.invoke(this.viewModel.arguments);
                    }
                },
                isData() {
                    if (this.viewModel.className && this.viewModel.methodName) {
                        try {
                            return ide.getDomainModel(this.viewModel.serverBaseUrl).classDescriptors[this.viewModel.className].methodDescriptors[this.viewModel.methodName].type !== 'void';
                        } catch (e) {
                            this.error = true;
                        }
                    } else {
                        return false;
                    }
                },
                customActionNames() {
                    return ["invoke", "setArguments"];
                },
                setArguments(arguments) {
                    this.viewModel.arguments = arguments;
                },
                propNames() {
                    return ["cid", "serverBaseUrl", "kind", "className", "methodName", "arguments", "eventHandlers"];
                },
                customPropDescriptors() {
                    return {
                        serverBaseUrl: {
                            type: 'text',
                            label: "Server base URL",
                            editable: true
                        },
                        kind: {
                            type: 'select',
                            editable: true,
                            options: ["repository", "service"]
                        },
                        className: {
                            type: 'select',
                            label: 'Class name',
                            editable: true,
                            options: (viewModel) => viewModel.kind === 'repository' ? ide.getDomainModel(viewModel.serverBaseUrl).repositories : viewModel.kind === 'service' ? ide.getDomainModel(viewModel.serverBaseUrl).services : undefined
                        },
                        methodName: {
                            type: 'select',
                            label: 'Method',
                            editable: true,
                            options: (viewModel) => viewModel.className ? ide.getDomainModel(viewModel.serverBaseUrl).classDescriptors[viewModel.className].methods : undefined
                        }
                    }
                }

            }
        });

        ide.componentTools.push(
            {type: "ApplicationConnector", label: "Backend4dLite connector", category: "data-sources"}
        )

    },

    stop: function() {

        ide.removeComponentTool("ApplicationConnector");

    }

}

ide.pluginLoaded('backend4dliteConnector');

