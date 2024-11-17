$(document).ready(function () {
    const API_URL = "https://www.googleapis.com/books/v1/volumes?q=";
    let searchResults = [];
    let currentView = 'grid'; // Default to grid view
    let bookshelfLoaded = false;

    console.log("app.js loaded");

    // Search functionality
    $('#search-btn').click(function () {
        const searchTerm = $('#search-term').val().trim();
        if (searchTerm) {
            searchBooks(searchTerm);
        } else {
            alert('Please enter a search term');
        }
    });

    // Toggle bookshelf visibility
    $('#bookshelf-btn').click(function () {
        $('#bookshelf-section').slideToggle();

        if (!bookshelfLoaded) {
            loadBookshelf();
            bookshelfLoaded = true;
        }
    });

    // View Switcher (Grid/List)
    $('#grid-view-btn').click(function () {
        currentView = 'grid';
        $('#search-results').removeClass('list-view').addClass('grid-view');
        renderSearchResults(searchResults, 0);
    });

    $('#list-view-btn').click(function () {
        currentView = 'list';
        $('#search-results').removeClass('grid-view').addClass('list-view');
        renderSearchResults(searchResults, 0);
    });

    // Load public bookshelf
    function loadBookshelf() {
        const apiUrl = 'https://www.googleapis.com/books/v1/users/101245217956101178977/bookshelves/0/volumes';

        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                const books = data.items || [];
                displayBookshelf(books);
            },
            error: function () {
                alert('An error occurred while fetching your public bookshelf.');
            }
        });
    }

    // Display bookshelf
    function displayBookshelf(books) {
        const bookshelfDiv = $('#bookshelf');
        bookshelfDiv.empty();

        const template = $("#grid-template").html(); // Use grid template for bookshelf
        const rendered = Mustache.render(template, {
            books: books.map(book => ({
                id: book.id,
                title: book.volumeInfo?.title || 'No title available',
                thumbnail: (book.volumeInfo && book.volumeInfo.imageLinks)
                    ? book.volumeInfo.imageLinks.thumbnail
                    : 'no_image.png'
            }))
        });
        bookshelfDiv.html(rendered);

        // Attach click event for book details
        $('#bookshelf').off('click').on('click', '.details-btn', function () {
            const bookId = $(this).data('id');
            showBookDetailsModal(bookId);
        });
    }

    // Search books
    function searchBooks(searchTerm) {
        const apiUrl = `${API_URL}${encodeURIComponent(searchTerm)}&maxResults=40`;

        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                if (data.items && data.items.length > 0) {
                    searchResults = data.items;
                    renderSearchResults(searchResults, 0);
                    setupPagination(searchResults);
                } else {
                    $('#search-results').empty();
                    $('#pagination').empty();
                    alert('No books found for the given search term.');
                }
            },
            error: function () {
                alert('An error occurred while fetching data from the Google Books API.');
            }
        });
    }

    // Render search results
    function renderSearchResults(books, startIndex) {
        const resultsDiv = $('#search-results');
        resultsDiv.empty(); // Clear all results

        const templateId = currentView === 'grid' ? '#grid-template' : '#list-template';
        const template = $(templateId).html();
        const displayedBooks = books.slice(startIndex, startIndex + 10).map(book => ({
            id: book.id,
            title: book.volumeInfo?.title || 'No title available',
            author: (book.volumeInfo && book.volumeInfo.authors)
                ? book.volumeInfo.authors.join(', ')
                : 'Unknown Author',
            thumbnail: (book.volumeInfo && book.volumeInfo.imageLinks)
                ? book.volumeInfo.imageLinks.thumbnail
                : 'no_image.png',
            description: book.volumeInfo?.description || 'No description available'
        }));

        const rendered = Mustache.render(template, { books: displayedBooks });
        resultsDiv.html(rendered);

        // Clear any previously shown details
        $('.book-details').remove();

        // Attach click event for View Details button
        $('#search-results').off('click').on('click', '.details-btn', function () {
            const bookId = $(this).data('id');
            showBookDetails(bookId, $(this).closest('.book-item'));
        });
    }

    // Setup pagination
    function setupPagination(books) {
        const paginationDiv = $('#pagination');
        paginationDiv.empty();

        const totalPages = Math.ceil(books.length / 10);
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = `<button class="page-btn" data-page="${i}">${i}</button>`;
            paginationDiv.append(pageButton);
        }

        $('#pagination').off('click').on('click', '.page-btn', function () {
            const pageNumber = $(this).data('page');
            const startIndex = (pageNumber - 1) * 10;
            renderSearchResults(books, startIndex);
        });
    }

    // Show book details
    function showBookDetails(bookId, bookItemDiv) {
        const bookDetailsDiv = bookItemDiv.find('.book-details');

        // If the details are already visible, hide them
        if (bookDetailsDiv.is(':visible')) {
            bookDetailsDiv.slideUp();
            return;
        }

        // Fetch book details
        const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (book) {
                const title = book.volumeInfo?.title || 'No title available';
                const authors = (book.volumeInfo && book.volumeInfo.authors)
                    ? book.volumeInfo.authors.join(', ')
                    : 'Unknown Author';
                const description = book.volumeInfo?.description || 'No description available';

                // Add details below the clicked book
                const detailsHtml = `
                    <div class="book-details">
                        <p><strong>Authors:</strong> ${authors}</p>
                        <p>${description}</p>
                    </div>
                `;

                // Append and show the details
                bookItemDiv.find('.book-details').remove(); // Remove any existing details
                bookItemDiv.append(detailsHtml);
                bookItemDiv.find('.book-details').slideDown();
            },
            
        });
    }
});


// View Switcher
$('#grid-view-btn').on('click', function() {
    $('#search-results').removeClass('list-view').addClass('grid-view');
    renderBooks('grid'); // Re-render using grid template
});

$('#list-view-btn').on('click', function() {
    $('#search-results').removeClass('grid-view').addClass('list-view');
    renderBooks('list'); // Re-render using list template
});

// Function to render books
function renderBooks(view) {
    const templateId = view === 'grid' ? '#grid-template' : '#list-template';
    const template = $(templateId).html();
    const rendered = Mustache.render(template, { books: currentBooks }); // 'currentBooks' holds the latest search results
    $('#search-results').html(rendered);
}


// Event listener for "View Details" button click
$(document).on("click", ".details-btn", function() {
    const bookId = $(this).closest('.book-grid-item, .book-list-item').data("id");
    console.log("Book ID:", bookId); // Log the bookId for debugging

    if (!bookId) {
        console.error("Error: Missing book ID.");
        alert("An error occurred: Missing book ID.");
        return;
    }

    const detailsContainer = $(this).siblings('.book-details-container');
    if (detailsContainer.length > 0) {
        // If details are already shown, remove them
        detailsContainer.remove();
        console.log("Details hidden for book ID:", bookId);
    } else {
        // Otherwise, fetch and display details
        showBookDetailsOnButtonClick(bookId, this);
    }
});

// Function to fetch and display book details
function showBookDetailsOnButtonClick(bookId, buttonElement) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
    console.log("API Request URL:", apiUrl); // Log API URL

    $.ajax({
        url: apiUrl,
        method: "GET",
        success: function(data) {
            console.log("API Response:", data); // Log the API response

            if (!data || !data.volumeInfo) {
                console.error("Error: Missing volumeInfo in API response.");
                alert("An error occurred: Invalid API response.");
                return;
            }

            const rawDescription = data.volumeInfo.description || "No description available";
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = rawDescription;
            const sanitizedDescription = tempDiv.textContent || tempDiv.innerText || "No description available";

            const detailsHtml = `
                <div class="book-details-container">
                    <p><strong>Author:</strong> ${(data.volumeInfo.authors || []).join(', ') || "Unknown Author"}</p>
                    <p><strong>Published Date:</strong> ${data.volumeInfo.publishedDate || "N/A"}</p>
                    <p><strong>Description:</strong> ${sanitizedDescription}</p>
                    ${
                        data.volumeInfo.imageLinks
                            ? `<img src="${data.volumeInfo.imageLinks.thumbnail}" alt="${data.volumeInfo.title}">`
                            : ""
                    }
                </div>
            `;

            $(buttonElement).after(detailsHtml); // Append details
            console.log("Details displayed for book ID:", bookId);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("API Request Failed:", textStatus, errorThrown); // Log error details
            alert("An error occurred while fetching book details. Please try again.");
        }
    });
}
