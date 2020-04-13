<template>
    <footer class="page-footer font-small blue">
        <span>Source API : <a href="https://github.com/mathdroid">mathdroid</a></span>
    </footer>
</template>

<script>
    import moment from "moment";

    export default {
        name: "Footer",
        components: {
        },
        data() {
            return {
                year: 0,
            };
        },
        methods: {

        },
        mounted() {
            this.year = moment().format('YYYY');
        },
    }
</script>

<style scoped>

</style>