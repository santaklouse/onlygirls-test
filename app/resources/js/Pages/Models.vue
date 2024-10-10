<template>
    <MainLayout v-if="models.length">
        <template #head>
            <title>Models</title>
            <link v-for="(item, index) in queue"
                  rel="preload"
                  fetchpriority="high"
                  :href="item.header"
                  as="image"
                  type="image/jpeg"
                  :media="`(min-width: 761px) and (max-width: ${item.header_size.width}px)`"
            />
        </template>
        <template #default>
            <v-sheet class="profile-card-wrapper mt-5 position-static" color="transparent" rounded="lg">
                <Tinder
                    ref="tinder"
                    key-name="username"
                    v-model:queue="queue"
                    :max="1"
                    :offset-y="10"
                    sync
                    @submit="onSubmit"
                >
                    <template #default="{ data }">
                        <TinderCard
                            ref="tinder-card"
                            :item="data"
                        >
                        </TinderCard>
                    </template>
                    <template #like>
                        <v-icon class="ma-2 like-pointer" color="green-lighten-2" icon="mdi-heart-circle-outline" size="x-large"></v-icon>
                    </template>
                    <template #nope>
                        <v-icon class="ma-2 nope-pointer" color="red-lighten-2" icon="mdi-close-circle-outline" size="x-large"></v-icon>
                    </template>
                </Tinder>
            </v-sheet>
        </template>
        <template #footer>
            <div class="actions bg-transparent">
                <v-btn
                    variant="flat"
                    class="ma-2 d-none"
                    color="black-lighten-2"
                    icon="mdi-undo-variant"
                    size="x-large"
                    aria-label="Previous"
                    tabindex="-1"
                    @click="decide('rewind')"
                    elevation="24"
                ></v-btn>
                <v-btn
                    variant="flat"
                    class="ma-2"
                    color="red-lighten-2"
                    icon="mdi-thumb-down"
                    size="x-large"
                    aria-label="Dislike"
                    tabindex="-1"
                    @click="decide('nope')"
                    elevation="24"
                ></v-btn>
                <v-btn
                    variant="flat"
                    class="ma-2"
                    rounded-circle
                    icon="mdi-heart"
                    size="x-large"
                    aria-label="Like"
                    tabindex="-1"
                    @click="decide('like')"
                    elevation="24"
                ></v-btn>
            </div>
        </template>
    </MainLayout>
    <MainLayout v-else>
        <NoMoreModels></NoMoreModels>
    </MainLayout>
    <AskRedirectToChatDialog
        v-model="openModal"
        :data="redirectToGirl"
        @dismiss="closeDialog"
        @agree="redirectToProfile"
    />
</template>

<script>

import { computed } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import axios from 'axios';
const page = usePage();
const user = computed(() => page.props.modelId)
const pageModelId = computed(() => page.props.modelId)

import Tinder from "vue-tinder";
import TinderCard from "@components/TinderCard.vue";
import NoMoreModels from "@components/NoMoreModels.vue";
import AskRedirectToChatDialog from "@components/AskRedirectToChatDialog.vue";
import MainLayout from "@layouts/MainLayout.vue";
export default {
    name: 'Models',
    title: 'Models',
    components: {
        MainLayout,
        Tinder,
        TinderCard,
        AskRedirectToChatDialog,
        NoMoreModels
    },
    props: {
        id: String,
        models: {
            type: Array,
            required: true
        },
        modelId: String,
        activeItem: Object
    },
    mounted() {
        console.log(`mounted; models`, this.models.length, this.models)
    },
    created() {
        axios.defaults.headers.common['X-CSRF-Token'] = usePage().props.token;
        console.log('this.$root', this.$root)
        console.log('this.$inertia', this.$inertia)
        console.log('router',router)
        console.log('route', route)
        console.log('this.route', this.route)
        console.log('this.$route', this.$route)
        console.log('this.routes', this.routes)
        console.log('this.$routes', this.$routes)
        console.log(`created; models`, this.models.length, this.models)
        this.$watch(
            () => this.$route.params.modelId,
            (newId, oldId) => {
                console.log('modelId changed ($watch): ', newId, oldId)
            }
        )

        const modelId = this.$route.params.modelId || this.modelId;
        console.log('created', modelId);

        console.log('this.$route', this.$route, this.$route.params, this.$route.params.id)
        console.log('this.$router', this.$router, this.$router.currentRoute, this.$router.currentRoute.value.params, this.$router.currentRoute.value.params.id)

        if (modelId) {
            const model = this.models.find(m =>
                parseInt(m.id) === parseInt(modelId)
            );

            console.log('model', model, modelId);

            console.log('this.models', this.models);
            if (model) {
                this.models.splice(this.models.indexOf(model), 1);
                this.models.unshift(model);
                console.log('this.models', this.models);
                this.fillQueue();
            }
            console.log('this.queue', this.queue);
            this.updateUrlHash();
        } else {
            this.fillQueue();
            this.updateUrlHash();
        }
    },
    data: () => ({
        queue: [],
        openModal: false,
        redirectToGirl: null,
        offset: 0,
        history: [],
    }),
    watch: {
        queue: 'updateUrlHash'
    },
    computed: {

    },
    methods: {
        updateUrl(model) {
            console.log('updateUrl', model);
            this.$router.replace({
                name: 'models',
                params: { modelId: model.id },
            });
        },
        updateUrlHash() {
            if (this.queue.length > 0) {
                const currentModel = this.queue[0];
                console.log('updateUrlHash', currentModel);
                this.updateUrl(currentModel)
            }
        },
        _swipe: (modelId, type) =>
            axios.put(`/api/model/grade`, {
                _token: page.props.csrf_token,
                model_id: modelId,
                type
            })
        ,
        redirectToProfile({username}) {
            window.location.href = `https://onlyfans.com/${username}`;
        },
        openDialog(item) {
            this.redirectToGirl = item;
            this.openModal = true;
        },
        closeDialog(item) {
            this.redirectToGirl = null;
            this.openModal = false;
        },
        fillQueue() {
            this.models.forEach(model => this.queue.push(model));
        },
        getModels() {
            router.get('/models', {
                _token: page.props.csrf_token
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (response) => {
                    this.fillQueue();
                }
            });
        },
        onSubmit({ item, type }) {
            this._swipe(item.id, type === 'like' ? type : 'dislike')
            if (type === 'like') {
                this.openDialog(item);
            }
            console.log('onSubmit', item)
            if (this.queue.length < 2) {
                this.getModels();
            }
            this.history.push(item);
        },
        async decide(choice) {
            console.log('decide', choice)
            if (choice === "rewind") {
                if (this.history.length) {
                    const prevItem = this.history.pop();
                    this.$refs.tinder.rewind([prevItem]);
                }
            } else {
                this.$refs.tinder.decide(choice);
            }
        },

    }
};
</script>

<style lang="scss">

.tinder-card {
    border-radius: 8px !important;
    position: absolute;
    width: 100%;
    height: 100%;
}

.mobile .vue-tinder {
    width: calc(100dvw - 56px);
}

.vue-tinder {
    position: absolute !important;
    z-index: 1;

    width: 33dvw;
    height: 100%;
    min-width: 300px;
    max-width: 100%;

    left: 0;
    top: 0;
    right: 0;
    margin: auto;
    -webkit-tap-highlight-color: transparent;
}



.img-wrapper {
    max-height: 80vh !important;
}

.v-move {
    transition: none !important;
}

.app {
    display: block;
    color: #000000de;
}

.models-group {
    min-height: 100vh;
    padding: 0;
}

.profile-card-wrapper {
    min-height: calc(80vh - 20px);
}

.pointer-wrap {
    i {
        --v-icon-size-multiplier: 3;
        font-weight: 100;
    }
}

.nope-pointer,
.like-pointer {
    position: absolute !important;
    z-index: 1;
    width: 64px;
    height: 64px;
    top: calc(50% - 40px);
}

.nope-pointer {
    right: 10px;
}

.like-pointer {
    left: 10px;
}

.wrapper {
    display: flex;
    width: 100%;
    position: relative;
    background: #fff;
    background: linear-gradient(0deg, rgba(255, 255, 255, 1) 25%, rgba(255, 255, 255, 0) 100%);
    height: 100%;
    justify-content: space-around;
}

.actions v-btn {
    opacity: 1;
}
</style>
