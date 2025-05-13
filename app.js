const API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultados = document.getElementById('results');
const favoritosLista = document.getElementById('favorites'); 

let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

function guardarFavoritos() {
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

function renderResultados(recetas) {
  if (!resultados) return; // Verifica si el elemento existe
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

function renderFavoritos() {
  if (!favoritosLista) return; // Verifica si el elemento existe
  favoritosLista.innerHTML = '';

  if (favoritos.length === 0) {
    favoritosLista.innerHTML = '<p>No hay favoritos aún.</p>';
    return;
  }

  favoritos.forEach(fav => {
    const card = document.createElement('div');
    card.classList.add('favorito-card');
    card.innerHTML = `
      <h4>${fav.nombre}</h4>
      <img src="${fav.imagen}" alt="${fav.nombre}" width="100%" />
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

function agregarAFavoritos(idMeal, nombre, imagen) {
  if (favoritos.some(f => f.idMeal === idMeal)) return; // Evita duplicados

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

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  try {
    const res = await fetch(API_URL + query);
    const data = await res.json();
    if (data.meals) {
      renderResultados(data.meals);
    } else {
      resultados.innerHTML = '<p>No se encontraron resultados.</p>';
    }
  } catch (error) {
    console.error('Error al buscar recetas:', error);
    resultados.innerHTML = '<p>Hubo un error al buscar las recetas.</p>';
  }
});

// Cargar favoritos al iniciar
renderFavoritos();
