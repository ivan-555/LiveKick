// Zwischen den Seiten wechseln
const navbarLinks = document.querySelectorAll('.navbar span');
const pages = document.querySelectorAll('.page');
const navbarHighlight = document.querySelector('.navbar .highlight');

navbarLinks.forEach((link, index) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute('data-target');
    pages.forEach(page => {
      page.classList.remove('active');
      if (page.classList.contains(target)) {
        page.classList.add('active');
      }
    });

    navbarLinks.forEach(link => link.classList.remove('active'));
    link.classList.add('active');
  });
});


// Zwischen den Ligen wählen
const ligaSelektors = document.querySelectorAll('.liga-selektor');

ligaSelektors.forEach(selector => {
  selector.addEventListener("click", () => {
    const target = selector.getAttribute('data-target');
    pages.forEach(page => {
      page.classList.remove('active');
      if (page.classList.contains(target)) {
        page.classList.add('active');
      }
    });
  });
});


// In der Liga zwischen den Slides wechseln
const ligaPages = document.querySelectorAll('.page.liga');

ligaPages.forEach((ligaPage) => {
  const ligaSlider = ligaPage.querySelector('.slider');
  const ligaSlideButtons = ligaPage.querySelectorAll('.slide-button');

  ligaSlideButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      ligaSlider.style.transform = `translateX(-${index * 100}%)`;

      ligaSlideButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
});


// Bei klick auf die Liga wird die Liga Seite angezeigt
function showLigaPage (ligaTarget) {
  pages.forEach(page => {
    page.classList.remove('active');
    if (page.classList.contains(ligaTarget)) {
      page.classList.add('active');
    }
  });
  navbarLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-target') === "ligen") {
      link.classList.add('active');
    }
  });
};