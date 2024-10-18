<template>
    <MainLayout v-if="models.length">
        <template #head>
            <title>Models</title>
            <link v-for="(item, index) in queue"
                  rel="preload"
                  fetchpriority="high"
                  :href="imgUrl('100', item.header_thumbs.w480)"
                  as="image"
                  type="image/webp"
            />
            <link v-for="(item, index) in queue"
                  v-if="item?.avatar_thumbs?.c144"
                  rel="preload"
                  fetchpriority="high"
                  :href="imgUrl(144, item.avatar_thumbs?.c144)"
                  as="image"
                  type="image/webp"
            />
<!--            <link v-for="(item, index) in queue"-->
<!--                  rel="preload"-->
<!--                  fetchpriority="high"-->
<!--                  :href="imgUrl('480', item.header_thumbs.w480)"-->
<!--                  as="image"-->
<!--                  type="image/webp"-->
<!--                  media="(max-width: 759px)"-->
<!--            />-->
<!--            <link v-for="(item, index) in queue"-->
<!--                  rel="preload"-->
<!--                  fetchpriority="high"-->
<!--                  :href="imgUrl('760', item.header_thumbs.w760)"-->
<!--                  as="image"-->
<!--                  type="image/webp"-->
<!--                  media="(min-width: 760px)"-->
<!--            />-->
            <link v-for="(item, index) in queue"
                  rel="preload"
                  fetchpriority="high"
                  :href="imgUrl(item.header_size.width, item.header)"
                  as="image"
                  type="image/webp"
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
const user = computed(() => usePage().props.modelId)

import Tinder from "vue-tinder";
import TinderCard from "@components/TinderCard.vue";
import NoMoreModels from "@components/NoMoreModels.vue";
import AskRedirectToChatDialog from "@components/AskRedirectToChatDialog.vue";
import MainLayout from "@layouts/MainLayout.vue";
import imgUrls from '@components/mixins/img.js'

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
    mixins: [imgUrls],
    props: {
        id: String,
        models: {
            type: Array,
            required: true
        },
        modelId: String,
        activeItem: Object
    },
    created() {
        axios.defaults.headers.common['X-CSRF-Token'] = usePage().props.token;

        this.$watch(
            () => this.$route.params.modelId,
            (newId, oldId) => {
                console.log('modelId changed ($watch): ', newId, oldId)
            }
        );

        const modelId = this.$route.params.modelId || this.modelId;

        if (modelId) {
            const model = this.models.find(m =>
                parseInt(m.id) === parseInt(modelId)
            );

            if (model) {
                this.currentModel = model;
                this.models.splice(this.models.indexOf(model), 1);
                this.models.unshift(model);
            }
        }
        this.fillQueue();
        this.updateUrlHash();

        this.getViewedModels().then(async viewed => {
            await this.replaceViewedModels(viewed);
        });
    },
    data: () => ({
        route: null,
        queue: [],
        currentModel: null,
        openModal: false,
        redirectToGirl: null,
        offset: 0,
        history: [],
    }),
    watch: {
        queue: 'updateUrlHash'
    },
    methods: {
        updateUrl(model) {
            this.$router.replace({
                name: 'models',
                params: { modelId: model.id },
            });
        },
        updateUrlHash() {
            if (this.queue.length > 0) {
                if (this.queue.at(0)) {
                    this.currentModel = this.queue.at(0);
                    this.updateUrl(this.currentModel)
                }
            }
        },
        async getViewedModels() {
            const { data: {viewed: viewed} } = await axios.get(this.getRouteUrl('api.models.viewed'));
            return viewed;
        },
        async replaceViewedModels(viewedModels) {
            if (!viewedModels.length) {
                return;
            }
            const modelsToReplace = [];
            for (const model in this.models) {
                if (viewedModels.includes(model.id)) {
                    modelsToReplace.push(model.id);
                }
            }

            if (!modelsToReplace.length) {
                return;
            }
            const {data: models} = await axios.get(this.getRouteUrl('api.models.replace-viewed'), {
                params: {viewed: modelsToReplace.join(';')}
            });

            if (!models.length) {
                return;
            }
            models.forEach(modelId => {
                if (this.currentModel?.id === modelId) {
                    return;
                }
                const modelForReplace = this.models.find(m =>
                    parseInt(m.id) === parseInt(modelId)
                );

                const replacementModel = models.pop();

                if (modelForReplace && replacementModel) {
                    this.models.splice(this.models.indexOf(modelForReplace), 1, replacementModel);
                    this.queue.splice(this.queue.indexOf(modelForReplace), 1, replacementModel);
                }
            });
        },
        getRouteUrl: (route) => {
            return window.route(route);
        },
        async _swipe(modelId, type) {
            return await axios.put(this.getRouteUrl('api.models.grade'), {
                model_id: modelId,
                type
            })
        },
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
            router.get('/models', {}, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (response) => {
                    this.fillQueue();
                }
            });
        },
        async onSubmit({ item, type }) {
            await this._swipe(item.id, type === 'like' ? type : 'dislike')
            if (type === 'like') {
                this.openDialog(item);
            }
            if (this.queue.length < 2) {
                this.getModels();
            }
            this.history.push(item);
        },
        async decide(choice) {
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
