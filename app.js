const API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

// ELEMENTOS
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultados = document.getElementById('results');
const favoritosLista = document.getElementById('favorites');
const toggleBtn = document.getElementById('toggle-favorites');
const favoritesPanel = document.getElementById('favorites-panel');
const closeBtn = document.getElementById('close-favorites');
const favCount = document.getElementById('fav-count');
const filtroFavoritosInput = document.getElementById('filtro-favoritos');
const filtroConNotaCheckbox = document.getElementById('filtro-con-nota');

// GESTIÓN DE ESTADO
let estadoActual = 'inicio'; // inicio | buscando | resultados | favoritos | detalle
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

// FUNCIONES DE ESTADO
function cambiarEstado(nuevoEstado) {
  estadoActual = nuevoEstado;
  console.log('Estado actual:', estadoActual);
  const estadoInfo = document.getElementById('estado-info');
  if (estadoInfo) estadoInfo.textContent = `Estado: ${estadoActual}`;
}

// LOCAL STORAGE
function guardarFavoritos() {
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

// RENDER DE RESULTADOS
function renderResultados(recetas) {
  if (!resultados) return;
  resultados.innerHTML = '';

  if (!recetas || recetas.length === 0) {
    resultados.innerHTML = '<p class="mensaje-info">No se encontraron resultados.</p>';
    return;
  }

  recetas.forEach(receta => {
    const card = document.createElement('div');
    card.classList.add('resultado-card');
    card.innerHTML = `
      <h3>${receta.strMeal}</h3>
      <img src="${receta.strMealThumb}" alt="${receta.strMeal}" width="100%" />
      <button onclick="agregarAFavoritos('${receta.idMeal}', '${receta.strMeal}', '${receta.strMealThumb}')">Agregar a Favoritos</button>
    `;
    resultados.appendChild(card);
  });

  cambiarEstado('resultados');
}

// RENDER DE FAVORITOS
function renderFavoritos(lista = favoritos) {
  if (!favoritosLista) return;
  favoritosLista.innerHTML = '';

  if (lista.length === 0) {
    favoritosLista.innerHTML = '<p>No hay favoritos aún.</p>';
  } else {
    lista.forEach(fav => {
      const card = document.createElement('div');
      card.classList.add('favorito-card');
      card.innerHTML = `
        <h4>${fav.nombre}</h4>
        <img src="${fav.imagen}" alt="${fav.nombre}" />
        <textarea placeholder="Nota personal..." data-id="${fav.idMeal}">${fav.nota || ''}</textarea>
        <button onclick="eliminarFavorito('${fav.idMeal}')">Eliminar</button>
      `;

      const textarea = card.querySelector('textarea');
      textarea.addEventListener('input', () => {
        actualizarNota(fav.idMeal, textarea.value);
      });

      favoritosLista.appendChild(card);
    });
  }

  actualizarContadorFavoritos();
  cambiarEstado('favoritos');
}

// FAVORITOS: AGREGAR, ELIMINAR, NOTAS
function agregarAFavoritos(idMeal, nombre, imagen) {
  if (favoritos.some(f => f.idMeal === idMeal)) {
    alert('Esta receta ya está en tus favoritos');
    return;
  }
  favoritos.push({ idMeal, nombre, imagen, nota: '' });
  guardarFavoritos();
  renderFavoritos();
}

function eliminarFavorito(idMeal) {
  favoritos = favoritos.filter(f => f.idMeal !== idMeal);
  guardarFavoritos();
  renderFavoritos();
}

function actualizarNota(idMeal, nota) {
  const favorito = favoritos.find(f => f.idMeal === idMeal);
  if (favorito) {
    favorito.nota = nota;
    guardarFavoritos();
  }
}

function actualizarContadorFavoritos() {
  favCount.textContent = favoritos.length;
}


function filtrarFavoritos(texto) {
  const textoMin = texto.toLowerCase();

  const favoritosFiltrados = favoritos.filter(fav => {
    const nombreCoincide = fav.nombre.toLowerCase().includes(textoMin);
    const tieneNota = fav.nota && fav.nota.trim().length > 0;
    const buscarNota = textoMin === 'con nota';
    const buscarSinNota = textoMin === 'sin nota';

    if (buscarNota) return tieneNota;
    if (buscarSinNota) return !tieneNota;

    return nombreCoincide;
  });

  renderFavoritos(favoritosFiltrados);
}

// BUSQUEDA DE RECETAS
searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    alert('Por favor ingresa una palabra para buscar.');
    return;
  }

  cambiarEstado('buscando');
  resultados.innerHTML = `<p><strong>Cargando recetas<span class="dots">.</span></strong></p>`;

  let dotCount = 1;
  const loadingDots = setInterval(() => {
    const span = document.querySelector('.dots');
    if (span) {
      span.textContent = '.'.repeat(dotCount);
      dotCount = (dotCount % 3) + 1;
    }
  }, 500);

  try {
    const res = await fetch(API_URL + query);
    const data = await res.json();
    clearInterval(loadingDots);
    if (data.meals) {
      renderResultados(data.meals);
    } else {
      resultados.innerHTML = '<p class="mensaje-info">No se encontraron resultados.</p>';
    }
  } catch (error) {
    clearInterval(loadingDots);
    console.error('Error al buscar recetas:', error);
    resultados.innerHTML = '<p class="mensaje-error">Hubo un error al buscar las recetas.</p>';
  }
});

// MOSTRAR / OCULTAR FAVORITOS
toggleBtn.addEventListener('click', () => {
  favoritesPanel.classList.add('visible');
  cambiarEstado('favoritos');
});

closeBtn.addEventListener('click', () => {
  favoritesPanel.classList.remove('visible');
  cambiarEstado('resultados');
});

// FILTROS
filtroFavoritosInput.addEventListener('input', e => {
  const texto = e.target.value.trim();
  filtrarFavoritos(texto);
});

filtroConNotaCheckbox.addEventListener('change', () => {
  if (filtroConNotaCheckbox.checked) {
    filtrarFavoritos('con nota');
  } else {
    renderFavoritos();
  }
});

// INICIO
window.addEventListener('DOMContentLoaded', async () => {
  renderFavoritos();

  cambiarEstado('inicio');
  resultados.innerHTML = `<p><strong>Cargando recetas<span class="dots">.</span></strong></p>`;

  let dotCount = 1;
  const loadingDots = setInterval(() => {
    const span = document.querySelector('.dots');
    if (span) {
      span.textContent = '.'.repeat(dotCount);
      dotCount = (dotCount % 3) + 1;
    }
  }, 500);

  const recetasAleatorias = [];

  for (let i = 0; i < 12; i++) {
    try {
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await res.json();
      if (data.meals && data.meals.length > 0) {
        recetasAleatorias.push(data.meals[0]);
      }
    } catch (error) {
      console.error('Error al cargar receta aleatoria:', error);
    }
  }

  clearInterval(loadingDots);
  renderResultados(recetasAleatorias);
});
