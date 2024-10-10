<template>
    <Head :title="title()">
        <meta name="description" :content="description()"/>
        <meta v-if="status > 499" http-equiv="refresh" content="5">
    </Head>
    <v-container class="d-flex align-center flex-column" height="100vh">
        <v-empty-state icon="mdi-alert-octagon-outline" :title="title()">
            <template #text>
                {{description()}}
                <p v-if="status > 499">The page will refresh in 5 seconds.</p>
            </template>
            <template #media>
                <v-icon color="surface-variant"/>
            </template>
            <template #headline>
                <div class="text-h4">
                    Whoops, {{status}}
                </div>
            </template>
            <template #actions>
                <v-btn v-if="canHistoryBackMove" color="primary" variant="tonal" @click="$router.go(-1)">Go Back</v-btn>
                <v-btn color="primary" variant="tonal" @click="goHome">Go Home</v-btn>
            </template>
        </v-empty-state>
    </v-container>
</template>
<script>

import { Head } from '@inertiajs/vue3';
import {VEmptyState} from '~vuetify/lib/components/VEmptyState';
const errorCodesMap = {
    403: {
        title: 'Forbidden',
        description: 'Sorry, you are forbidden from accessing this page.',
    },
    404: {
        title: 'Page Not Found',
        description: 'Sorry, the page you are looking for could not be found.',

    },
    419: {
        title: 'Session Expired',
        description: 'Your session has expired. Please login again to continue.',
    },
    429: {
        title: 'Too Many Requests',
        description: 'You have sent too many requests in a short period of time. Please try again later.',

    },
    500: {
        title: 'Server Error',
        description: 'Sorry, there was an error on the server. Please try again later.',
    },
    503: {
        title: 'Service Unavailable',
        description: 'Sorry, we are doing some maintenance. Please check back soon.',
    },
    default: {
        title: 'Error',
        description: 'Sorry, an error occurred. Please try again later.'
    }
};

export default {
    name: "Error",
    title: 'Error',
    components: {Head, VEmptyState},
    props: {
        status: Number,
    },
    computed: {
        canHistoryBackMove: {
            get: () => !!window.history.state.position
        }
    },
    methods: {
        goHome() {
            this.$inertia.get(this.route('models.index'));
        },
        description() {
            return `${errorCodesMap[this.status]?.description ?? errorCodesMap.default.description}`
        },
        title() {
            return `${this.status}: ${errorCodesMap[this.status]?.title ?? errorCodesMap.default.title}`
        }
    },
}
</script>

<style scoped>

</style>
