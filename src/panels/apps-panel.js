    Vue.component('apps-panel', {
        template: `
            <div class="d-flex flex-row flex-wrap" style="justify-content: center">
              <b-card v-for="app of apps" size="sm"
                :img-src="app.icon"
                :img-alt="app.name"
                img-top
                class="m-2 app-card"
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
        props: ['apps'],
        methods: {
            open: function (app) {
                const url = window.location.origin + window.location.pathname + "?" + (parameters.get('user') ? 'user=' + parameters.get('user') + '&' : '') + 'src=' + app.url;
                window.location = url;
            }
        }
    });
