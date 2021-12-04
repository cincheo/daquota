Vue.component('data-editor-panel', {
    template: `
        <b-form-group :state="state" :label="label" :invalid-feedback="invalidFeedback" :label-size="size" :label-class="labelClass" :class="panelClass" :style="panelStyle">
            <div ref="editor" style="flex-grow: 1; top: 0; right: 0; bottom: 0; left: 0;"></div>
        </b-form-group>
        `,
    props: ['dataModel', 'label', 'size', 'panelClass', 'labelClass', 'rows', 'maxRows', 'panelStyle', 'readOnly'],
    mounted: function() {
        this.jsonDataModel = this.dataModel ? JSON.stringify(this.dataModel, null, 2) : '';
        this.initEditor();
    },
    data: () => {
        return {
            jsonDataModel: '',
            state: null,
            invalidFeedback: null
        }
    },
    watch: {
        'dataModel': {
            handler: function (dataModel) {
                this.jsonDataModel = dataModel ? JSON.stringify(dataModel, null, 2) : '';
                this._watchChanges = false;
                this._editor?.session?.setValue(this.jsonDataModel);
                this._watchChanges = true;
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        checkState() {
            if (this.jsonDataModel === undefined || this.jsonDataModel === '') {
                this.state = undefined;
                return;
            }
            try {
                JSON.parse(this.jsonDataModel);
                if (this.state === undefined || this.state === false) {
                    this.invalidFeedback = undefined;
                    this.state = true;
                }
            } catch (e) {
                if (this.state === undefined || this.state === true) {
                    this.state = false;
                    this.invalidFeedback = e.message;
                }
            }
        },
        updateDataModel() {
            if (this.jsonDataModel === undefined || this.jsonDataModel === '') {
                this.state = undefined;
                return;
            }
            try {
                this.invalidFeedback = undefined;
                let data = JSON.parse(this.jsonDataModel);
                this.state = true;
                this.$emit('update-data', data);
            } catch (e) {
                this.state = false;
                this.invalidFeedback = e.message;
            }
        },
        initEditor() {
            if (this._editor) {
                try {
                    this._editor.destroy();
                } catch (e) {
                    console.error('editor', e);
                }
            }

            Vue.nextTick(() => {
                console.log('buidling json editor', this.jsonDataModel, this.$refs['editor'], this.$refs['editor'].$el);
                this._editor = ace.edit(this.$refs['editor'], {
                    mode: "ace/mode/json",
                    selectionStyle: "text"
                });
                this._editor.setOptions({
                    autoScrollEditorIntoView: true,
                    copyWithEmptySelection: true,
                    enableBasicAutocompletion: true,
                    enableSnippets: false,
                    enableLiveAutocompletion: true,
                    showLineNumbers: false,
                    minLines: this.rows ? this.rows : 1,
                    maxLines: this.maxRows ? this.maxRows : 10
                });
                this._editor.renderer.setScrollMargin(10, 10);
                // this._editor.setTheme("ace/theme/monokai");
                this._editor.session.setMode("ace/mode/json");

                if (this.readOnly) {
                    this._editor.setReadOnly(true);
                }

                this._editor.session.setValue(this.jsonDataModel);
                this._watchChanges = true;
                console.log('json editor built', this._editor.getValue());
                this._editor.on('change', () => {
                    if (this._watchChanges) {
                        console.log('json editor change');
                        this.jsonDataModel = this._editor.getValue();
                        this.updateDataModel();
                    }
                });

            });
        }
    }
});
