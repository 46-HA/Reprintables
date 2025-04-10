// JavaScript to handle vertical scroll triggering horizontal scroll
let lastScrollTop = 0; // Keeps track of the previous scroll position

window.addEventListener('scroll', function () {
    let currentScroll = window.scrollY; // Get current scroll position

    // Calculate scroll delta
    let delta = currentScroll - lastScrollTop;

    if (delta > 0) {
        // Scroll down - move content left
        document.querySelector('.scrolling-content').style.transform = `translateX(-${currentScroll}px)`;
    } else {
        // Scroll up - move content right
        document.querySelector('.scrolling-content').style.transform = `translateX(-${currentScroll}px)`;
    }

    // Update lastScrollTop to current scroll position
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});
