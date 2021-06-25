    Vue.component('apps-panel', {
        template: `
            <div class="d-flex flex-row flex-wrap" style="justify-content: center">
              <b-card v-for="app of apps"
                :title="app.name"
                :img-src="app.icon"
                :img-alt="app.name"
                img-top
                style="max-width: 15rem;"
                class="m-2"
              >
                <b-card-text>
                  {{ app.description }}
                </b-card-text>
            
                <b-button variant="primary" @click="open(app)">Open</b-button>
              </b-card>            
            </div>

        `,
        props: ['apps'],
        methods: {
            open: function (app) {
                const url = window.location.origin + window.location.pathname + "?src=" + app.url;
                window.location = url;
            }
        }
    });
