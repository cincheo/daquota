Vue.component('application-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="edit && isData()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
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
                    return response.json();
                })
                    .catch(() => { return {}; });
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
                return domainModel.classDescriptors[this.viewModel.className].methodDescriptors[this.viewModel.methodName].type !== 'void';
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


