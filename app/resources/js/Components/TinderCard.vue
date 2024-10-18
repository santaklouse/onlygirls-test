<template>
    <v-card class="profile-card rounded rounded-lg elevation-23" :class="{'profile-card--expanded': readMore}">
        <v-img
            class="img-wrapper rounded rounded-lg align-end"
            :aspect-ratio="9/16"
            :src="imgUrl(item.header_size.width, item.header)"
            :alt="`${item.name}'s profile header image`"
            cover
            min-height="350px"
            width="100%"
            height="100%"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            :loadstart="loading=true"
            @load="loading=false"
            :lazy-src="imgUrl('100', item.header_thumbs.w480)"
        >
            <template #sources>
                <source media="(max-width: 759px)" :srcset="imgUrl('480', item.header_thumbs.w480)">
                <source media="(min-width: 760px)" :srcset="imgUrl('760', item.header_thumbs.w760)">
                <source :media="`(min-width: ${item.header_size.width}px)`" :srcset="imgUrl(item.header_size.width, item.header)">
            </template>
            <template #placeholder>
                <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                        color="grey-lighten-4"
                        indeterminate
                    ></v-progress-circular>
                </div>
            </template>
            <template #error>
                <v-img
                    :aspect-ratio="9/16"
                    :src="imgUrl(144, item.avatar_thumbs?.c144)"
                    :alt="`${item.name}'s profile avatar image`"
                    cover
                ></v-img>
            </template>
            <div class="pb-5" :class="{'overflow-y-auto': readMore}">
                <v-card-actions class="flex-column gap-0">
                    <v-list-item class="w-100">
                        <template v-slot:prepend>
                            <v-avatar :image="imgUrl(64, item.avatar_thumbs?.c144)" size="64">
                                <v-img
                                    v-if="item.avatar_thumbs?.c144"
                                    alt="Avatar"
                                    :src="imgUrl(64, item.avatar_thumbs?.c144)"
                                    :lazy-src="imgUrl(10, item.avatar_thumbs?.c144)"
                                >
                                    <template #error>
                                        <v-icon icon="mdi-account-circle" size="64"></v-icon>
                                    </template>
                                </v-img>
                                <v-icon
                                    v-else
                                    icon="mdi-account-circle"
                                    size="64"
                                ></v-icon>
                            </v-avatar>
                        </template>
                        <v-list-item-title><h5 class="text-white">{{item.name}}</h5></v-list-item-title>
                        <v-list-item-subtitle>
                            <a target="_blank" :href="`https://onlyfans.com/profile/${item.username}`" class="username">@{{ item.username }}</a>
                        </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="w-100" v-if="item.location?.length || item.raw_about?.length">
                        <v-btn
                            rounded="xl"
                            density="comfortable"
                            text="More"
                            size="small"
                            elevation="3"
                            @click="readMore = !readMore && goTo($refs.about.$el)"
                        ></v-btn>
                    </v-list-item>

                </v-card-actions>
                <v-card-text v-show="!!readMore" class="about pt-1" ref="about">
                    <div v-if="item.location?.length" class="location">
                        <h6>Location:&nbsp;</h6>
                        <span>{{item.location}}</span>
                    </div>
                    <div v-if="item.raw_about?.length" class="about pb-3 h-auto">
                        <h6>About Me</h6>
                        <span>{{item.raw_about}}</span>
                    </div>
                </v-card-text>
            </div>
        </v-img>
    </v-card>
</template>

<script>
import {useGoTo} from "vuetify";
import imgUrls from "@components/mixins/img.js";

export default {
    name: 'TinderCard',
    mixins: [imgUrls],
    props: {
        item: Object,
    },
    data: () => ({
        readMore: false,
        loading: true
    }),
    setup () {
        const goTo = useGoTo()
        return { goTo }
    },
    created() {
        // avatar_thumbs
        if (!this.item.avatar_thumbs?.c144) {
            this.item.avatar_thumbs = JSON.parse(this.item.avatar_thumbs);
        }
    }
};
</script>

<style lang="scss">

.profile-card {
    height: 100%;
    max-height: 80dvh;

    margin-top: 28px;

    &:after {
         content: "";
         position: absolute;
         top: 0;
         left: 0;
         width: 100%;
         height: calc(100% - 100px);
         max-height: 80vh;
         background: rgba(0, 0, 0, 0.6);
         opacity: 0;
         transition: opacity 0.3s ease-in-out;
     }

    &--expanded:after {
        height: calc(100% - 200px);
    }

    picture.v-img__picture {
        width: 100%;
        max-height: 80vh;
        height: 100%;
        max-width: 100vw;
    }
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
    white-space: nowrap;
    font-size: 24px;
    font-weight: bold;
}

.about, .location {
    h6 {
        color: #fff;
    }
}

.about {
    height: 10vh;
    text-overflow: ellipsis;
}

.location {
    font-size: 18px;
    margin-top: 5px;

    h6 {
        display: inline-block;
    }
}

</style>
