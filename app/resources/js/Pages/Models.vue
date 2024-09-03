<template>
    <v-app class="app">
        <TransitionGroup
            tag="ul"
            :css="false"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave"
            class="models-group"
        >
            <TinderCard
                v-for="(item, index) in queue"
                ref="tinder-card"
                :key="item.id"
                :index="index"
                :item="item"
                :models="queue"
                @action="onSwipe"
            >
            </TinderCard>
        </TransitionGroup>
        <AskRedirectToChatDialog
            v-model="openModal"
            :data="redirectToGirl"
            @dismiss="closeDialog"
            @agree="redirectToProfile"
        />
    </v-app>
</template>

<script>
import { Inertia } from '@inertiajs/inertia';
import TinderCard from '../Components/TinderCard.vue'
import AskRedirectToChatDialog from '../Components/AskRedirectToChatDialog.vue'
import gsap from 'gsap'

export default {
    components: {
        TinderCard,
        AskRedirectToChatDialog
    },
    props: {
        models: Array,
        activeItem: Object
    },
    data: () => ({
        queue: [],
        openModal: false,
        redirectToGirl: null
    }),
    created() {
        this.fillQueue();
    },
    methods: {
        _swipe: (modelId, like) =>
            axios.post('/models/swipe', { model_id: modelId, like })
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
            this.removeFromQueue(item)
        },
        removeFromQueue(item) {
            const i = this.queue.indexOf(item)
            this.queue.splice(i, 1);
            if (this.queue.length < 2) {
                this.getModels();
            }
        },
        async onSwipe(action, item) {
            const i = this.queue.indexOf(item)
            if (i < 0) {
                return;
            }
            this._swipe(item.id, action === 'like' ? 1 : 0)
            if (action === 'like') {
                return this.openDialog(item);
            }
            this.removeFromQueue(item);
        },
        fillQueue() {
            this.models.forEach(model => this.queue.push(model));
        },
        getModels() {
            Inertia.get('/models', { }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (response) => {
                    this.fillQueue();
                }
            });
        },

        onBeforeEnter(el) {
            el.style.opacity = 0
            el.style.height = 0
        },

        onEnter(el, done) {
            gsap.to(el, {
                opacity: 1,
                height: '100%',
                delay: el.dataset.index * 0.15,
                onComplete: done
            })
        },

        onLeave(el, done) {
            gsap.to(el, {
                opacity: 0,
                height: 0,
                delay: el.dataset.index * 0.15,
                onComplete: done
            })
        }
    }
};
</script>

<style scoped>

.app {
    color: #000000de;
}

.models-group {
    min-height: 100vh;
    padding: 0;
}

</style>
