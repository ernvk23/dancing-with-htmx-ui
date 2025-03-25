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

    // const homeSection = document.getElementById('home');

    // Remove or comment out the old setBackgroundImage function

    function initParallax() {
        const parallaxImg = document.querySelector('.parallax-img');
        if (!parallaxImg) return;

        const isMobile = () => window.innerWidth <= 768;

        const loadPlaceholder = () => {
            const placeholder = isMobile() ? parallaxImg.dataset.placeholderMobile : parallaxImg.dataset.placeholderDesktop;
            parallaxImg.src = placeholder;
            parallaxImg.classList.add('loaded'); // Add 'loaded' immediately
        };

        const loadHighRes = () => {
            const highResSrc = isMobile() ? parallaxImg.dataset.srcMobile : parallaxImg.dataset.srcDesktop;
            const tempImg = new Image();
            tempImg.onload = () => {
                parallaxImg.src = highResSrc;
            };
            tempImg.src = highResSrc;
        };

        // --- Parallax Calculation and Animation ---

        let currentTransform = 0;
        let targetTransform = 0;
        let animationFrameId = null;
        const parallaxSpeed = 0.5; // Adjust this for the desired parallax effect (0.1 - 0.5 is a good range)
        const easing = 0.05;       // Controls the smoothness of the animation (lower = smoother)
        let containerTop = parallaxImg.getBoundingClientRect().top + window.pageYOffset; // Get the initial top position of the container
        let containerHeight = parallaxImg.offsetHeight;
        const initialTransform = 0; // Store the initial transform value, which is 0

        const updateParallax = () => {
            // Calculate the target transform based on the scroll position and parallax speed.
            const scrolled = window.pageYOffset;
            targetTransform = (scrolled - containerTop) * parallaxSpeed;

            // Limit the targetTransform so it doesn't go beyond the initial position when scrolling up
            targetTransform = Math.max(initialTransform, targetTransform); // Ensure it doesn't go above initialTransform (0 in this case)

            // Smooth easing animation
            const diff = targetTransform - currentTransform;
            currentTransform += diff * easing;

            // Apply the transform using translate3d for hardware acceleration
            parallaxImg.style.transform = `translate3d(0, ${currentTransform}px, 0)`;

            // Continue the animation loop only if there's a significant difference
            if (Math.abs(diff) > 0.5) { // Reduced threshold for even smoother animation
                animationFrameId = requestAnimationFrame(updateParallax);
            }
        };

        // --- Event Handling ---

        const handleScroll = () => {
            // Cancel any previous animation frame to prevent overlapping updates
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            // Request a new animation frame to update the parallax position
            animationFrameId = requestAnimationFrame(updateParallax);
        };

        const handleResize = () => {
            // Recalculate containerTop and containerHeight on resize
            containerTop = parallaxImg.getBoundingClientRect().top + window.pageYOffset;
            containerHeight = parallaxImg.offsetHeight;
            loadHighRes(); // Reload images for the correct resolution
            updateParallax(); // Force an update after resize
        };

        // --- Initialization and Cleanup ---

        loadPlaceholder(); // Load the placeholder image immediately
        loadHighRes();     // Start loading the high-resolution image

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        // Return a cleanup function to remove event listeners
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }
    // Example usage (assuming you have an element with class 'parallax-img'):
    const cleanup = initParallax();

    // Clean up on page unload
    window.addEventListener('unload', cleanup);

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
        let isTransitioning = false;
        let isDragging = false;
        const transitionDelay = 200;
        const dragThreshold = 0.02; // Reduced from 0.3 to 0.15 for easier triggering
        let isVisible = false;  // Add visibility tracking

        // Set initial state
        function initializeSlides() {
            slides[0].classList.add('active');
            if (slides.length > 1) {
                slides[1].classList.add('next');
            }
        }

        initializeSlides();

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        function goToSlide(index) {
            if (isTransitioning || index === currentIndex) return;
            isTransitioning = true;

            slides.forEach(slide => slide.classList.remove('active', 'prev', 'next'));
            dots[currentIndex].classList.remove('active');

            slides[index].classList.add('active');
            dots[index].classList.add('active');

            if (index > 0) slides[index - 1].classList.add('prev');
            if (index < slides.length - 1) slides[index + 1].classList.add('next');

            container.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            resetAutoplay();

            setTimeout(() => isTransitioning = false, transitionDelay);
        }

        function nextSlide() {
            if (!isTransitioning) goToSlide((currentIndex + 1) % slides.length);
        }

        function prevSlide() {
            if (!isTransitioning) goToSlide((currentIndex - 1 + slides.length) % slides.length);
        }

        function startAutoplay() {
            if (isVisible && !autoplayTimer) {
                autoplayTimer = setTimeout(nextSlide, 2000);
            }
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearTimeout(autoplayTimer);
                autoplayTimer = null;
            }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Create intersection observer for carousel
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            });
        }, {
            threshold: 0.4  // Trigger when 50% of carousel is visible
        });

        // Start observing the carousel
        observer.observe(carousel);

        // Update visibility handlers
        container.addEventListener('touchstart', (e) => {
            if (isTransitioning) return;
            isDragging = true;
            touchStartX = e.touches[0].clientX;
            stopAutoplay();  // Stop on touch
            container.style.transition = 'none';
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging || isTransitioning) return;
            const currentX = e.touches[0].clientX;
            const diff = touchStartX - currentX;
            const movePercent = (diff / container.offsetWidth) * 100;

            // Enable smooth movement
            const resistance = (currentIndex === 0 && diff < 0) ||
                (currentIndex === slides.length - 1 && diff > 0) ? 0.3 : 1;

            container.style.transform = `translateX(${-currentIndex * 100 - movePercent * resistance}%)`;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            container.style.transition = 'transform 0.2s ease-in';

            const diff = touchStartX - e.changedTouches[0].clientX;
            const movePercent = (diff / container.offsetWidth);

            if (Math.abs(movePercent) > dragThreshold) {
                if (movePercent > 0 && currentIndex < slides.length - 1) {
                    nextSlide();
                } else if (movePercent < 0 && currentIndex > 0) {
                    prevSlide();
                } else {
                    goToSlide(currentIndex);
                }
            } else {
                goToSlide(currentIndex);
            }

            touchStartX = 0;
            if (isVisible) {
                resetAutoplay();
            }
        }, { passive: true });

        // Clean up observer when needed
        window.addEventListener('unload', () => {
            observer.disconnect();
        });

        // Replace old visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden || !isVisible) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });

        // Prevent scroll while dragging
        carousel.addEventListener('touchmove', (e) => {
            if (isDragging) e.preventDefault();
        }, { passive: false });

        // Button click handlers
        prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            prevSlide();
        });

        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSlide();
        });

        // Start autoplay
        resetAutoplay();
    }
});