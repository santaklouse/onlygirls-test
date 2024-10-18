export default {
    methods: {
        imgUrl(width, imgSrc) {
            if (!imgSrc) {
                return imgSrc;
            }
            const src = window.encodeURIComponent(imgSrc);
            return `/img/unsafe/${width}x0/${src}`;
        }
    }
}
