<template>
    <li v-if="isFirst()" :data-index="index">
        <v-container class="app-container">
            <v-main class="card-container">
                <v-card class="card">
                    <v-img
                        :aspect-ratio="1"
                        cover
                        :src="item.header_thumbs.w480"
                        alt="Profile Image"
                        class="profile-image"
                    >
                        <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular
                                    color="grey-lighten-4"
                                    indeterminate
                                ></v-progress-circular>
                            </div>
                        </template>
                        <template v-slot:error>
                            <v-img
                                class="mx-auto"
                                :aspect-ratio="1"
                                cover
                                :src="item.header_thumbs.w760"
                            ></v-img>
                        </template>
                    </v-img>
                    <v-card-actions class="actions pb-0">
                        <div class="wrapper">
                            <v-btn
                                variant="flat"
                                class="ma-2"
                                color="red-lighten-2"
                                icon="mdi-thumb-down"
                                size="x-large"
                                @click="decide('nope')"
                            ></v-btn>
                            <v-btn
                                variant="flat"
                                class="ma-2"
                                color="green-lighten-2"
                                icon="mdi-heart"
                                size="x-large"
                                @click="decide('like')"
                            ></v-btn>
                        </div>
                    </v-card-actions>
                    <v-card-title class="pb-0"><h5 class="name">{{ item.name }}</h5></v-card-title>
                    <v-card-subtitle class="card-info pt-0 pb-0">
                        <a target="_blank" :href="`https://onlygirls.com/profile/${item.username}`" class="username">@{{ item.username }}</a>
                        <div class="location">{{item.location}}</div>
                    </v-card-subtitle>
                    <v-card-text class="about pt-1">
                        <h6>About Me</h6>
                        <span>{{item.raw_about}}</span>
                    </v-card-text>
                </v-card>
            </v-main>
        </v-container>
    </li>

</template>

<script>
export default {
    name: 'TinderCard',
    emits: ['action'],
    props: {
        item: Object,
        models: Array,
        index: {
            type: Number,
            required: true
        },
    },
    data: () => ({
        list: [],
    }),
    created() {
        this.list = this.models.slice(0);
    },
    methods: {
        isFirst() {
            return !this.index;
        },
        decide(action) {
            const i = this.list.indexOf(this.item)
            if (i > -1) {
                this.list.splice(i, 1)
            }
            this.$emit('action', action, this.item);
        }
    }

};
</script>

<style>
.app-container {
    max-width: 375px;
    height: 100vh;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-container {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-direction: row;
}

.app-container, .card-container {
    padding: 0;
}

.card {
    width: 100%;
    max-width: 100%;
    border-radius: 20px;
}

.name {
    white-space: nowrap;
}

.about {
    height: 10vh;
    text-overflow: ellipsis;
}

.profile-image {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;

}

.profile-image img {
    transition: transform .5s ease;
}

.profile-image:hover img {
    transform: scale(1.2);
}

.card-info {
    padding: 15px;
}

v-card-title {
    position: relative;
}

v-card-subtitle {
    padding-top: 0;
}

.name {
    font-size: 24px;
    font-weight: bold;
}

.location {
    font-size: 18px;
    color: #777;
    margin-top: 5px;
}

v-card-actions {
    display: flex;
    justify-content: space-around;
    padding: 15px;
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

.actions {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0px;
    margin: auto;
    height: 100px;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    min-width: 300px;
    max-width: 355px;
}

.actions v-btn {
    opacity: 1;
}

</style>
