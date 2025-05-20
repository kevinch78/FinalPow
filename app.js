const API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultados = document.getElementById('results');
const favoritosLista = document.getElementById('favorites'); 
const toggleBtn = document.getElementById('toggle-favorites');
const favoritesPanel = document.getElementById('favorites-panel');
const closeBtn = document.getElementById('close-favorites');
const favCount = document.getElementById('fav-count');
const filtroFavoritosInput = document.getElementById('filtro-favoritos');

let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

function guardarFavoritos() {
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

function renderResultados(recetas) {
  if (!resultados) return;
  resultados.innerHTML = '';

  if (!recetas || recetas.length === 0) {
    resultados.innerHTML = '<p>No se encontraron resultados.</p>';
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
}

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
        const notaLimpia = textarea.value.trim();

        // Validar longitud nota personal
        if (notaLimpia.length > 200) {
          alert('La nota no puede superar los 200 caracteres.');
          textarea.value = notaLimpia.slice(0, 200);
          actualizarNota(fav.idMeal, textarea.value.trim());
          return;
        }

        actualizarNota(fav.idMeal, notaLimpia);
      });

      favoritosLista.appendChild(card);
    });
  }

  actualizarContadorFavoritos();
}

function agregarAFavoritos(idMeal, nombre, imagen) {
  if (favoritos.some(f => f.idMeal === idMeal)) return;
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

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const query = searchInput.value.trim();

  // Validar búsqueda vacía
  if (!query) {
    alert('Por favor ingresa un término de búsqueda.');
    return;
  }

  resultados.innerHTML = `
    <p style="font-weight: bold; font-size: 1.2em;">
      Cargando recetas<span class="dots">.</span>
    </p>
  `;

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
      resultados.innerHTML = '<p>No se encontraron resultados.</p>';
    }
  } catch (error) {
    clearInterval(loadingDots);
    console.error('Error al buscar recetas:', error);
    resultados.innerHTML = '<p>Hubo un error al buscar las recetas.</p>';
  }
});

// Mostrar y ocultar panel de favoritos
toggleBtn.addEventListener('click', () => {
  favoritesPanel.classList.add('visible');
});

closeBtn.addEventListener('click', () => {
  favoritesPanel.classList.remove('visible');
});

// Filtro en favoritos
filtroFavoritosInput.addEventListener('input', e => {
  const texto = e.target.value.trim();
  filtrarFavoritos(texto);
});

const filtroConNotaCheckbox = document.getElementById('filtro-con-nota');

filtroConNotaCheckbox.addEventListener('change', () => {
  if (filtroConNotaCheckbox.checked) {
    filtrarFavoritos('con nota');
  } else {
    renderFavoritos();
  }
});

// Al iniciar: cargar favoritos y recetas aleatorias
window.addEventListener('DOMContentLoaded', async () => {
  renderFavoritos();

  resultados.innerHTML = `
    <p style="font-weight: bold; font-size: 1.2em;">
      Cargando recetas<span class="dots">.</span>
    </p>
  `;

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
