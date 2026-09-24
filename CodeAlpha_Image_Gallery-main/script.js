const works = [...document.querySelectorAll(".work")];
const categories = [...document.querySelectorAll(".category")];
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const resetSearch = document.querySelector("#resetSearch");
const favoriteCount = document.querySelector("#favoriteCount");

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxCategory = document.querySelector("#lightboxCategory");
const lightboxCounter = document.querySelector("#lightboxCounter");
const closeLightbox = document.querySelector("#closeLightbox");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");

let selectedCategory = "all";
let searchTerm = "";
let visibleWorks = [];
let currentPosition = 0;
let favorites = new Set();

const collection = works.map((work) => ({
    index: Number(work.dataset.index),
    title: work.dataset.title,
    category: work.dataset.category,
    image: work.querySelector("img").src,
    alt: work.querySelector("img").alt
}));

function updateCollection() {
    visibleWorks = [];

    works.forEach((work, index) => {
        const categoryMatch =
            selectedCategory === "all" ||
            work.dataset.category === selectedCategory;

        const text = `${work.dataset.title} ${work.dataset.category}`.toLowerCase();
        const searchMatch = text.includes(searchTerm);

        const visible = categoryMatch && searchMatch;

        work.classList.toggle("filtered-out", !visible);

        if (visible) {
            visibleWorks.push(index);
        }
    });

    emptyState.classList.toggle("visible", visibleWorks.length === 0);
}

function updateFavorites() {
    favoriteCount.textContent = favorites.size;

    works.forEach((work, index) => {
        const button = work.querySelector(".favorite");
        const saved = favorites.has(index);

        button.classList.toggle("saved", saved);
        button.textContent = saved ? "♥" : "♡";
        button.setAttribute(
            "aria-label",
            saved ? "Remove from favorites" : "Add to favorites"
        );
    });
}

function openLightbox(workIndex) {
    const position = visibleWorks.indexOf(workIndex);

    if (position === -1) {
        return;
    }

    currentPosition = position;
    renderLightbox();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function renderLightbox() {
    const workIndex = visibleWorks[currentPosition];
    const item = collection[workIndex];

    lightboxImage.src = item.image;
    lightboxImage.alt = item.alt;
    lightboxTitle.textContent = item.title;
    lightboxCategory.textContent = item.category;
    lightboxCounter.textContent = `${String(currentPosition + 1).padStart(2, "0")} / ${String(visibleWorks.length).padStart(2, "0")}`;
}

function closeGallery() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function moveGallery(direction) {
    if (visibleWorks.length < 2) {
        return;
    }

    currentPosition =
        (currentPosition + direction + visibleWorks.length) %
        visibleWorks.length;

    renderLightbox();
}

categories.forEach((button) => {
    button.addEventListener("click", () => {
        categories.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        selectedCategory = button.dataset.filter;
        updateCollection();
    });
});

searchInput.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    updateCollection();
});

works.forEach((work, index) => {
    work.querySelector(".image-button").addEventListener("click", () => {
        openLightbox(index);
    });

    work.querySelector(".favorite").addEventListener("click", (event) => {
        event.stopPropagation();

        if (favorites.has(index)) {
            favorites.delete(index);
        } else {
            favorites.add(index);
        }

        updateFavorites();
    });
});

resetSearch.addEventListener("click", () => {
    selectedCategory = "all";
    searchTerm = "";
    searchInput.value = "";

    categories.forEach((item) => item.classList.remove("active"));
    categories[0].classList.add("active");

    updateCollection();
});

closeLightbox.addEventListener("click", closeGallery);
previousButton.addEventListener("click", () => moveGallery(-1));
nextButton.addEventListener("click", () => moveGallery(1));

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        closeGallery();
    }
});

document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) {
        return;
    }

    if (event.key === "Escape") {
        closeGallery();
    }

    if (event.key === "ArrowLeft") {
        moveGallery(-1);
    }

    if (event.key === "ArrowRight") {
        moveGallery(1);
    }
});

let touchStart = 0;

lightbox.addEventListener("touchstart", (event) => {
    touchStart = event.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener("touchend", (event) => {
    const touchEnd = event.changedTouches[0].screenX;
    const distance = touchEnd - touchStart;

    if (Math.abs(distance) > 55) {
        moveGallery(distance > 0 ? -1 : 1);
    }
}, { passive: true });

updateCollection();
updateFavorites();
