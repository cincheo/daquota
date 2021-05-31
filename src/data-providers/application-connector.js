Vue.component('application-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if='edit' :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected" :link="getLink()"></component-badge>
            <b-button v-if="edit && isData()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-badge v-if="edit && this.error" pill variant="danger" class="float-right mt-1" size="sm"> ! </b-badge>
            <b-collapse v-if="edit" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
            </b-collapse>
        </div>
    `,
    mounted: function () {
        this.update();
    },
    data: function() {
        return {
            error: false
        }
    },
    watch: {
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
                let url = baseUrl + '/invoke';
                console.log("fetch", url);
                this.dataModel = await fetch(url, {
                    method: "POST",
                    body: formData
                }).then(response => {
                    this.error = false;
                    return response.json();
                })
                    .catch(() => {
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
                    return domainModel.classDescriptors[this.viewModel.className].methodDescriptors[this.viewModel.methodName].type !== 'void';
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
            return ["cid", "kind", "className", "methodName", "arguments", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                kind: {
                    type: 'select',
                    editable: true,
                    options: ["repository", "service"]
                },
                className: {
                    type: 'select',
                    label: 'Class name',
                    editable: true,
                    options: (viewModel) => viewModel.kind === 'repository' ? domainModel.repositories : viewModel.kind === 'service' ? domainModel.services : undefined
                },
                methodName: {
                    type: 'select',
                    label: 'Method',
                    editable: true,
                    options: (viewModel) => viewModel.className ? domainModel.classDescriptors[viewModel.className].methods : undefined
                }
            }
        }

    }
});


