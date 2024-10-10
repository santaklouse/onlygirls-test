<template>
    <Head>
        <slot name="head"/>
    </Head>

    <v-layout class="layout" ref="app" :class="{mobile: $vuetify.display.mobile, 'dark-theme': $vuetify.theme.dark}">
        <v-responsive class="border rounded v-application">
            <v-theme-provider :theme="$vuetify.theme.dark ? 'dark' : 'light'">
                <v-sheet
                    ref="app"
                    class="d-flex align-center justify-center flex-column position-relative h-screen"
                >
                    <v-app-bar class="px-3" absolute collapse flat :elevation="3" compact>
                        <template #append>
                            <v-btn
                                tabindex="-1"
                                name="theme-selector"
                                aria-label="Theme switch"
                                slim
                                icon
                                @click="$vuetify.theme.dark = !$vuetify.theme.dark"
                            >
                                <v-icon>{{!!$vuetify.theme.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'}}</v-icon>
                            </v-btn>
                        </template>
                    </v-app-bar>

                    <v-main class="d-flex flex-column align-center justify-center">
                        <slot name="default"/>
                    </v-main>

                    <v-footer
                        name="footer" app
                        class="no-bg d-inline-flex w-auto justify-content-center align-items-center flex-column mt-auto position-fixed bottom-0 left-auto align-self-center flex-grow-0 flex-shrink-0"
                    >
                        <slot name="footer"/>
                    </v-footer>
                </v-sheet>
            </v-theme-provider>
        </v-responsive>
    </v-layout>

</template>

<script>
import {Head} from '@inertiajs/vue3';
export default {
    name: "MainLayout",
    components: {
        Head,
    },
    data: () => ({
        theme: null,
    }),
    created() {
        this.$watch(
            () => this.$vuetify.theme.dark,
            (newVal) => {
                localStorage.setItem('theme', newVal ? 'dark' : 'light')
            }
        );
        this.theme = localStorage.getItem('theme') || 'light';
        this.$vuetify.theme.dark = this.theme === 'dark';
    },
}
</script>

<style lang="scss">
.v-main {
    max-height: calc(100dvh - 96px);
}

footer {
    left: auto !important;
}
</style>
