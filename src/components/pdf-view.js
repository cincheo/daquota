Vue.component('pdf-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
           <iframe
              ref="viewer"
              :key="'iframe-' + viewModel.page"
              :src="pdfUrl"
              :class="$eval(viewModel.class, null)"
              :style="$eval(viewModel.style, null)"
              style="min-height: 30rem"
              :draggable="$eval(viewModel.draggable, false) ? true : false" 
              v-on="boundEventHandlers({'click': onClick})"
            />
        </div>
    `,
    data: function() {
        return {
            currentPage: 1
        }
    },
    mounted: function() {
        this.currentPage = this.viewModel ? this.viewModel.page : 1;
    },
    computed: {
        pdfUrl: function() {
            if (!this.viewModel) {
                console.info("empty pdfUrl");
                return '';
            }
            let url = this.$eval(this.viewModel.documentPath);

            url += '#page=' + this.$eval(this.viewModel.page, 1);
            if (this.viewModel.zoom) {
                url += '&zoom=' + this.$eval(this.viewModel.zoom);
            }
            if (this.viewModel.view) {
                url += '&view=' + this.$eval(this.viewModel.view);
            }
            if (this.viewModel.viewrect) {
                url += '&viewrect=' + this.$eval(this.viewModel.viewrect);
            }
            if (this.viewModel.scrollbar !== undefined) {
                url += '&scrollbar=' + (this.$eval(this.viewModel.scrollbar) ? 1 : 0);
            }
            if (this.viewModel.toolbar !== undefined) {
                url += '&toolbar=' + (this.$eval(this.viewModel.toolbar) ? 1 : 0);
            }
            if (this.viewModel.messages !== undefined) {
                url += '&messages=' + (this.$eval(this.viewModel.messages) ? 1 : 0);
            }
            if (this.viewModel.navpanes !== undefined) {
                url += '&navpanes=' + (this.$eval(this.viewModel.navpanes) ? 1 : 0);
            }
            if (this.viewModel.statusbar !== undefined) {
                url += '&statusbar=' + (this.$eval(this.viewModel.statusbar) ? 1 : 0);
            }
            if (this.viewModel.search) {
                url += '&search=' + this.$eval(this.viewModel.search);
            }
            console.info("pdfUrl", url);
            if (this.currentPage == this.viewModel.page) {
                setTimeout(() => {
                    console.info('force reload', this.$refs['viewer']);
                    this.$refs['viewer'].contentDocument.location.reload();
                }, 100);
            } else {
                this.currentPage = this.viewModel.page;
            }
            return url;
        }
    },
    methods: {
        propNames() {
            return [
                "cid",
                "documentPath",
                "page",
                "view",
                "zoom",
                "toolbar",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                disabled: {
                    type: 'checkbox',
                    editable: true
                },
                zoom: {
                    type: 'text',
                    editable: true,
                    description: 'scale, [left, top]. Sets the zoom and scroll factors, using float or integer values. For example, a scale value of 100 indicates a zoom value of 100%. Scroll values left and top are in a coordinate system where 0,0 represents the top left corner of the visible page, regardless of the document rotation'
                },
                view: {
                    type: 'select',
                    editable: true,
                    options: ['', 'Fit', 'FitH', 'FitV', 'FitB', 'FitBH', 'FitBV'],
                    description: 'Sets the view of the displayed page'
                },
                viewrect: {
                    label: 'View rect',
                    type: 'text',
                    editable: true,
                    description: '<pre>left, top, width, height</pre>. Sets the view rectangle, using float or integer values in a coordinate system where 0,0 represents the top left corner of the visible page, regardless of the document rotation'
                },
                scrollbar: {
                    type: 'checkbox',
                    editable: true,
                    description: 'Turns scrollbars on or off'
                },
                toolbar: {
                    type: 'checkbox',
                    editable: true,
                    description: 'Turns the toolbar on or off'
                },
                statusbar: {
                    label: 'Status bar',
                    type: 'checkbox',
                    editable: true,
                    description: 'Turns the status bar on or off'
                },
                messages: {
                    type: 'checkbox',
                    editable: true,
                    description: 'Turns the document message bar on or off'
                },
                navpanes: {
                    label: 'Navigation panels',
                    type: 'checkbox',
                    editable: true,
                    description: 'Turns the navigation panes and tabs on or off'
                },
                search: {
                    type: 'text',
                    editable: true,
                    description: 'Search for the given words (space-separated) in the document'
                }
            }
        }

    }
});


