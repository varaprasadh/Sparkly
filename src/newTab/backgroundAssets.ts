import wallpaper1 from "./backgrounds/wallpaper_1.jpg";
import wallpaper2 from "./backgrounds/wallpaper_2.jpg";
import wallpaper3 from "./backgrounds/wallpaper_3.jpg";
import wallpaper4 from "./backgrounds/wallpaper_4.jpg";
import wallpaper5 from "./backgrounds/wallpaper_5.jpg";
import wallpaper6 from "./backgrounds/wallpaper_6.jpg";

// gifs
import gif1 from "./backgrounds/gif_1.gif";
import gif2 from "./backgrounds/gif_2.gif";
import gif3 from "./backgrounds/gif_3.gif";
import gif4 from "./backgrounds/gif_4.gif";



export const wallpapers = [
    {
        key: 1,
        value: wallpaper1,
    },
    {
        key: 2,
        value: wallpaper2,
    },
    {
        key: 3,
        value: wallpaper3,
    },
    {
        key: 4,
        value: wallpaper4,
    },
    {
        key: 5,
        value: wallpaper5,
    },
    {
        key: 6,
        value: wallpaper6,
    }
];

export const gifs = [
    {
        key: 1,
        value: gif1,
    },
    {
        key: 2,
        value: gif2,
    },
    {
        key: 3,
        value: gif3,
    },
    {
        key: 4,
        value: gif4,
    },
];

export const gradients = [

    {
        key: 1,
        value: 'linear-gradient(315deg, #130f40 0%, #000000 74%);'
    },
    {
        key: 2,
        value: 'linear-gradient(315deg, #e056fd 0%, #000000 74%);'
    },
    {
        key: 3,
        value: 'linear-gradient(to right top, #621b1b, #4b161b, #341218, #1f0c10, #000000);'
    },
    {
        key: 5,
        value: 'linear-gradient(147deg, #000000 0%, #04619f 74%);'
    },
    {
        key: 5,
        value: 'linear-gradient(315deg, #55efc4 0%, #000000 74%);'
    },
    {
        key: 6,
        value: 'linear-gradient(147deg, #923cb5 0%, #000000 74%);'
    },
]; 

export const ASSET_TYPES = {
    IMAGE:0,
    GIF: 1,
    GRADIENT:2
};
