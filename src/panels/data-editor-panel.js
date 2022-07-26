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

Vue.component('data-editor-panel', {
    template: `
        <div v-if="standalone" class="h-100 w-100" style="position: relative">
            <div ref="editor" class="h-100 w-100"/>
            <b-button v-if="!readOnly" style="position: absolute; right:1rem; top:1rem" pill size="sm" @click="updateDataModel">Apply changes</b-button>
        </div>
        <b-form-group 
            v-else
            :state="computedState" 
            :label="label" 
            :invalid-feedback="invalidFeedback" 
            :label-size="size" 
            :label-class="labelClass" 
            :class="panelClass" 
            :style="panelStyle"
        >
            <div ref="editor" style="flex-grow: 1; top: 0; right: 0; bottom: 0; left: 0;"></div>
        </b-form-group>
        `,
    props: ['standalone', 'dataModel', 'viewModel', 'label', 'size', 'panelClass', 'labelClass', 'rows', 'maxRows', 'panelStyle', 'readOnly', 'showLineNumbers'],
    mounted: function () {
        this.jsonDataModel = this.dataModel ? JSON.stringify(this.dataModel, null, 2) : '';
        this._rows = this.jsonDataModel.split(/\r\n|\r|\n/);
        this.initEditor();
    },
    data: () => {
        return {
            jsonDataModel: '',
            state: undefined,
            invalidFeedback: null
        }
    },
    computed: {
        computedState: function () {
            if (this.state === false) {
                return this.state;
            }
            if (this.viewModel && this.viewModel.dataType) {
                const validDataModel = components.isValidDataModel(this.viewModel.dataType, this.dataModel);
                if (!validDataModel) {
                    this.invalidFeedback = "Expected '" + this.viewModel.dataType + "' but got '" + components.getDataTypeForValue(this.dataModel) + "'";
                    return false;
                }
            }
            return undefined;
        }
    },
    watch: {
        'dataModel': {
            handler: function (dataModel) {
                const newJson = dataModel ? JSON.stringify(dataModel, null, 2) : '';
                if (newJson !== this.jsonDataModel) {
                    this.jsonDataModel = newJson;
                    this._rows = this.jsonDataModel.split(/\r\n|\r|\n/);
                    const selection = this._editor?.selection?.toJSON();
                    this._editor?.session?.setValue(this.jsonDataModel);
                    this._editor?.selection?.fromJSON(selection);
                }
            },
            deep: true,
            immediate: true
        },
        readOnly: function () {
            if (this._editor) {
                this._editor.setReadOnly(this.readOnly);
            }
        }
    },
    methods: {
        findDiff(str1, str2) {
            let diff = "";
            str2.split('').forEach(function (val, i) {
                if (val != str1.charAt(i))
                    diff += val;
            });
            return diff;
        },
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
        getDataModel() {
            return JSON.parse(this.jsonDataModel);
        },
        getJson() {
            return this.jsonDataModel;
        },
        getRows() {
            return this._rows;
        },
        getRowCount() {
            return this._rows.length;
        },
        getRowAt(row) {
            return this._rows[row];
        },
        getRowIndentAt(row) {
            return this._rows[row].search(/\S|$/);
        },
        findRowsForJsonEntry(jsonEntry) {
            const result = [];
            for (let row = 0; row < this._rows.length; row++) {
                const currentJsonEntry = this.getJsonEntryAt(row);
                if (currentJsonEntry[0] === jsonEntry[0] && currentJsonEntry[1] === jsonEntry[1]) {
                    result.push(row);
                }
            }
            return result;
        },
        findObjectBoundariesAt(row) {
            let start = -1, end = -1;
            const rowIndent = this.getRowIndentAt(row);
            start = row;
            while (!(start === 0 || this.getRowAt(start).trim().endsWith('{') && this.getRowIndentAt(start) < rowIndent)) {
                start--;
            }
            end = row;
            while (!(end === this.getRowCount() || this.getRowAt(end).trim() === '}' && this.getRowIndentAt(end) < rowIndent)) {
                end++;
            }
            return {start: start, end: end};
        },
        setExpandedAt(row, expanded, placeholder) {
            const type = this._editor.session.getFoldWidget(row);
            const line = this._editor.session.getLine(row);
            const dir = (type === "end") ? -1 : 1;
            let fold = this._editor.session.getFoldAt(row, dir === -1 ? 0 : line.length, dir);
            if (fold) {
                if (expanded) {
                    this._editor.session.expandFold(fold);
                } else {
                    if (fold.placeholder === '...') {
                        this._editor.session.removeFold(fold);
                        fold = undefined;
                    }
                }
            }
            if (!fold) {
                if (!expanded) {
                    const range = this._editor.session.getFoldWidgetRange(row, true);
                    this._editor.session.addFold(placeholder ? placeholder : '...', range);
                }
            }
        },
        getJsonEntryAt(row) {
            const a = this._rows[row].split(':');
            return a.length === 1 ? [undefined, undefined] : [a[0].split('"')[1], a[1].split('"')[1]];
        },
        addMarker(startRow, startCol, endRow, endCol, markerClass) {
            this._editor.session.addMarker(
                new ace.Range(startRow, startCol, endRow, endCol, markerClass),
                markerClass,
                "text"
            );
        },
        goToRow(row) {
            const fold = this._editor.session.getFoldAt(row + 1);
            if (fold) {
                row = fold.start.row;
            }
            this._editor.gotoLine(row + 1, 0, true);
        },
        removeAllMarkers(...classes) {
            const prevMarkers = this._editor.session.getMarkers();
            if (prevMarkers) {
                const prevMarkersArr = Object.keys(prevMarkers);
                for (let item of prevMarkersArr) {
                    if (classes.includes(prevMarkers[item].clazz)) {
                        this._editor.session.removeMarker(prevMarkers[item].id);
                    }
                }
            }
        },
        getEditor() {
            return this._editor;
        },
        updateDataModel() {
            if (this.jsonDataModel === undefined || this.jsonDataModel === '') {
                this.state = undefined;
                return;
            }
            try {
                this.invalidFeedback = undefined;
                let data = JSON.parse(this.jsonDataModel);
                this.state = undefined;
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
                    showLineNumbers: this.showLineNumbers,
                    minLines: this.rows ? this.rows : (this.standalone ? undefined : 1),
                    maxLines: this.maxRows ? this.maxRows : (this.standalone ? undefined : 10)
                });
                this._editor.renderer.setScrollMargin(10, 10);
                this._editor.session.setMode("ace/mode/json");

                if (this.$listeners && this.$listeners['fold-item-clicked']) {

                    this._editor.session.onFoldWidgetClick = row => {
                        const fold = this._editor.session.getFoldAt(row + 1);
                        this.$emit('fold-item-clicked', row, fold?.placeholder);
                    }

                    // remove events to disable default fold click events
                    this._editor._eventRegistry.click.length = 0;

                    this._editor.on("click", (e) => {
                        const position = e.getDocumentPosition();

                        // If the user clicked on a fold, then expand it.
                        const fold = this._editor.session.getFoldAt(position.row, position.column, 1);
                        if (fold) {
                            this.$emit('fold-item-clicked', position.row, fold?.placeholder);
                            e.stop();
                            e.stopPropagation();
                        }
                    });
                }

                if (this.readOnly) {
                    this._editor.setReadOnly(true);
                }

                this._editor.session.setValue(this.jsonDataModel);
                this._editor.on('change', () => {
                    this.jsonDataModel = this._editor.getValue();
                    this._rows = this.jsonDataModel.split(/\r\n|\r|\n/);
                    this.updateDataModel();
                });
                this._editor.selection.on('changeCursor', () => {
                    this.$emit('change-cursor', this._editor.getCursorPosition());
                });

                this.$emit('init-editor');


            });
        }
    }
});

