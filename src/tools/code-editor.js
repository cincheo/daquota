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

Vue.component('code-editor', {
    template: `
        <div :style="containerStyle" @click="focusEditor">
            <textarea ref="target"></textarea>
        </div>
    `,
    props: ['lang', 'minRows', 'maxRows', 'value', 'formula', 'focus', 'disabled', 'contextComponent', 'contextObject', 'containerStyle'],
    data: function() {
        return {
            content: this.getContent()
        }
    },
    watch: {
        'focus': function() {
            if (this.focus) {
                this._editor.focus();
            }
        },
        'lang': function() {
            this.initEditor();
        },
        'minRows': function() {
            this.initEditor();
        },
        'maxRows': function() {
            this.initEditor();
        },
        'disabled': function() {
            this.setDisabled(this.disabled);
        },
        'contextComponent': function () {
            if (!this._editor) {
                return;
            }
            if (this.getLang() === 'javascript' && this.contextComponent) {
                this._editor.completers = [new JavascriptCompleter(
                    this.contextComponent.target?.viewModel,
                    this.contextComponent.target?.dataModel,
                    this.contextComponent.showActions,
                    this.contextComponent.targetKeyword,
                    this.contextComponent.additionalKeywords
                )];
            }
        },
        'contextObject': function () {
            if (!this._editor) {
                return;
            }
            if (this.getContent() !== this._editor.getValue()) {
                this._editor.setValue(this.getContent(), 1);
            }
        }
    },
    mounted: function() {
        this.initEditor();
    },
    methods: {
        focusEditor() {
            if (this._editor) {
                this._editor.focus();
            }
        },
        getContent() {
            if (this.formula) {
                return this.value.slice(1);
            } else {
                return this.value === undefined ? '' : '' + this.value;
            }
        },
        getLang() {
            return this.lang || 'javascript';
        },
        setDisabled(disabled) {
            if (this._editor) {
                if (disabled) {
                    this._editor.setOptions({
                        readOnly: true,
                        highlightActiveLine: false,
                        highlightGutterLine: false
                    });
                    this._editor.container.style.opacity = 0.6;
                } else {
                    this._editor.setOptions({
                        readOnly: false,
                        highlightActiveLine: true,
                        highlightGutterLine: true
                    });
                    this._editor.container.style.opacity = 1;
                }
            }
        },
        initEditor() {
            try {
                if (this._editor) {
                    try {
                        this._editor.destroy();
                        this._editor = undefined;
                    } catch (e) {
                        console.error('editor', e);
                    }
                }
                Vue.nextTick(() => {
                    let target = this.$refs['target'];
                    this._editor = ace.edit(target, {
                        mode: "ace/mode/" + this.getLang(),
                        selectionStyle: "text"
                    });
                    this._editor.setOptions({
                        autoScrollEditorIntoView: true,
                        copyWithEmptySelection: true,
                        enableBasicAutocompletion: true,
                        enableSnippets: false,
                        enableLiveAutocompletion: true,
                        showLineNumbers: false,
                        minLines: this.minRows ? this.minRows : 1,
                        maxLines: this.maxRows ? this.maxRows : 10
                    });
                    this._editor.renderer.setScrollMargin(5, 18);

                    this.setDisabled(this.disabled);
                    this._editor.session.setValue(this.getContent());
                    this._editor.on('change', () => {
                        this.onTypeIn();
                    });
                    if (this.getLang() === 'javascript' && this.contextComponent) {
                        this._editor.session.$worker.send("changeOptions", [{asi: true}]);
                        this._editor.completers = [new JavascriptCompleter(
                            this.contextComponent.target?.viewModel,
                            this.contextComponent.target?.dataModel,
                            this.contextComponent.showActions,
                            this.contextComponent.targetKeyword,
                            this.contextComponent.additionalKeywords
                        )];
                    }
                    if (this.focus) {
                        this._editor.focus();
                    }
                });
            } catch (e) {
                console.error('error building code editor', e);
            }

        },
        onTypeIn() {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                this.timeout = undefined;
                this.content = this._editor.getValue();
                this.$emit('input', this.formula ? '=' + this.content : this.content)
            }, 200);
        }
    }

});

class JavascriptCompleter {

    constructor(viewModel, dataModel, showActions, targetKeyword, additionalKeywords) {
        this.showActions = showActions;
        this.dataModel = dataModel;
        this.viewModel = viewModel;
        this.targetKeyword = targetKeyword || 'this';
        this.addtionalKeywords = additionalKeywords || [];
    }

    splitRegex = /[^a-zA-Z_0-9\$\-\u00C0-\u1FFF\u2C00-\uD7FF\w'"`\.]/;
    stringSplitRegex = /[^a-zA-Z_0-9\$\-\u00C0-\u1FFF\u2C00-\uD7FF\w'"`\.]/;

    getWordIndex(doc, pos) {
        const textBefore = doc.getTextRange(ace.Range.fromPoints({row: 0, column: 0}, pos));
        return textBefore.split(javascriptCompleter.splitRegex).length - 1;
    }

    isQuote(expression) {
        return expression === "'" || expression === '"' || expression === '`';
    }

    isStartingWithQuote(expression) {
        return expression[0] === "'" || expression[0] === '"' || expression[0] === '`';
    }

    getEndQuote(expression) {
        if (["'", '"', '`'].indexOf(expression.substring(expression.length - 1)) > -1) {
            return expression.substring(expression.length - 1);
        } else {
            return undefined;
        }
    }

    getStartQuote(expression) {
        if (["'", '"', '`'].indexOf(expression.substring(0, 1)) > -1) {
            return expression.substring(0, 1);
        } else {
            return undefined;
        }
    }

    isInString(expressions, index) {
        let openedQuote = undefined;
        for (let i = 0; i <= index; i++) {
            if (this.isQuote(expressions[i])) {
                if (!openedQuote) {
                    openedQuote = expressions[i];
                } else if (openedQuote === expressions[i]) {
                    openedQuote = undefined;
                }
            } else {
                let startQuote = this.getStartQuote(expressions[i]);
                if (startQuote) {
                    if (!openedQuote) {
                        openedQuote = startQuote;
                    } else if (openedQuote === startQuote) {
                        openedQuote = undefined;
                    }
                }
                let endQuote = this.getEndQuote(expressions[i]);
                if (endQuote) {
                    if (!openedQuote) {
                        openedQuote = endQuote;
                    } else if (openedQuote === endQuote) {
                        openedQuote = undefined;
                    }
                }
            }
        }
        return !!openedQuote;
    }

    isEndOfExpression(expressions, index) {
        if (index < 1) {
            return true;
        } else {
            if (["'", '"', '`'].indexOf(expressions[index].substring(expressions[index].length - 1)) > -1) {
                return true;
            }

        }
    }

    getCompletionsForTargetObject(targetObject) {
        if (targetObject && targetObject.constructor) {
            return Object.getOwnPropertyNames(targetObject.constructor.prototype)
                .filter(propertyName => propertyName !== 'constructor')
                .map(propertyName =>
                    ({
                        text: typeof targetObject[propertyName] === 'function' ? propertyName + '()' : propertyName,
                        value: propertyName,
                        meta: typeof targetObject[propertyName] === 'function' ? 'method' : 'field'
                    })
                );
        } else {
            return Object.keys(targetObject)
                .map(key =>
                    ({
                        text: typeof targetObject[key] === 'function' ? key + '()' : key,
                        value: key,
                        meta: typeof targetObject[key] === 'function' ? 'function' : 'field'
                    })
               );
        }
    }

    getCompletions(editor, session, pos, prefix, callback) {
        try {
            let textBefore = session.getTextRange(ace.Range.fromPoints({row: pos.row, column: 0}, pos));
            let expressionsBefore = textBefore.split(this.splitRegex);

            let i = expressionsBefore.length - 1;

            let wordList = [];

            if (this.isInString(expressionsBefore, i)) {
                // editor is in string
                if (expressionsBefore[i - 1] === '$d' || expressionsBefore[i - 1] === '$c' || expressionsBefore[i - 1] === '$v') {
                    wordList = components.getComponentModels()
                        .filter(viewModel => !components.hasGeneratedId(viewModel))
                        .map(viewModel => ({
                            value: viewModel.cid,
                            text: viewModel.cid,
                            meta: 'component'
                        }));
                }
                if (expressionsBefore[i - 1] === '$t') {
                    const i18n = $c('shared')['i18n'];
                    if (i18n) {
                        Object.keys(i18n).forEach(key => {
                            Object.keys(i18n[key]).forEach(key => {
                                if (!wordList.includes(key)) {
                                    wordList.push({
                                        value: key,
                                        text: key,
                                        meta: 'i18n'
                                    });
                                }
                            })
                        });
                    }

                }

            } else {

                let currentExpressionSplit = expressionsBefore[i].split(".");

                console.info("editor autocomplete (currentExpressionSlit)", currentExpressionSplit);

                if (currentExpressionSplit.length === 1) {
                    wordList = [
                        {
                            value: "$collab",
                            text: "$collab",
                            meta: "static"
                        },
                        {
                            value: "$tools",
                            text: "$tools",
                            meta: "static"
                        },
                        {
                            value: this.targetKeyword,
                            text: this.targetKeyword,
                            meta: "component"
                        },
                        {
                            value: "$d",
                            text: "$d(identifier)",
                            meta: "function"
                        },
                        {
                            value: "$c",
                            text: "$c(identifier)",
                            meta: "function"
                        },
                        {
                            value: "$v",
                            text: "$v(identifier)",
                            meta: "function"
                        },
                        {
                            value: "$t",
                            text: "$t(identifier)",
                            meta: "function"
                        },
                        {
                            value: "XS",
                            text: "XS",
                            meta: "constant"
                        },
                        {
                            value: "SM",
                            text: "SM",
                            meta: "constant"
                        },
                        {
                            value: "MD",
                            text: "MD",
                            meta: "constant"
                        },
                        {
                            value: "LG",
                            text: "LG",
                            meta: "constant"
                        },
                        {
                            value: "XL",
                            text: "XL",
                            meta: "constant"
                        },
                        {
                            value: "XXL",
                            text: "XXL",
                            meta: "constant"
                        },
                        {
                            value: "PRIMARY",
                            text: "PRIMARY",
                            meta: "constant"
                        },
                        {
                            value: "SECONDARY",
                            text: "SECONDARY",
                            meta: "constant"
                        },
                        {
                            value: "SUCCESS",
                            text: "SUCCESS",
                            meta: "constant"
                        },
                        {
                            value: "INFO",
                            text: "INFO",
                            meta: "constant"
                        },
                        {
                            value: "WARNING",
                            text: "WARNING",
                            meta: "constant"
                        },
                        {
                            value: "DANGER",
                            text: "DANGER",
                            meta: "constant"
                        },
                        {
                            value: "LIGHT",
                            text: "LIGHT",
                            meta: "constant"
                        },
                        {
                            value: "DARK",
                            text: "DARK",
                            meta: "constant"
                        },
                        {
                            value: "DARK_MODE",
                            text: "DARK_MODE",
                            meta: "constant"
                        },
                        {
                            value: "Math",
                            text: "Math",
                            meta: "static"
                        },
                        {
                            value: "JSON",
                            text: "JSON",
                            meta: "static"
                        },
                        {
                            value: "moment",
                            text: "moment(date) => moment",
                            meta: "function"
                        },
                        {
                            value: "parseInt",
                            text: "parseInt(string, radix) => number",
                            meta: "function"
                        },
                        {
                            value: "parseFloat",
                            text: "parseFloat(string) => number",
                            meta: "function"
                        },
                        {
                            value: "isNaN",
                            text: "isNaN(number) => boolean",
                            meta: "function"
                        },
                        {
                            value: "isFinite",
                            text: "isFinite(number) => boolean",
                            meta: "function"
                        },
                        {
                            value: "decodeURI",
                            text: "decodeURI(encodedURI) => string",
                            meta: "function"
                        },
                        {
                            value: "decodeURIComponent",
                            text: "decodeURIComponent(encodedURIComponent)",
                            meta: "function"
                        },
                        {
                            value: "encodeURI",
                            text: "encodeURI(uri) => string",
                            meta: "function"
                        },
                        {
                            value:  "encodeURIComponent",
                            text: "encodeURIComponent(uriComponent) => string",
                            meta: "function"
                        },
                        {
                            value: "escape",
                            text: "escape(string) => string",
                            meta: "function"
                        },
                        {
                            value: "unescape",
                            text: "unescape(string) => string",
                            meta: "function"
                        },
                        {
                            value: "alert",
                            text: "alert(message)",
                            meta: "function"
                        },
                        {
                            value: "prompt",
                            text: "prompt(message) => string",
                            meta: "function"
                        },
                        {
                            value: "confirm",
                            text: "confirm(message) => boolean",
                            meta: "function"
                        }
                    ];
                    if (this.addtionalKeywords && Array.isArray(this.addtionalKeywords)) {
                        for (const additionalKeyword of this.addtionalKeywords) {
                            wordList.push({
                                value: additionalKeyword,
                                text: additionalKeyword,
                                meta: "keyword"
                            });
                        }
                    }
                }

                if (currentExpressionSplit.length === 2) {
                    if (currentExpressionSplit[0] === this.targetKeyword) {
                        wordList = ["dataModel", "viewModel", "screenWidth", "screenHeight"];
                        if (this.showActions) {
                            wordList.push(...components.getComponentOptions(this.viewModel.cid).methods.actionNames(this.viewModel));
                        }
                        wordList.push(...components.getComponentOptions(this.viewModel.cid).methods.statelessActionNames(this.viewModel))
                    } else {
                        switch (currentExpressionSplit[0]) {
                            case '$tools':
                                wordList = $tools.FUNCTION_DESCRIPTORS;
                                break;
                            case '$collab':
                                wordList = $collab.FUNCTION_DESCRIPTORS;
                                break;
                            case 'Math':
                                wordList = Object.getOwnPropertyNames(Math).map(key => ({
                                    value: key,
                                    text: key + typeof Math[key] === 'function' ? $tools.functionParams(Math[key]) : '',
                                    meta: typeof Math[key] === 'function' ? 'function' : 'static'
                                }));
                                break;
                            case 'JSON':
                                wordList = Object.getOwnPropertyNames(JSON).map(key => ({
                                    value: key,
                                    text: key + typeof JSON[key] === 'function' ? $tools.functionParams(JSON[key]) : '',
                                    meta: typeof JSON[key] === 'function' ? 'function' : 'static'
                                }));
                                break;
                            case '':

                                if (i >= 2) {
                                    switch (expressionsBefore[i - 2]) {
                                        case '$c':
                                            wordList = ["dataModel", "viewModel", "screenWidth", "screenHeight"];
                                        case '$v':
                                        case '$d':
                                            let target = undefined;
                                            try {
                                                let cid = $c(this.viewModel.cid).$eval("=" + expressionsBefore[i - 1]);
                                                switch (expressionsBefore[i - 2]) {
                                                    case '$c':
                                                        target = $c(cid);
                                                        if (this.showActions) {
                                                            wordList.push(...components.getComponentOptions(cid).methods.actionNames(target.viewModel))
                                                        }
                                                        wordList.push(...components.getComponentOptions(cid).methods.statelessActionNames(target.viewModel));
                                                        break;
                                                    case '$d':
                                                        target = $d(cid);
                                                        wordList.push(...this.getCompletionsForTargetObject(target));
                                                        break;
                                                    case '$v':
                                                        target = $v(cid);
                                                        wordList.push(...this.getCompletionsForTargetObject(target));
                                                        break;
                                                }
                                            } catch (e) {
                                                console.error('editor', e);
                                            }
                                            break;
                                    }

                                }
                                break;
                        }
                    }
                }

                if (currentExpressionSplit.length === 3) {
                    if (currentExpressionSplit[0] === this.targetKeyword) {
                        switch (currentExpressionSplit[1]) {
                            case 'dataModel':
                                if (this.dataModel) {
                                    wordList.push(...Object.keys(this.dataModel));
                                }
                                break;
                            case 'viewModel':
                                wordList.push(...Object.keys(this.viewModel));
                                break;
                        }
                    }
                }

            }

            console.info("editor autocomplete word list", wordList);

            callback(null, wordList.filter(word => typeof word === 'string' || word.value).map(word => {
                if (typeof word === 'string') {
                    return {
                        caption: word,
                        value: word,
                        meta: "static"
                    }
                } else {
                    return {
                        caption: word.text,
                        value: word.value,
                        meta: word.meta ? word.meta : "function",
                        completer: {
                            insertMatch: (editor, data) => {
                                try {
                                    let pos = editor.getCursorPosition();
                                    let textBefore = editor.getSession().getTextRange(ace.Range.fromPoints({
                                        row: pos.row,
                                        column: 0
                                    }, pos));
                                    let expressionsBefore = textBefore.split(this.splitRegex);
                                    let currentExpressionSplit = expressionsBefore[expressionsBefore.length - 1].split(".");
                                    let beginning = currentExpressionSplit[currentExpressionSplit.length - 1];
                                    //console.info('before complete', currentExpressionSplit, beginning, this.isQuote(beginning));

                                    if (beginning.length > 0 && !this.isQuote(beginning)) {
                                        if (this.isStartingWithQuote(beginning)) {
                                            const range = new ace.Range(pos.row, pos.column - beginning.length + 1, pos.row, pos.column);
                                            //console.info("REMOVING RANGE", range);
                                            editor.getSession().getDocument().remove(range);
                                        } else {
                                            //console.info("REMOVING WORD LEFT");
                                            editor.removeWordLeft();
                                        }
                                    }
                                    editor.insert(data.value);
                                    if (data.meta === 'function') {
                                        editor.insert("()");
                                        pos = editor.getCursorPosition();
                                        editor.gotoLine(pos.row + 1, pos.column - 1);
                                    }
                                } catch (e) {
                                    console.error("editor insert match error", e);
                                }
                            }
                        }
                    };
                }
            }));


        } catch (e) {
            console.error("editor error", e);
        }


    }

}

Vue.component('formula-editor', {
    template: `
        <div class="w-100">

            <b-input-group v-if="!isFormulaMode()" class="flex-grow-1 w-100">
                <b-form-input :size="size || 'sm'"
                    class="flex-grow-1"
                    :placeholder="placeholder"
                    v-model="value" type="text"
                    @input="onTypeIn()"
                />
                <b-input-group-append>
                  <b-button v-if="value !== undefined" size="sm" variant="danger" @click="value = undefined">x</b-button>
                  <b-button :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(true)"><em>f(x)</em></b-button>
                </b-input-group-append>
            </b-input-group>

            <b-input-group v-else>
                <b-input-group-prepend>
                  <b-input-group-text :size="size || 'sm'">=</b-input-group-text>
                </b-input-group-prepend>
                <div :ref="'__editor'" @click="focusEditor" style="flex-grow: 1; top: 0; right: 0; bottom: 0; left: 0;">
                </div>
                <b-input-group-append>
                  <b-button :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(false)"><em><del>f(x)</del></em></b-button>
                </b-input-group-append>
            </b-input-group>

        </div class="w-100">
    `,
    props: ['initValue', 'formulaButtonVariant', 'placeholder', 'rows', 'maxRows', 'size'],
    data: function () {
        return {
            editor: false,
            edited: false,
            value: undefined
        }
    },
    watch: {
        initValue: function () {
            if (this.value !== this.initValue) {
                this.value = this.initValue;
                this.initEditor();
            }
        },
        value: function() {
            this.onTypeIn();
        }
    },
    mounted() {
        this.value = this.initValue;
        this.initEditor();
    },
    beforeDestroy() {
        if (this.edited) {
            this.$emit('edited', this.value);
            this.edited = false;
        }
    },
    methods: {
        isFormulaMode() {
            return this.value ? this.value.startsWith('=') : false;
        },
        focusEditor() {
            console.info('focus');
            if (this._editor) {
                this._editor.focus();
            }
        },
        setFormulaMode(formulaMode) {
            if (this.value === undefined) {
                this.value = '';
            }
            if (formulaMode) {
                if (!this.value.startsWith('=')) {
                    this.value = '=`' + this.value + '`';
                }
            } else {
                if (this.value.startsWith('=')) {
                    this.value = this.value.slice(1);
                }
            }
            this.initEditor();
        },
        initEditor(focus) {
            if (this.isFormulaMode()) {

                this.editor = true;
                let lang = 'javascript';

                if (this._editor) {
                    try {
                        this._editor.destroy();
                    } catch (e) {
                        console.error('editor', e);
                    }
                }

                Vue.nextTick(() => {
                    try {
                        let target = this.$refs['__editor'];
                        if (!target || target.tagName != 'DIV') {
                            return;
                        }
                        this._editor = ace.edit(target, {
                            mode: "ace/mode/" + lang,
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
                        this._editor.renderer.setScrollMargin(5, 18);
                        // this._editor.setTheme("ace/theme/monokai");
                        //this._editor.session.setMode("ace/mode/javascript");

                        if (this.isFormulaMode()) {
                            this._editor.session.setValue(this.value.slice(1));
                        }
                        this._editor.on('change', () => {
                            this.value = '=' + this._editor.getValue();
                            //this.onTypeIn();
                        });

                        if (lang === 'javascript') {
                            this._editor.session.$worker.send("changeOptions", [{asi: true}]);
                            this._editor.completers = [new JavascriptCompleter(this.viewModel, this.dataModel, true)];
                        }
                        if (focus) {
                            this._editor.focus();
                        }
                    } catch (e) {
                        console.error('error building editor', e);
                        this.editor = false;
                    }
                });
            } else {
                this.editor = false;
            }
        },
        onTypeIn() {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                this.timeout = undefined;
                this.$emit('edited', this.value);
            }, 200);
        }
    }
});
