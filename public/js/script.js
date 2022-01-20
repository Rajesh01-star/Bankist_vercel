"use strict";

///////////////////////////////////////
// Modal window

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".btn--close-modal");
const btnsOpenModal = document.querySelectorAll(".btn--show-modal");
const btnScrollTo = document.querySelector(".btn--scroll-to");
const section1 = document.querySelector("#section--1");
const tabs = document.querySelectorAll(".operations__tab");
const tabsContainer = document.querySelector(".operations__tab-container");
const tabsContent = document.querySelectorAll(".operations__content");
const navbar = document.querySelector(".nav");
const allSections = document.querySelectorAll(".section");
const allImages = document.querySelectorAll("img[data-src]");
// slider components
const rightBtn = document.querySelector(".slider__btn--right");
const leftBtn = document.querySelector(".slider__btn--left");
const allSlides = document.querySelectorAll(".slide");
const dotContainer = document.querySelector(".dots");

const openModal = function (e) {
  // e.preventDefault();
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

// btnsOpenModal.forEach(btn => {
//   btn.addEventListener('click', openModal);
// });

btnCloseModal.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

// LearnMore smooth scrolling
btnScrollTo.addEventListener("click", function (e) {
  section1.scrollIntoView({ behavior: "smooth" });
});

// scroll to different page parts
document.querySelectorAll(".nav__link").forEach((each) => {
  each.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.classList.contains("nav__link")) {
      const id = e.target.getAttribute("href");
      const position = document.querySelector(id);
      position.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// tabbed component showing and content displaying
tabsContainer.addEventListener("click", (e) => {
  const clicked = e.target.closest(".operations__tab");

  // guard clause
  if (!clicked) return;

  //removing the active classes
  tabs.forEach((tab) => tab.classList.remove("operations__tab--active"));
  tabsContent.forEach((each) =>
    each.classList.remove("operations__content--active")
  );

  //adding the active class to both the tab and the content with the matching key
  clicked.classList.add("operations__tab--active");
  const key = clicked.dataset.tab;
  const info = document.querySelector(`.operations__content--${key}`);
  info.classList.add("operations__content--active");
});

// controlling the opacity of the links on hover
const handler = function (e) {
  if (e.target.classList.contains("nav__link")) {
    const link = e.target;

    const siblings = e.target
      .closest(".nav__links")
      .querySelectorAll(".nav__link");

    const logo = e.target.closest(".nav").querySelector("img");

    siblings.forEach((el) => {
      if (el != link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};
navbar.addEventListener("mouseover", handler.bind(0.5));
navbar.addEventListener("mouseout", handler.bind(1));

// sticky nav using intersectionObserver
const header = document.querySelector(".header");
const headTop = navbar.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) navbar.classList.add("sticky");
  else navbar.classList.remove("sticky");
};
const observer = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${headTop}px`,
});

observer.observe(header);

// section revealing
const revealCallBack = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;
  else entry.target.classList.remove("section--hidden");

  // unobserving the target section
  observer.unobserve(entry.target);
};

const revealObserver = new IntersectionObserver(revealCallBack, {
  root: null,
  threshold: 0.15,
});

// observing and adding the hidden class to all the sections
allSections.forEach((section) => {
  revealObserver.observe(section);
  // section.classList.add('section--hidden');
});

// lazy loading images
const imgFunction = function (entries, observer) {
  const [entry] = entries;

  // guard clause
  if (!entry.isIntersecting) return;
  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener("load", function () {
    entry.target.classList.remove("lazy-img");
  });

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(imgFunction, {
  root: null,
  threshold: 0,
  rootMargin: "-200px",
});

allImages.forEach((every) => {
  imgObserver.observe(every);
});

// slider component
let curSlide = 0;
allSlides.forEach((slide, i) => {
  slide.style.transform = `translateX(${100 * i}%)`;
  dotContainer.insertAdjacentHTML(
    "beforeend",
    `<button class = "dots__dot" data-slide= ${i}></button>`
  );
});

// goTo slide
const goToSlide = function (nowSlide) {
  allSlides.forEach((slide, i) => {
    slide.style.transform = `translateX(${100 * (i - nowSlide)}%)`;
    indicator(nowSlide);
  });
};

// const next slide
const nextSlide = function () {
  if (curSlide == allSlides.length - 1) curSlide = 0;
  else curSlide++;
  goToSlide(curSlide);
};

const prevSlide = function () {
  if (curSlide == 0) curSlide = allSlides.length - 1;
  else curSlide--;
  goToSlide(curSlide);
};

rightBtn.addEventListener("click", nextSlide);
leftBtn.addEventListener("click", prevSlide);

document.addEventListener("keydown", function (e) {
  if (e.key == "ArrowLeft") prevSlide();
  else if (e.key == "ArrowRight") nextSlide();
});

// event Listener
dotContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("dots__dot")) {
    goToSlide(e.target.dataset.slide);
    indicator(e.target.dataset.slide);
  }
});

const indicator = function (slideNumber) {
  document
    .querySelectorAll(".dots__dot")
    .forEach((each) => each.classList.remove("dots__dot--active"));

  document
    .querySelector(`.dots__dot[data-slide="${slideNumber}"]`)
    .classList.add("dots__dot--active");
};
indicator(0);
