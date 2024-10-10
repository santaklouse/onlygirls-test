import './bootstrap.js'
import { createApp, h, computed } from 'vue';
import { ZiggyVue } from 'ziggy';
import { Ziggy } from './ziggy.js';
import { createVuetify } from 'vuetify';
import { createInertiaApp, router, usePage } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import VueTinder from 'vue-tinder';

import { createRouter, createWebHistory } from 'vue-router'
import Models from "@pages/Models.vue";

import { md3 } from 'vuetify/blueprints'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles';
import '@/css/app.scss'

const routes = [
    { path: '/models/:modelId(\\d+)?', name: 'models', component: Models }
];

const vuetify = createVuetify({
    blueprint: md3,
    theme: {
        defaultTheme: 'light',
        isDark: false,
        disabled: false,
        options: {
            variations: true
        },
        themes: {
            dark: {
                colors: {
                    accent: "#FF4081",
                    error: "#FF5252",
                    info: "#2196F3",
                    primary: "#2196F3",
                    secondary: "#424242",
                    success: "#4CAF50",
                    warning: "#FB8C00",

                }
            },
            light: {
                // dark: false,
                colors: {
                    accent: "#82B1FF",
                    error: "#FF5252",
                    info: "#2196F3",
                    primary: "#00aff0",
                    secondary: "#424242",
                    success: "#4CAF50",
                    warning: "#FB8C00",
                    'on-surface': '#00aff0',
                }
            },
        },
    },
});
const vueRouter = createRouter({
    history: createWebHistory(),
    mode: 'history',
    routes,
});
const appName = computed(() => usePage().props.appName);

createInertiaApp({
    title(title, ...args) {
        console.log(title, args,`title: ${title} - ${appName.value}`);
        return `${title} - ${appName.value}`
    },
    async resolve(name) {
        return await resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue', { eager: true }));
    },
    setup({ el, App, props, plugin }) {
        createApp({
            data: () => ({
                props,
                plugin
            }),
            render: () => h(App, props)
        })
            .use(plugin)
            .use(vuetify)
            .use(VueTinder)

            .use(vueRouter)
            .use(ZiggyVue, Ziggy)

            .mount(el);
    },
});
