const express = require("express");
const router = express.Router();

function mapCategoryToName(categoryInAvailableFilter) {
  return (
    categoryInAvailableFilter?.values.map((item) => {
      return item.name;
    }) ?? []
  );
}
/* Este código define una función llamada mapCategoryToName que toma un argumento categoryInAvailableFilter.
La función devuelve una matriz de nombres extraídos de la propiedad de valores del objeto de entrada.
Si el objeto de entrada es nulo, indefinido o no tiene una propiedad de valores, devuelve una matriz vacía.
La función utiliza el encadenamiento opcional (?.) para acceder a la propiedad de valores de forma segura y el operador de fusión nulo (??) para proporcionar un valor predeterminado de una matriz vacía cuando el lado izquierdo es nulo o indefinido. */

function findInArray(array, prop) {
  return array.find((item) => {
    return item.id === prop;
  });
} 
/* El código dado define una función llamada findInArray que toma dos parámetros: una matriz y una propiedad.
La función busca un objeto dentro de la matriz que tenga una propiedad llamada id con un valor igual a prop.
Si se encuentra tal objeto, se devuelve; de lo contrario, la función devuelve indefinido.
Esta función utiliza el método Array.prototype.find() para realizar la búsqueda. */

function getCategoriesFromData(data) {
  const categoryInAvailableFilter = findInArray(
    data.available_filters,
    "category"
  );
  const categoryInFilter = findInArray(data.filters, "category");

  const categoriesinAvailableFilter = mapCategoryToName(
    categoryInAvailableFilter
  );
  const categoriesInFilter = mapCategoryToName(categoryInFilter);
  const categories = [...categoriesinAvailableFilter, ...categoriesInFilter];
  return categories;
}

/* Este código define una función llamada getCategoriesFromData que toma los datos de un objeto como entrada y devuelve una matriz de categorías. La función realiza los siguientes pasos:

Busca un objeto de "categoría" en dos matrices: data.available_filters y data.filters, utilizando la función findInArray.
Extrae los nombres de categoría de los objetos de categoría encontrados utilizando la función mapCategoryToName.
Combina los nombres de las categorías extraídas de ambas matrices en una única matriz denominada categorías.
Devuelve la matriz de categorías que contiene los nombres de las categorías. */

const getItemsByQuery = (query) =>
  fetch(
    `https://api.mercadolibre.com/sites/MLA/search?q=${query}&limit=4`
  ).then((response) => response.json());

  /* Este código define una función llamada getItemsByQuery que toma una consulta de un solo parámetro.
   La función realiza una solicitud HTTP a la API de MercadoLibre utilizando la función de búsqueda.
   Construye la URL de la API con la consulta proporcionada y establece un límite de 4 elementos en la respuesta de la API.
   Después de realizar la solicitud, procesa la respuesta convirtiéndola a formato JSON.
   La función devuelve una Promesa que se resuelve con los datos JSON analizados cuando se completa la solicitud. */

const getItemsById = async (id, res) => {
  const descriptionPromise = fetch(
    `https://api.mercadolibre.com/items/${id}/description`
  ).then((response) => response.json());

  const descriptionResponse = await descriptionPromise;

  const itemPromise = fetch(`https://api.mercadolibre.com/items/${id}`).then(
    (response) => response.json()
  );

  const itemResponse = await itemPromise;

  const categoryPromise = fetch(
    `https://api.mercadolibre.com/categories/${itemResponse.category_id}`
  ).then((response) => response.json());

  const categoryResponse = await categoryPromise;
  const category = categoryResponse?.path_from_root?.map((item) => {
    return item.name;
  });

  // Promise.all([itemPromise, descriptionPromise]).then(([responseItems, descriptionResponse])=> { ... })

  return {
    ...itemResponse,
    plain_text: descriptionResponse?.plain_text,
    category,
  };
};

/* Este código define una función asincrónica llamada getItemsById que toma dos argumentos, id y res.
La función obtiene datos de tres puntos finales diferentes de la API de MercadoLibre para un ID de artículo determinado.
Recupera la descripción del artículo, los detalles del artículo y la información de la categoría.
La función primero obtiene la descripción del elemento del punto final https://api.mercadolibre.com/items/${id}/description y almacena la respuesta JSON en descriptionResponse.
Luego, obtiene los detalles del artículo del punto final https://api.mercadolibre.com/items/${id} y almacena la respuesta JSON en itemResponse.
A continuación, obtiene la información de la categoría utilizando el ID de categoría obtenido de la respuesta de detalles del artículo (itemResponse.category_id) de
el punto final https://api.mercadolibre.com/categories/${itemResponse.category_id} y almacena la respuesta JSON en categoryResponse.
Luego extrae la ruta de la categoría del objeto categoryResponse y la asigna a una matriz de nombres de categoría llamada categoría.
Finalmente, la función devuelve un objeto que combina los detalles del elemento de itemResponse, la descripción de texto sin formato de descriptionResponse y la matriz de categorías. */

/*data.available_filters = [
        {
          id: "category",
          name: "Categorías",
          type: "text",
          values: [
            {
              id: "MLA407134",
              name: "Herramientas",
              results: 1902,
            },
            {
              id: "MLA11830",
              name: "Componentes Electrónicos",
              results: 172631,
            },
          ],
        },
  ];*/

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const data = await getItemsById(id);

  res.send({
    author: res.locals.author,
    item: {
      category: data.category,
      id: data.id,
      title: data.title,
      price: {
        currency: data.currency_id,
        amount: Math.floor(data.price),
        decimals: data.price % Math.floor(data.price),
      },
      picture: data.thumbnail,
      condition: data.condition,
      free_shipping: data.shipping.free_shipping,
      sold_quantity: data.sold_quantity,
      description: data?.plain_text,
    },
  });
});
/* Este código define un controlador de ruta Express para una solicitud HTTP GET en una ruta de URL que contiene un parámetro de ID (por ejemplo, "/12345"). 
Cuando se realiza una solicitud a esta ruta, se producen los siguientes pasos:

Extrae el valor de identificación de los parámetros de solicitud.
Llama a la función getItemsById con el id como argumento y espera su resultado, almacenándolo en la variable de datos.
Construye un objeto de respuesta.
Estas propiedades se derivan del objeto de datos devuelto por la función getItemsById.
Envía el objeto de respuesta construido al cliente.
Este código generalmente se usa en el contexto de un servidor API, donde proporciona información sobre un elemento específico identificado por su ID. */

router.get("*", async (req, res) => {
  const q = req.query.search;
  const data = await getItemsByQuery(q);
  const categories = getCategoriesFromData(data);

  res.send({
    author: res.locals.author,
    categories,
    items: data.results.map((item) => {
      return {
        id: item.id,
        title: item.title,
        price: {
          currency: item.currency_id,
          amount: Math.floor(item.price),
          decimals: item.price % Math.floor(item.price),
        },
        picture: item.thumbnail,
        condition: item.condition,
        free_shipping: item.shipping.free_shipping,
      };
    }),
  });
});

//indica que esta ruta (*) manejará todas las peticiones que no coincidan con ninguna otra ruta definida en el middleware

/* Este código define un controlador de ruta para una aplicación Express.js que escucha las solicitudes GET con cualquier ruta de URL (indicada por "*").
Cuando se accede a la ruta, esta realiza las siguientes tareas:

Extrae el parámetro de consulta de búsqueda de la solicitud entrante y lo almacena en la variable q.
Llama a la función getItemsByQuery con el parámetro q, que se espera que devuelva una promesa que se resuelve en un objeto que contiene resultados de búsqueda (datos).
Llama a la función getCategoriesFromData con los datos recibidos y almacena el resultado en la variable de categorías.
Envía una respuesta con un objeto JSON.
  La propiedad items, que es una matriz creada al asignar la matriz data.results a una nueva matriz con un formato específico. Cada elemento en la nueva matriz

El propósito de este código es proporcionar una representación simplificada y estructurada de los resultados de búsqueda obtenidos de una API remota,
centrándose en campos específicos como la identificación del artículo, el título, el precio y la información de envío.
*/

module.exports = router;
