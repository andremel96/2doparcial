
//obtiene la referencia al contenedor main
var main = document.getElementById("principal");
var mainCinema = document.getElementById("main-cinema");
var mainRated = document.getElementById("main-r");
var mainTvShows = document.getElementById("main-tvshows");
var genresList = document.getElementById("genres");
var arrayGenres = [];
var year = new Date().getFullYear();

/* consigue el listado de generos */
const cargarPeliculas = () => {
  fetch(
    genres_list_http +
    new URLSearchParams({
      api_key: api_key,
      language: language
    })
  )
    .then((res) => res.json())
    .then((data) => {
      main.innerHTML = "";
      data.genres.forEach((item) => {
        fetchListaPeliculasPorGenero(item.id, item.name);
        llenarListaGeneros(item.id, item.name);
      });
    });
}

const cargaInicial = () => {
  cargarPeliculas();
  cargarCertificaciones();
  // adultos
  cargarPeliculasSegunCategoria({
    api_key: api_key,
    language: language,
    certification_country: 'US',
    certification: 'R',
    sort_by: 'vote_average.desc'
  }, mainRated, 'Disfrutalas');
  var inicial = new Date();
  inicial.setMonth(inicial.getMonth() - 2);
  // mas recientes
  cargarPeliculasSegunCategoria({
    api_key: api_key,
    language: language,
    'primary_release_date.gte': formatDate(inicial),
    'primary_release_date.lte': formatDate(new Date())
  }, mainCinema, 'Ve a verlas ya :D');
// series de tv
  cargarPeliculasSegunCategoria({
    api_key: api_key,
    language: language,
  }, mainTvShows, 'Miralas todas',tv_list_http);
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;
// retorna la fecha en formato yyyy-MM.dd
  return [year, month, day].join('-');
}


const cargarPeliculasConFiltro = (title) => {
  fetch(
    movie_genres_http +
    new URLSearchParams({
      api_key: api_key,
      language: language,
      with_genres: arrayGenres.join(','),
      primary_release_year: getSelectValue('year'),
      certification_country: getSelectGroupValue('classification'),
      certification: getSelectValue('classification')
    })
  )
    .then((res) => res.json())
    .then((data) => {
      main.innerHTML = "";
      construirElementoCategoria(`Peliculas encontradas`, data.results, title);
    });
}

// funcion para la muestra de los ultimos incisos
const cargarPeliculasSegunCategoria = (config, htmlObject, title, http) => {
  fetch(
    (http?http:movie_genres_http) +
    new URLSearchParams(config)
  )
    .then((res) => res.json())
    .then((data) => {
      htmlObject.innerHTML="";
      construirElementoCategoria(title, data.results, htmlObject);
    });
}



const cargarCertificaciones = () => {
  fetch(
    movie_certification_http +
    new URLSearchParams({
      api_key: api_key,
      language: language
    })
  )
    .then((res) => res.json())
    .then((data) => {
      let datacert = data.certifications;
      Object.keys(datacert).forEach((item) => {
        generarCertificaciones(datacert, item);
      });
    });
}
const certificationItem = document.getElementById('classification');


// mostrar las certificaciones, unimos la countri con sus derivados
const generarCertificaciones = (data, certificaction) => {
  let arrayCert = data[certificaction];
  let optgroup = document.createElement('optgroup');
  optgroup.label = certificaction;
  arrayCert.forEach((item) => {
    let option = document.createElement('option');
    let certName = item.certification;
    option.value = certName;
    option.text = certName;
    option.title = item.meaning;

    optgroup.appendChild(option);
  })
  certificationItem.appendChild(optgroup);
}

const reloadOnSelect = () => {
  setLanguageStorage();
  cargaInicial();
}



const llenarListaGeneros = (id, genre) => {
  let input = document.createElement('input');
  input.type = "checkbox";
  input.id = id;
  input.name = genre;
  input.addEventListener('change', getElementClicked)
  let span = document.createElement('span');
  span.innerHTML = genre;
  genresList.appendChild(input);
  genresList.appendChild(span);
  genresList.appendChild(document.createElement('br'));

}

const getElementClicked = (element) => {
  let target = element.target;
  if (target.checked) {
    arrayGenres.push(target.id);
    console.log(arrayGenres);
  } else {
    let index = arrayGenres.indexOf(target.id);
    if (index > -1) {
      arrayGenres.splice(index, 1);
    }
    console.log(arrayGenres);
    console.log("borrado")
  }
}

// obetiendo los varoles de los select
const getSelectValue = (elementName) => {
  var select = document.getElementById(elementName);
  console.log(select.options[select.selectedIndex].text)
  return select.options[select.selectedIndex].text;
}

const getSelectGroupValue = (elementName) => {
  var select = document.getElementById(elementName);
  console.log(select.options[select.selectedIndex].parentNode.label)
  return select.options[select.selectedIndex].parentNode.label;
}

// 
const fetchListaPeliculasPorGenero = (id, genres) => {
  fetch(
    movie_genres_http +
    new URLSearchParams({
      api_key: api_key,
      language: language,
      with_genres: id,
      page: Math.floor(Math.random() * 3) + 1, //trae pagina al azar
    })
  )
    .then((res) => res.json())
    .then((data) => {
      //console.log(data);
      construirElementoCategoria(`${genres}_movies`, data.results);
    })
    .catch((err) => console.log(err));
};

/* crea el titulo de categoria */
const construirElementoCategoria = (category, data, htmlObject) => {
  (htmlObject ? htmlObject : main).innerHTML += `
    <div class="movie-list">
        <button class="pre-btn"> <img src="img/pre.png" alt=""></button>
          
          <h1 class="movie-category">${category.split("_").join(" ")}</h1>

          <div class="movie-container" id="${category}">
          </div>

        <button class="nxt-btn"> <img src="img/nxt.png" alt=""> </button>
    </div>
    `;
  construirTarjetas(category, data);
};

const construirTarjetas = (id, data) => {
  const movieContainer = document.getElementById(id);
  data.forEach((item, i) => {
    if (item.backdrop_path == null) {
      item.backdrop_path = item.poster_path;
      if (item.backdrop_path == null) {
        return;
      }
    }
    let title=item.title?item.title:item.original_name;

    movieContainer.innerHTML += `
        <div class="movie" onclick="location.href = '/${item.id}'">
            <img src="${img_url}${item.backdrop_path}" alt="">
            <p class="movie-title">${title}</p>
        </div>
        `;

    if (i == data.length - 1) {
      setTimeout(() => {
        setupScrolling();
      }, 100);
    }
  });
};


/* Set the width of the side navigation to 250px */
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}