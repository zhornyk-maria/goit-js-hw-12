import axios from 'axios';

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

const PAGE_SIZE = 15;
const API_KEY = '42335875-35ce8b2853e0e3d6760ada5fc';
const BASE_URL = `https://pixabay.com/api/?key=${API_KEY}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${PAGE_SIZE}`;
const form = document.querySelector('.js-search-form');
const gallery = document.querySelector('.js-gallery');
const loadMoreBtn = document.querySelector(".load-more");
const loader = document.querySelector(".loader");
let currentPage = 1;
let currentQuery = null;
let totalPages = 1;

let lightbox = new SimpleLightbox('.gallery a');

function showError(msg) {
    iziToast.show({
        message: msg,
        messageColor: '#fff',
        position: 'topRight',
        backgroundColor: '#ef4040',
        animateInside: false,
        color: '#fff'
    });
}

async function getImages(query, page) {
    let markup = '';
    try {
        const url = `${BASE_URL}&q=${encodeURIComponent(query)}&page=${page}`;
        const response = await axios.get(url);
        const data = response.data;

        if (!data || data.hits.length === 0) {
            showError("Sorry, there are no images matching your search query. Please try again!");
            gallery.innerHTML = '';
            return;
        }

        totalPages = Math.ceil(data.totalHits / PAGE_SIZE);

        markup = data.hits.map(image => {
            return `<a href="${image.largeImageURL}">
                <img src="${image.webformatURL}">
                <div>
                    <span>likes<br>${image.likes}</span>
                    <span>views<br>${image.views}</span>
                    <span>comments<br>${image.comments}</span>
                    <span>downloads<br>${image.downloads}</span>
                </div>
            </a>`
        }).join('');
    } catch (e) {
        showError(e.message);
        gallery.innerHTML = '';
    }
    return markup;
}

function smoothScroll() {
    const galleryLinks = document.querySelectorAll('.gallery a');
    const cardHeight = galleryLinks.length > 0 ? galleryLinks[0].getBoundingClientRect().height : 0;
    window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
}


form.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const query = formData.get('search-input').trim();

    if (!query) {
        showError("Sorry, there are no images matching your search query. Please try again!");
        gallery.innerHTML = '';
        currentQuery = null;
        return;
    }

    loader.classList.remove('hidden');
    
    currentQuery = query;
    currentPage = 1;
    const markup = await getImages(query, currentPage);
    
    gallery.innerHTML = markup;
    lightbox.refresh();
    loader.classList.add('hidden');
    if (totalPages > 1) {
        loadMoreBtn.classList.remove('hidden');
    }
    
})

loadMoreBtn.addEventListener('click', async (e)=> {
    e.preventDefault();

    if (!currentQuery) {
        showError("Sorry, there are no images matching your search query. Please try again!");
        gallery.innerHTML = '';
        return;
    }

    loader.classList.remove('hidden');
    
    currentPage += 1;
    if (currentPage <= totalPages) {
        const markup = await getImages(currentQuery, currentPage);
    
        gallery.innerHTML += markup;
        lightbox.refresh();
        smoothScroll();
    } else {
        showError("We're sorry, but you've reached the end of search results.");
        loadMoreBtn.classList.add('hidden');
    }
    loader.classList.add('hidden');
    
})
