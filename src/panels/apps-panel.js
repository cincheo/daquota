    Vue.component('apps-panel', {
        template: `
            <div class="d-flex flex-row flex-wrap" style="justify-content: center; gap: 10px">
              <b-card v-for="app of apps" size="sm"
                :img-src="app.icon"
                :img-alt="app.name"
                img-top
                class="mb-2 mt-2 app-card"
              >
              <template #header>
                <h6 class="mb-0">{{ app.name }}<b-button variant="primary" @click="open(app)" size="sm" pill class="float-right">Open</b-button></h6>
              </template>
                <b-card-text>
                  {{ app.description }}
                </b-card-text>
              </b-card>            
            </div>

        `,
        props: ['apps', 'basePath'],
        methods: {
            open: function (app) {
                const url = this.basePath + (this.basePath.indexOf('?') > -1 ? '&' : '?') + 'src=' + app.url;
                window.location = url;
            }
        }
    });
