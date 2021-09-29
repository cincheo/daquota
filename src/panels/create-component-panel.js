    Vue.component('create-component-panel', {
        template: `
            <div>
                  <div class="accordion" role="tablist">
                    <b-card v-for="category of categories()" no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button @click="collapse(category)" block variant="none" size="sm">{{ labelForCategory(category) }}</b-button>
                      </b-card-header>
                      <b-collapse v-model="collapsed[category]" role="tabpanel">
                        <b-card-body>
                            <component-tool v-for="tool of tools(category)" 
                                :type="tool.type" 
                                :label="tool.label" 
                                :category="category" 
                                @componentCreated="componentCreated" 
                                @componentNotCreated="componentNotCreated"
                            ></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                  </div>
            </div>

        `,
        props: ['initialCollapse'],
        mounted: function() {
            if (this.initialCollapse === 'all') {
                let collapsed = {};
                for (let category of this.categories()) {
                    collapsed[category] = true;
                }
                this.collapsed = collapsed;
            }
        },
        data: function() {
            return {
                alertMessage: undefined,
                alertVariant: "success",
                collapsed: {},
                componentTools: ide.componentTools
            }
        },
        methods: {
            categories() {
                return [...new Set(this.componentTools.map(tool => tool.category))];
            },
            tools(category) {
                return this.componentTools.filter(tool => tool.category === category);
            },
            labelForCategory(category) {
                return $tools.kebabToLabelText(category);
            },
            collapse(id) {
                if (this.collapsed[id]) {
                    this.collapsed[id] = false;
                } else {
                    this.collapsed[id] = true;
                }
            },
            componentCreated: function (event) {
                this.$bvToast.toast("Successfully added " + Tools.camelToLabelText(event, true), {
                    title: `Component added`,
                    variant: 'success',
                    autoHideDelay: 2000,
                    solid: false
                });
                this.$emit("componentCreated", event);
            },
            componentNotCreated: function (event) {
                console.error("Cannot add component because no target location is selected in the page");
                // this.$bvToast.toast("Cannot add component because no target location is selected in the page", {
                //     title: `Component not added`,
                //     variant: 'warning',
                //     autoHideDelay: 3000,
                //     solid: false
                // });
            }
        }
    });
