let api_key = "fa0f4639e15d595ef57abf169016859b";
let img_url = "https://image.tmdb.org/t/p/w500";
let genres_list_http = "https://api.themoviedb.org/3/genre/movie/list?";
let movie_genres_http = "https://api.themoviedb.org/3/discover/movie?";
let movie_certification_http="https://api.themoviedb.org/3/certification/movie/list?"
let tv_list_http="https://api.themoviedb.org/3/tv/popular?";

let original_img_url = "https://image.tmdb.org/t/p/original";
let movie_detail_http = "https://api.themoviedb.org/3/movie";


const miStorage = window.localStorage;

var language = 'es';

const setLanguageStorage = () => {
    let select = document.getElementById('language');
    language = select.options[select.selectedIndex].value;
    miStorage.setItem('language', language);
    console.log(language);
}

function selectElement(id, valueToSelect) {
    let element = document.getElementById(id);
    element.value = valueToSelect;
}

const getLanguageStorage = () => {
    language = miStorage.getItem('language');
    if (!language) {
        setLanguageStorage();
    }
    selectElement('language', language)
}

getLanguageStorage();






