import './home.scss';

for (const element of document.querySelectorAll('[data-colorizer]')) {
    element.addEventListener('click', () => {
        element.style.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    });
}
