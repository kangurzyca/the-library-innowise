// wiring up theme button
const btnTheme = document.querySelector(".header__theme-button");
btnTheme.addEventListener("click", () => {
  if (btnTheme.textContent === "dark") {
    document.querySelector("body").classList.add("theme-dark");
    btnTheme.textContent = "light";
  } else {
    document.querySelector("body").classList.remove("theme-dark");
    btnTheme.textContent = "dark";
  }
});

// selecting the seartch button
const btnSearch = document.querySelector(".search__button");
btnSearch.addEventListener("click", handleSearchBar);

// declaring debounce variable for on-the-fly search
let debounceTimeout;

//selectind search bar input field and making it input sensitive to lock search button in case of no input
//openLIbrary lock request for searches shorter than three characters
const searchBar = document.querySelector(".search__input");
searchBar.addEventListener("input", (e) => {
  if (e.target.value.length > 2) {
    btnSearch.disabled = false;
  } else {
    btnSearch.disabled = true;
  }
  // added debouncer
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    handleSearchBar();
  }, 300);
});

// getting a placeholder pargraph that serves as a state broadcaster
const booksMessage = document.getElementById("books__message");
const itemName = "theLibraryMyFavedBooks";

//display faves in a sidebar if they exist
createBooksCards(readFavedBooks(), "small");

async function handleSearchBar() {
  setLoading(true);
  try {
    if (!searchBar.value) {
      throw new Error("No search phrase provided.");
    }
    const query = searchBar.value.replaceAll(" ", "%20"); // this unnecessary, openLibrary accepts something simpler, check it.
    const url = `https://openlibrary.org/search.json?q=${query}&limit=8`;
    const headers = new Headers({
      "User-Agent": "TheLibrary/0.1",
    });
    const options = {
      method: "GET",
      headers: headers,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      setLoading(false, "network");
      throw new Error("Request failed due to network error");
    }
    const data = await response.json();

    //remove filters created during previous search
    document
      .querySelectorAll(".filters__author-filter")
      .forEach((el) => el.remove());

    if (data.docs.length === 0) {
      setLoading(false, "no books");
      return;
    }
    //create book-cards
    createBooksCards(data.docs);
    setLoading(false);
    searchBar.value = ""
  } catch (error) {
    setLoading(false);
    console.error("error fetching data", error);
  } finally {
  }
}

function createBooksCards(booksArray, size) {
  if (!booksArray || booksArray.length === 0) {
    throw new Error("no books found");
  }

  let booksList = null;
  if (size && size === "small") {
    booksList = document.querySelector(".sidebar__list");
  } else {
    booksList = document.querySelector(".books__list");
  }

  booksList.innerHTML = `<li>loading books</li>`;
  booksList.innerHTML = ``;
  const bookCards = booksArray.map((el) => {
    // checking for data pieces to be falsey
    // asdfasdf - returns a book with no author and breaks .join() below
    let coverurl = null;
    let author = null;
    let title = null;
    let first_publish_year = null;
    if (size) {
      if (el.coverurl) {
        coverurl = el.coverurl;
      } else {
        coverurl = "no URL";
      }
      if (el.author) {
        author = el.author;
      } else {
        author = "no author";
      }
      if (el.title) {
        title = el.title;
      } else {
        title = "no title";
      }
      if (el.first_publish_year) {
        first_publish_year = el.first_publish_year;
      } else {
        first_publish_year = "no year";
      }
    } else {
      if (el.cover_i) {
        coverurl = `https://covers.openlibrary.org/b/id/${el.cover_i}.jpg`;
      } else {
        coverurl = "no URL";
      }
      if (el.author_name) {
        author = el.author_name.join(", ");
      } else {
        author = "no author";
      }
      if (el.title) {
        title = el.title;
      } else {
        title = "no title";
      }
      if (el.first_publish_year) {
        first_publish_year = el.first_publish_year;
      } else {
        first_publish_year = "no year";
      }
    }

    const favedClass = size ? "book-card__icon--faved" : "";

    booksList.innerHTML += `
       <li class="book-card"
       data-title="${el.title}" 
       data-author="${author}"
       data-first_publish_year="${el.first_publish_year}"
       data-coverurl="https://covers.openlibrary.org/b/id/${el.cover_i}.jpg">
          <button class="book-card__fave-button">
            <img class="book-card__icon ${favedClass}" src="./src/assets/heart.svg" alt="heart icon">
          </button>
          <img class="book-card__image" src="${coverurl}">
          <h3 class="book-card__title">${el.title}</h3>
          <p class="book-card__author">${author}</p>
          <p class="book-card__year">${el.first_publish_year}</p>
        </li>
    `; // template literal ends here!
  });
  booksList
    .querySelectorAll(".book-card__fave-button")
    .forEach((el) => el.addEventListener("click", (e) => faveTheBook(e)));

  // checking if fetched books contain already faved ones
  const favedBooks = readFavedBooks();
  booksList.querySelectorAll("li").forEach((li) => {
    //iterate over booksList items
    favedBooks.forEach((book) => {
      //for each booksList item iterate over faved
      if (
        book.title === li.dataset.title && // check if there is a match
        book.author === li.dataset.author &&
        book.first_publish_year === li.dataset.first_publish_year
      ) {
        li.querySelector(".book-card__icon").classList.add(
          "book-card__icon--faved",
        ); // add a faved class
      }
    });
  });

  // for main books list adding filtering buttons
  if (!size) {
    createAuthorFilters(booksList.querySelectorAll("li"));
  }
}
function faveTheBook(e) {
  // get faved books from localStorage
  let myFavedBooks = readFavedBooks();
  //remove item from localStorage before its updated and stored back
  localStorage.removeItem(itemName);

  //get data from a li element of booked to be faved
  const newFavedBook = {
    title: e.target.parentElement.dataset.title,
    author: e.target.parentElement.dataset.author,
    first_publish_year: e.target.parentElement.dataset.first_publish_year,
    coverurl: e.target.parentElement.dataset.coverurl,
  };
  // check if book to be faved is already stored in localStorage
  const isAlreadyStored = myFavedBooks.findIndex((book) => {
    return (
      book.title === newFavedBook.title &&
      book.author === newFavedBook.author &&
      book.first_publish_year === newFavedBook.first_publish_year
    );
  });

  //deciding whether to fave or not basing on findIndex return value => -1 if not found or actuall item index
  if (isAlreadyStored !== -1) {
    myFavedBooks.splice(isAlreadyStored, 1);
    e.target.querySelector("img").classList.remove("book-card__icon--faved");
  } else {
    myFavedBooks.push(newFavedBook);
    e.target.querySelector("img").classList.add("book-card__icon--faved");
  }
  //setting updated item in localStorage
  localStorage.setItem(itemName, JSON.stringify(myFavedBooks));
  // rerendering aside faved list
  createBooksCards(readFavedBooks(), "small");
}

function readFavedBooks() {
  let myFavedBooks = [];
  if (localStorage.getItem(itemName)) {
    myFavedBooks = [...JSON.parse(localStorage.getItem(itemName))];
  }
  return myFavedBooks;
}

// laoding state function
function setLoading(isLoading, type) {
  if (isLoading) {
    //delete current booksList if a new search is called
    document.querySelector(".books__list").innerHTML = "";
    //show a booksMessage message
    booksMessage.style.display = "block";
    booksMessage.textContent = "Loading books, please wait.";
    btnSearch.disabled = true;
  } else if (!isLoading && !type) {
    //hide loading message
    booksMessage.style.display = "none";
    btnSearch.disabled = false;
  } else if (!isLoading && type === "no books") {
    booksMessage.style.display = "block";
    booksMessage.textContent =
      "No books found, try searching for something else.";
    btnSearch.disabled = false;
  } else if (!isLoading && type === "network") {
    booksMessage.style.display = "block";
    booksMessage.textContent =
      "Search failed due to network error, please try again.";
    btnSearch.disabled = false;
  }
}

//to filter by author lets gather all displayed authors and create buttons with their names
// once button is clicked all book-cards are hidden except those that realte to the clicked button
function createAuthorFilters(hmtlCollectionArg) {
  //return if empty or undefined
  if (!hmtlCollectionArg || Array.from(hmtlCollectionArg).length === 0) {
    console.log("no filters created due to no books available");
    return;
  }
  //make an array from querySelectorAll output
  const booksArray = Array.from(hmtlCollectionArg);

  //get filters block
  const filtersBlock = document.querySelector(".books__filters");

  //go over booksArray and push an author to authorsArray
  let authorsArray = booksArray.map((book, index, array) => {
    //check for duplicates in original array by finding a first index of author occurance
    //if the found index is not the same as index of an author currently mapped over then it is a duplicate
    const isDuplicate =
      array.findIndex((el) => el.dataset.author === book.dataset.author) !==
      index;
    if (isDuplicate) {
      return;
    }
    return book.dataset.author;
  });
  //removing undefined created by early return from map()
  //using Boolean() function to differnetiate valid strings from falsey values => undefined's
  authorsArray = authorsArray.filter(Boolean);

  //filtering only one author doesn't make sense => early return
  if (authorsArray.length < 2) {
    return;
  }

  //create buttons with author names
  const buttonsArray = authorsArray.map((author) => {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("filters__author-filter", "button");
    button.value = author;
    button.textContent = author;
    button.dataset.selected = "false";

    // adding an EvenListener to the button
    button.addEventListener("click", (e) => {
      //getting all book from a booklist omitting getting the sidebar book-cards
      const allOtherBooks = document.querySelectorAll(
        `.books__list .book-card`,
      );
      allOtherBooks.forEach((el) => el.classList.add("book-card--hidden"));

      //having target value I can select all list items with this value within dataset
      const matchedBooks = document.querySelectorAll(
        `[data-author="${e.target.value}"]`,
      );

      // changing button selected state
      if (e.target.dataset.selected === "false") {
        e.target.dataset.selected = "true";
        e.target.classList.add("filters__author-filter--selected");
      } else if (e.target.dataset.selected === "true") {
        e.target.dataset.selected = "false";
        e.target.classList.remove("filters__author-filter--selected");
      }

      // every time I click a button I have to check which buttons are selected.
      const selectedButtons = Array.from(
        document.querySelectorAll("[data-selected='true']"),
      ).map((el) => el.value);

      //when no filters are selected then display all books
      if (selectedButtons.length === 0) {
        allOtherBooks.forEach((el) => el.classList.remove("book-card--hidden"));
      }

      // having a list of selected authors I can hide all books that are not on the list
      // iterating over two arrays
      selectedButtons.forEach((btn) => {
        allOtherBooks.forEach((book) => {
          if (btn === book.dataset.author) {
            book.classList.remove("book-card--hidden");
          }
        });
      });
    });
    filtersBlock.appendChild(button);
  });
}
