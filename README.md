# The Library

A responsive book search app built with **HTML**, **CSS**, and **JavaScript (ES6+)**. It uses **Open Library API** to obtain books data.

The app lets user search for books by title or authors. Selected books can be favorited and saved to browser's Local Storage. Saved books are kept by browser and available on each page load. For enhanced User Experience a UI theme switching is available.

App is deployed at:
https://the-library-innowise.netlify.app/

## TASK

The Library project was created for recruitement purposes.

Requriement overview:
- Build a book catalogue application using **JavaScript (ES6+)**
- Bundle source files with Webpack or Vite
- Use the free **Open Library API**
- Store favourite books in **Local Storage**
- Frameworks or third-party libraries are forbidden

Link to full requirements document:
https://drive.google.com/file/d/1swszcMU9rF_-zRJaA2VchPuU_d7yrAbs/view


## HOW TO RUN THE APP

### Local repository install

1. install dependencies:
npm install

2. run development server
npm run dev

3. create production build
npm run build

4. The production files will be available in the /dist folder.

### User Intarface overview

#### Header 

In the header of the app there is a UI theme switch provided. App loads in light theme, user can change theme to dark and back by clicking the switch.

#### Search

The app allows user to search book using keywords. Open Library uses keywords to return books with matched authors and titles. User provided key words won't be used to search over books contents.

Open Library limits search request to minimum three characters. The app won't request search unless at least three characters are typed into searchbar. User can observe that "search" button is disabled until the required amount of characters is provided.

For user's convinience On-The-Fly is implemented. After satisfying the three characters requirements app will request search on it's own. User doesn't have to click the Search button.

#### Books List

When user requests a search they observe Loading State message. When search resolves successfuly obtained books data is orginised and displayed on the screen in form of Book Cards. 

In scenario where no books are obtained user observes a message informing them that no book was found.

Displayed books can be saved to Favorites list by click a Heart icon in top right corner of each Book Card. Alternatively clicking a Heart icon again will remove selected book from Favorites list. User is notifed that book is on Favorite list by Heart icon changing color to red.

User can filter displayed books by author. Authors names of displayed books are gathered and organized at the top in form of Buttons. Clicking a button will reorganize displayed books leaving only those written by author whose name is written on the button. 

When displayed books are all written by the same author, no filtering buttons appear.


#### Favorites

Favorites List is displayed beneath found books list if on Mobile devices and on the right side of a screen if on Desktop devices.

In a Favorite List displayed are books that user faved before. To prevent loss Favorites List is stored in browser and therfore is retrieved upon page load.

User can remove books from Favorite List by clicking on a Heart Icon placed on the right side of Favorite Book Card. 

#### Footer

On the very bottom of the page there is a link to Open Library allowing to visit the data source feeding The Library application.


## Project Structure

Folder and file structure overview:

src/
├── assets/     => Icons
├── styles/     => Components styles
├── main.js     => App logic
├── style.css   => Main CSS merging other styles
└── index.html  => App entru point


## Error handling

- Loading state displayed on screen
- Empty input validation and search prevention
- Incorrect (too short) request prevention
- No results state displayed on screen
- Network error displayed on screen
- Loading book cover image placeholder
- Missing book cover image placeholder