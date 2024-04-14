// Declare the storage for all the movie tickets available in the theater
const movieDB = "http://localhost:3000/films";

// What happens when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadMovies();
    // Add event listener for the buy-ticket button
    document.querySelector("#buy-ticket").addEventListener("click", handleTicketPurchase);
});

function loadMovies() {
    fetch(movieDB)
        .then(res => res.json())
        .then(movies => {
            movies.forEach(movie => {
                displayMovie(movie);
            });
            // Display details of the first movie
            const firstMovie = document.querySelector("#id1");
            firstMovie.dispatchEvent(new Event("click"));
        })
        .catch(error => {
            console.error('Error loading movies:', error);
        });
}

function displayMovie(movie) {
    const movieListItem = document.createElement("li");
    movieListItem.textContent = `${movie.title}`;
    movieListItem.id = "id" + movie.id;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.style.float = "right"; // Align to the right
    deleteButton.style.color = "red"; // Set color to red
    deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        removeMovie(movie.id);
    });
    
    movieListItem.appendChild(deleteButton);

    const movieList = document.querySelector("#films");
    movieList.appendChild(movieListItem);
    movieListItem.classList.add("film");
    movieListItem.classList.add('item');
    movieListItem.addEventListener("click", () => { handleMovieClick(movie) });
}


function removeMovie(movieId) {
    fetch(`${movieDB}/${movieId}`, {
        method: "DELETE",
    })
    .then(response => {
        if (response.ok) {
            const movieElement = document.querySelector("#id" + movieId);
            movieElement.remove();
        } else {
            throw new Error('Failed to delete movie');
        }
    })
    .catch(error => {
        console.error('Error deleting movie:', error);
    });
}

function handleMovieClick(movie) {
    const poster = document.querySelector("img#poster")
    poster.src = movie.poster;
    poster.alt = movie.title;
    const info = document.querySelector("#showing");
    info.querySelector("#title").textContent = movie.title;
    info.querySelector("#runtime").textContent = movie.runtime + " minutes";
    info.querySelector("#film-info").textContent = movie.description;
    info.querySelector("#showtime").textContent = movie.showtime;
    const availableTickets = movie.capacity - movie.tickets_sold;
    const ticketNum = document.querySelector("#ticket-num");
    ticketNum.textContent = availableTickets + " remaining tickets";
    if (availableTickets === 0) {
        const buyTicketButton = document.querySelector("#buy-ticket");
        buyTicketButton.textContent = "Sold Out";
        buyTicketButton.disabled = true;
        const movieItem = document.querySelector(`#id${movie.id}`);
        movieItem.classList.add("sold-out");
    }
}

function handleTicketPurchase() {
    const ticketNum = document.querySelector("#ticket-num");
    const tickets = parseInt(ticketNum.textContent.split(" ")[0], 10);
  
    if (tickets > 0) {
        const updatedTickets = tickets - 1;
        ticketNum.textContent = updatedTickets + " remaining tickets";
        const movieId = document.querySelector("img#poster").dataset.movieId;
        updateTicketsSold(movieId, updatedTickets);
        postTicket(movieId);
    } else if (tickets === 0) {
        ticketNum.textContent = 'Sold Out';
        const buyTicketButton = document.querySelector("#buy-ticket");
        buyTicketButton.textContent = 'Sold Out'; 
        buyTicketButton.disabled = true; 
    }
}

function updateTicketsSold(movieId, updatedTickets) {
    fetch(`${movieDB}/${movieId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tickets_sold: updatedTickets
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update tickets_sold');
        }
    })
    .catch(error => {
        console.error('Error updating tickets_sold:', error);
    });
}

function postTicket(movieId) {
    fetch("http://localhost:3000/tickets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            film_id: movieId,
            number_of_tickets: 1
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to post ticket');
        }
    })
    .catch(error => {
        console.error('Error posting ticket:', error);
    });
}
