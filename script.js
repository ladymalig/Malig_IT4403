$(document).ready(function () {
    // Book search functionality
    $('#search-btn').click(function () {
        var searchTerm = $('#search-term').val();
        var url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=60`;

        // Clear previous results
        $('#results').html('');

        $.getJSON(url, function (data) {
            var results = '';
            if (data.items && data.items.length > 0) {
                $.each(data.items, function (index, book) {
                    var bookId = book.id;
                    var title = book.volumeInfo.title;
                    var thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : 'no-image.jpg';
                    results += `<div>
                                <img src="${thumbnail}" alt="${title}">
                                <a href="bookinfo.html?id=${bookId}">${title}</a>
                              </div>`;
                });
                $('#results').html(results);
            } else {
                $('#results').html('<p>No results found</p>');
            }
        }).fail(function () {
            // Error handling for failed request
            $('#results').html('<p>Error fetching data. Please try again later.</p>');
        });
    });

    // Book details page functionality
    if (window.location.pathname.includes('bookinfo.html')) {
        var urlParams = new URLSearchParams(window.location.search);
        var bookId = urlParams.get('id');
        var url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

        $.getJSON(url, function (data) {
            var details = `<h2>${data.volumeInfo.title}</h2>
                           <p><strong>Authors:</strong> ${data.volumeInfo.authors ? data.volumeInfo.authors.join(', ') : 'N/A'}</p>
                           <p><strong>Publisher:</strong> ${data.volumeInfo.publisher ? data.volumeInfo.publisher : 'N/A'}</p>
                           <p><strong>Published Date:</strong> ${data.volumeInfo.publishedDate ? data.volumeInfo.publishedDate : 'N/A'}</p>
                           <p><strong>Description:</strong> ${data.volumeInfo.description ? data.volumeInfo.description : 'No description available'}</p>
                           <img src="${data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'no-image.jpg'}" alt="${data.volumeInfo.title}">`;
            $('#book-details').html(details);
        }).fail(function () {
            $('#book-details').html('<p>Error fetching book details. Please try again later.</p>');
        });
    }

    // Fetch books from the public bookshelf
    if (window.location.pathname.includes('bookshelf.html')) {
        var bookshelfId = 'YOUR_BOOKSHELF_ID'; // Replace with your actual bookshelf ID
        var userId = 'YOUR_USER_ID'; // Replace with your actual Google Books user ID
        var url = `https://www.googleapis.com/books/v1/users/${userId}/bookshelves/${bookshelfId}/volumes`;

        $.getJSON(url, function (data) {
            var books = '';
            if (data.items && data.items.length > 0) {
                $.each(data.items, function (index, book) {
                    var title = book.volumeInfo.title;
                    var thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : 'no-image.jpg';
                    books += `<div>
                                <img src="${thumbnail}" alt="${title}">
                                <a href="bookinfo.html?id=${book.id}">${title}</a>
                              </div>`;
                });
                $('#bookshelf').html(books);
            } else {
                $('#bookshelf').html('<p>No books in this bookshelf.</p>');
            }
        }).fail(function () {
            $('#bookshelf').html('<p>Error fetching bookshelf data. Please try again later.</p>');
        });
    }
});
console.log("Script loaded successfully.");
