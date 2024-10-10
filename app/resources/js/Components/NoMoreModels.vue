<template>
    <v-empty-state icon="$success">
        <template v-slot:media>
            <v-icon color="surface-variant"></v-icon>
        </template>

        <template v-slot:headline>
            <div class="text-h4">
                All Done For Now!
            </div>
        </template>

        <template v-slot:title>
            <div class="text-h6">
                You're all caught up.
            </div>
        </template>

        <template v-slot:text>
            <div class="text-medium-emphasis text-caption">
                No more models, check back later.
            </div>
        </template>
    </v-empty-state>
</template>

<script>
export default {
    name: "NoMoreModels"
}
</script>

<style scoped>

</style>
