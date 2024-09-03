<template>
    <v-dialog v-model="model" max-width="500px">
        <v-card
            prepend-icon="mdi-call-split"
            title="Do you want to chat with her?"
            :text="`Want to talk to her? No problem, just click the button below to redirect to \`${data?.username}\` profile on OnlyFans site.`"
        >
            <template v-slot:actions>
                <v-spacer></v-spacer>
                <v-btn @click.stop="dismiss">Disagree</v-btn>
                <v-btn @click.stop="agreed" color="primary">Agree</v-btn>
            </template>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "AskRedirectToChatDialog",
    emits: ['dismiss', 'agree'],
    props: {
        value: Boolean,
        data: Object,
    },
    methods: {
        agreed() {
            this.$emit('agree', this.data);
            this.closeModal();
        },
        dismiss() {
            this.$emit('dismiss', this.data);
            this.closeModal();
        },
        closeModal() {
            this.model = null;
        },
    },
    computed: {
        model: {
            get () {
                return this.value
            },
            set (value) {
                this.$emit('input', value)
            }
        }
    }
}
</script>

<style scoped>

</style>
