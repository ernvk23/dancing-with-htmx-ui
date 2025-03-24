document.addEventListener('DOMContentLoaded', () => {
    function isiPhone() {
        return /iPhone/.test(navigator.userAgent) && !window.MSStream;
    }

    // Get root font size for rem calculation
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const links = document.querySelectorAll('.nav-links a[href^="#"], #logo-header, #qa-erip, #cta');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href') || '#home' || '#qa';
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Adjust the offset if your navbar has a different height
                const targetPosition = targetElement.offsetTop - rootFontSize * 4.5;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile navigation toggle
    const mobileNavToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.navbar-overlay');

    function toggleNav() {
        mobileNavToggle.classList.toggle('expanded');
        navLinks.classList.toggle('open');
        overlay.classList.toggle('show');
        // document.body.classList.toggle('no-scroll'); // Toggle no-scroll class on body
    }

    mobileNavToggle?.addEventListener('click', toggleNav);
    overlay?.addEventListener('click', toggleNav); // Optional chaining is good here

    // Close mobile nav when clicking nav links
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('open')) {
                toggleNav();
            }
        });
    });

    const logo = document.querySelector('#logo-header');

    logo.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
            toggleNav();
        }
    });

    const homeSection = document.getElementById('home');

    function setBackgroundImage() {
        const isMobile = window.innerWidth <= 768;
        const bgImage = isMobile ? homeSection.dataset.bgMobile : homeSection.dataset.bgDesktop;

        const img = new Image();
        img.src = bgImage;
        img.onload = function () {
            homeSection.style.backgroundImage = `url(${bgImage})`;
            homeSection.classList.add('loaded');
        };
    }

    setBackgroundImage();
    window.addEventListener('resize', setBackgroundImage);

    const imageContainers = document.querySelectorAll('.image-placeholder');

    imageContainers.forEach(container => {
        const img = container.querySelector('img');
        if (img.complete) {
            container.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                container.classList.add('loaded');
            }, { once: true });
        }
    });


    const lazyImages = document.querySelectorAll('.lazy-load');

    lazyImages.forEach(img => {
        const handleImageLoad = () => {
            img.classList.add('loaded');

            // Check if the image is associated with a lite-youtube element
            const liteYouTube = img.parentElement.parentElement;
            if (liteYouTube && liteYouTube.tagName === 'LITE-YOUTUBE') {
                console.log(liteYouTube);
                // Add a class to the lite-youtube element to make it interactive
                liteYouTube.classList.add('img-ready');
            }
        };

        if (img.complete) {
            // Image is already loaded, handle immediately
            handleImageLoad();
        } else {
            // Image is not loaded yet, add event listener
            img.addEventListener('load', handleImageLoad, { once: true });
        }
    });

    const contactButton = document.querySelector('.floating-contact-button');

    // Handle contact button clicks and outside clicks
    document.addEventListener('click', (event) => {
        if (contactButton.contains(event.target)) {
            // Click is inside the contact button, toggle the menu
            event.stopPropagation(); // Prevent immediate closing if clicking the button itself
            contactButton.classList.toggle('open');
        } else {
            // Click is outside the contact button, close the menu
            contactButton.classList.remove('open');
        }
    });

    let lastScrollY = window.scrollY;

    // Close the menu on scroll
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        // Check if the scroll distance is greater than 50px
        if (Math.abs(currentScrollY - lastScrollY) > 50) {
            // Collapse the contact button if open
            contactButton.classList.remove('open');

            // Collapse the navbar if the overlay is shown
            if (overlay.classList.contains('show')) {
                toggleNav();
            }

            // Update the last scroll position
            lastScrollY = currentScrollY;
        }
    });


    // Adjust image map coordinates on resize
    // Adjust image map coordinates on resize
    function adjustImageMap() {
        const image = document.querySelector('img[usemap="#map-directions"]');
        const areas = document.querySelectorAll('map[name="map-directions"] area');
        const originalWidth = 1400;
        const originalHeight = 882;

        if (!image || !areas.length) {
            return;
        }

        function updateCoords() {
            // Ensure image dimensions are accurate
            if (image.width === 0 || image.height === 0) return;

            const currentWidth = image.width;
            const currentHeight = image.height;
            const scaleX = currentWidth / originalWidth;
            const scaleY = currentHeight / originalHeight;

            areas.forEach(area => {
                const originalCoords = area.dataset.originalCoords.split(',');
                const newCoords = originalCoords.map((coord, index) => {
                    // More robust rounding
                    return Math.round(parseFloat(coord) * (index % 2 === 0 ? scaleX : scaleY));
                }).join(',');
                area.coords = newCoords;
            });
        }

        // Store original coordinates only after the image has loaded
        image.addEventListener('load', () => {
            areas.forEach(area => {
                area.dataset.originalCoords = area.coords;
            });
            updateCoords(); // Update immediately after storing original coords
        }, { once: true });

        window.addEventListener('resize', debounce(updateCoords, 250));
    }

    // Debounce function (custom, optimized)
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Call adjustImageMap after DOMContentLoaded
    adjustImageMap();


    //Navbar border shadow when scrolling
    const navbar = document.querySelector('.navbar');

    function toggleNavbarShadow() {
        if (window.scrollY > 0) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', toggleNavbarShadow);

    // Call once on load to set initial state
    toggleNavbarShadow();


    if (isiPhone()) {
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.style.backgroundAttachment = 'scroll';
        }
    }

    // Carousel functionality
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        const container = carousel.querySelector('.carousel-container');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        const prevButton = carousel.querySelector('.prev');
        const nextButton = carousel.querySelector('.next');
        let currentIndex = 0;
        let autoplayTimer;
        let touchStartX = 0;
        let touchEndX = 0;
        let isTransitioning = false;
        const transitionDelay = 200; // Reduced from 500ms to 250ms for quicker transitions

        // Set initial state
        slides[0].classList.add('active');

        // Create dots based on number of slides
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        // Ensure smooth transitions
        function goToSlide(index) {
            if (isTransitioning || index === currentIndex) return;
            isTransitioning = true;

            // Remove all special classes first
            slides.forEach(slide => {
                slide.classList.remove('active', 'adjacent');
            });
            dots[currentIndex].classList.remove('active');

            // Add active class to current slide
            slides[index].classList.add('active');
            dots[index].classList.add('active');

            // Add adjacent class to neighboring slides
            if (index > 0) {
                slides[index - 1].classList.add('adjacent');
            }
            if (index < slides.length - 1) {
                slides[index + 1].classList.add('adjacent');
            }

            container.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            resetAutoplay();
            updateCarouselButtons();

            setTimeout(() => {
                isTransitioning = false;
            }, transitionDelay);
        }

        function nextSlide() {
            if (isTransitioning) return;
            const next = (currentIndex + 1) % slides.length;
            goToSlide(next);
        }

        function prevSlide() {
            if (isTransitioning) return;
            const prev = (currentIndex - 1 + slides.length) % slides.length;
            goToSlide(prev);
        }

        function resetAutoplay() {
            clearTimeout(autoplayTimer);
            autoplayTimer = setTimeout(() => {
                nextSlide();
            }, 3000); // Change slides every 5 seconds
        }

        function updateCarouselButtons() {
            // Always enable both buttons to allow circular navigation
            prevButton.disabled = false;
            nextButton.disabled = false;
        }

        // Touch events for mobile swipe
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            clearTimeout(autoplayTimer);
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!touchStartX) return;

            const currentX = e.touches[0].clientX;
            const diff = touchStartX - currentX;
            const movePercent = (diff / container.offsetWidth) * 100;

            // Prevent overscroll
            if ((currentIndex === 0 && diff < 0) ||
                (currentIndex === slides.length - 1 && diff > 0)) return;

            container.style.transform = `translateX(${-currentIndex * 100 - movePercent}%)`;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 10) { // Minimum swipe distance
                if (diff > 0) nextSlide();
                else prevSlide();
            } else {
                // Return to current slide if swipe wasn't long enough
                goToSlide(currentIndex);
            }

            touchStartX = 0;
            resetAutoplay();
        }, { passive: true });

        // Prevent default touch behavior on carousel
        carousel.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Updated touch events for better control
        container.addEventListener('touchstart', (e) => {
            if (isTransitioning) return;
            touchStartX = e.touches[0].clientX;
            clearTimeout(autoplayTimer);
            container.style.transition = 'none';
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!touchStartX || isTransitioning) return;

            const currentX = e.touches[0].clientX;
            const diff = touchStartX - currentX;
            const movePercent = (diff / container.offsetWidth) * 100;

            // Limit movement to one slide at a time
            const maxMove = 100;
            if (Math.abs(movePercent) > maxMove) return;

            // Add resistance at edges
            if ((currentIndex === 0 && movePercent < 0) ||
                (currentIndex === slides.length - 1 && movePercent > 0)) {
                container.style.transform = `translateX(${-currentIndex * 100 - movePercent * 0.3}%)`;
            } else {
                container.style.transform = `translateX(${-currentIndex * 100 - movePercent}%)`;
            }
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (isTransitioning) return;
            container.style.transition = `transform 0.2s ease-in`;

            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            const movePercent = (diff / container.offsetWidth) * 100;

            if (Math.abs(movePercent) > 20) { // Lower threshold for better responsiveness
                if (movePercent > 0 && currentIndex < slides.length - 1) {
                    nextSlide();
                } else if (movePercent < 0 && currentIndex > 0) {
                    prevSlide();
                } else {
                    goToSlide(currentIndex); // Snap back if at edge
                }
            } else {
                goToSlide(currentIndex); // Return to current slide
            }

            touchStartX = 0;
            resetAutoplay();
        }, { passive: true });

        let isDragging = false;
        let dragDistance = 0;
        const dragThreshold = 0.3; // 30% of slide width to trigger change

        // Prevent scrolling only when actually dragging
        carousel.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
            }
        }, { passive: false });

        container.addEventListener('touchstart', (e) => {
            if (isTransitioning) return;
            isDragging = true;
            carousel.classList.add('dragging');
            touchStartX = e.touches[0].clientX;
            clearTimeout(autoplayTimer);
            container.style.transition = 'none';
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging || isTransitioning) return;

            const currentX = e.touches[0].clientX;
            const diff = touchStartX - currentX;
            dragDistance = (diff / container.offsetWidth);
            const movePercent = dragDistance * 100;

            // Add resistance at edges
            if ((currentIndex === 0 && movePercent < 0) ||
                (currentIndex === slides.length - 1 && movePercent > 0)) {
                container.style.transform = `translateX(${-currentIndex * 100 - movePercent * 0.2}%)`;
            } else {
                container.style.transform = `translateX(${-currentIndex * 100 - movePercent}%)`;
            }
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (!isDragging || isTransitioning) return;
            isDragging = false;
            carousel.classList.remove('dragging');
            container.style.transition = `transform var(--transition-duration) ease`;

            if (Math.abs(dragDistance) > dragThreshold) {
                if (dragDistance > 0 && currentIndex < slides.length - 1) {
                    nextSlide();
                } else if (dragDistance < 0 && currentIndex > 0) {
                    prevSlide();
                } else {
                    goToSlide(currentIndex); // Snap back if at edge
                }
            } else {
                goToSlide(currentIndex); // Return to current slide
            }

            dragDistance = 0;
            touchStartX = 0;
            resetAutoplay();
        }, { passive: true });

        // Click events
        nextButton.addEventListener('click', nextSlide);
        prevButton.addEventListener('click', prevSlide);
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Start autoplay
        resetAutoplay();

        // Pause autoplay when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearTimeout(autoplayTimer);
            } else {
                resetAutoplay();
            }
        });
    }
});