const btnSearch = document.querySelector(".search__button");
btnSearch.addEventListener("click", handleSearchBar);

async function handleSearchBar() {
  const searchBar = document.querySelector(".search__input");
  if (!searchBar.value) {
    console.log("provide search phrase");
    throw new Error("no search phrase provided", { cause: err });
  }
  const query = searchBar.value.replaceAll(" ", "%20");

  const url = `https://openlibrary.org/search.json?q=${query}&limit=8`;
  const headers = new Headers({
    "User-Agent": "TheLibrary/0.1",
  });
  const options = {
    method: "GET",
    headers: headers,
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      createBooksCards(data.docs);
      console.log(data.docs[3].cover_i);
    })
    .catch((error) => console.error("Error:", error));
}

function createBooksCards(booksArray, size) {
  if (!booksArray || booksArray.length === 0) {
    throw new Error("no books found", { cause: err });
  }

  let booksList = null;
  if (size && size === "small") {
    booksList = document.querySelector(".sidebar");
  } else {
    booksList = document.querySelector(".books__list");
  }

  booksList.innerHTML = `<li>loading books</li>`;
  booksList.innerHTML = ``;
  const bookCards = booksArray.map((el) => {
    booksList.innerHTML += `
       <li class="book-card">
          <img class="book-card__faveIcon" src="./src/assets/heart.svg" alt="heart icon">
        <img class="book-card__image" src="https://covers.openlibrary.org/b/id/${el.cover_i}.jpg">
         <h3 class="book-card__title">${el.title}</h3>
          <p class="book-card__author">${el.author_name[0]}</p>
          <p class="book-card__date">${el.first_publish_year}</p>
         </li>
    `;
  });
}
