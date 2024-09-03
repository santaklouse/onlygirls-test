import './bootstrap';
import { createApp, h } from 'vue';
import { createVuetify } from 'vuetify';
import { createInertiaApp } from '@inertiajs/inertia-vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import '../css/app.scss';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/_styles.scss'
import 'vuetify/_tools.scss'

import 'bootstrap/scss/bootstrap.scss'

createInertiaApp({
    resolve: name => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        const vuetify = createVuetify({
            components,
            directives,
            icons: {
                defaultSet: 'mdi',
                aliases,
                sets: {
                    mdi,
                }
            }
        });

        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(vuetify)
            .mount(el);
    },
});
