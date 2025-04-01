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

    function initParallax() {
        const parallaxImg = document.querySelector('.parallax-img');
        if (!parallaxImg) return;
        let animationFrameId = null;
        const parallaxSpeed = 0.6;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const transform = Math.max(0, scrolled * parallaxSpeed);
            // const finalTransform = Math.round(transformValue);
            parallaxImg.style.transform = `translate3d(0, ${transform}px, 0)`;
            animationFrameId = null;
        };

        // Renamed for clarity
        const requestParallaxUpdate = () => {
            // Only schedule a new frame if one isn't already pending
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updateParallax);
            }
        };

        const handleScroll = () => {
            requestParallaxUpdate(); // Use the scheduler
        };

        const handleResize = () => {
            if (typeof loadParallaxImage === 'function') {
                loadParallaxImage();
            }
            requestParallaxUpdate(); // Use the scheduler
        };

        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', handleScroll, { passive: true });
                    requestParallaxUpdate();
                } else {
                    window.removeEventListener('scroll', handleScroll);
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null; // Clear the ID
                    }
                }
            });
        }, {
            threshold: 0.1, // Adjust if needed
            rootMargin: '50px 0px' // Adjust if needed
        });

        window.addEventListener('resize', handleResize);
        observer.observe(parallaxImg.parentElement); // Ensure this observes the correct element

        // Return cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };
    }

    // Initialize
    const cleanup = initParallax();

    window.addEventListener('pagehide', cleanup);
    // Consider adding beforeunload for broader cleanup coverage
    // window.addEventListener('beforeunload', cleanup);

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



    // --- Debounce Function --- (Keep this or replace existing one if different)
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- NEW Responsive Image Map Logic ---
    function setupResponsiveImageMap() {
        const image = document.querySelector('img[usemap="#map-directions"]');
        const mapElement = document.querySelector('map[name="map-directions"]');

        // Early exit if essential elements are missing
        if (!image || !mapElement) return;
        const areas = mapElement.querySelectorAll('area');
        if (!areas.length) return;

        let naturalWidth = 0;
        let naturalHeight = 0;
        let originalsStored = false;
        let resizeListenerActive = false;

        // --- Core Calculation Function ---
        function calculateAndUpdateCoords() {
            // Wait until originals are stored and image has valid dimensions
            if (!originalsStored || naturalWidth === 0 || image.width === 0 || image.height === 0) {
                return;
            }
            const currentWidth = image.width;
            const currentHeight = image.height;
            const scaleX = currentWidth / naturalWidth;
            const scaleY = currentHeight / naturalHeight;

            areas.forEach(area => {
                const originalCoordsString = area.dataset.originalCoords;
                if (!originalCoordsString) return;

                const originalCoords = originalCoordsString.split(',').map(Number);
                const newCoords = originalCoords.map((coord, index) => {
                    return Math.round(coord * (index % 2 === 0 ? scaleX : scaleY));
                }).join(',');

                if (area.coords !== newCoords) {
                    area.coords = newCoords;
                }
            });
        }

        // --- Debounced version for resize ---
        const debouncedCalculateAndUpdate = debounce(calculateAndUpdateCoords, 200); // 200ms delay

        // --- Function to run ONCE on first visibility/load ---
        function performInitialSetup() {
            if (originalsStored) return; // Prevent running multiple times
            naturalWidth = image.naturalWidth;
            naturalHeight = image.naturalHeight;
            if (naturalWidth === 0) return; // If naturalWidth is 0, image likely failed

            // Store original coords from the HTML 'coords' attribute
            areas.forEach(area => {
                if (!area.dataset.originalCoords) {
                    area.dataset.originalCoords = area.coords;
                }
            });
            originalsStored = true;
            calculateAndUpdateCoords(); // Perform the first calculation

            // Activate the resize listener ONLY AFTER initial setup
            if (!resizeListenerActive) {
                window.addEventListener('resize', debouncedCalculateAndUpdate);
                resizeListenerActive = true;
            }
        }

        // --- Intersection Observer Setup ---
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Image is visible, check if loaded
                    if (image.complete && image.naturalWidth > 0) {
                        performInitialSetup(); // Already loaded
                    } else {
                        image.addEventListener('load', performInitialSetup, { once: true }); // Wait for load
                    }
                    // Stop observing once triggered
                    obs.unobserve(image);
                }
            });
        }, {
            rootMargin: '50px 0px', // Optional: Trigger slightly before fully in view
            threshold: 0.01       // Trigger if even a tiny part is visible
        });

        // Start observing the image
        observer.observe(image);
    }

    // Call the new setup function (Place this where adjustImageMap() was called)
    setupResponsiveImageMap();


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
        let touchStartY = 0; // Keep this
        let isTransitioning = false;
        let isDragging = false;
        const transitionDelay = 50;
        // const dragThreshold = 0.02; // Reduced from 0.3 to 0.15 for easier triggering
        let isVisible = false;  // Add visibility tracking
        let dragDirectionDetermined = false;
        let isHorizontalDrag = false;
        const directionLockThreshold = 5; // Pixels to move before deciding direction

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

        // --- Touch Start ---
        container.addEventListener('touchstart', (e) => {
            if (isTransitioning || e.touches.length > 1) return; // Ignore during transition or multi-touch
            isDragging = true;
            dragDirectionDetermined = false;    // Reset direction lock
            isHorizontalDrag = false;         // Reset horizontal flag
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY; // Store Y start coordinate
            stopAutoplay();                     // Call your existing stopAutoplay function
            container.style.transition = 'none';// Disable transition during drag for smooth movement
        }, { passive: true });                  // Use passive: true as we don't preventDefault here

        // --- Touch Move ---
        container.addEventListener('touchmove', (e) => {
            if (!isDragging || isTransitioning || e.touches.length > 1) return; // Ignore if not dragging, transitioning, or multi-touch

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;

            // Determine direction if not already decided
            if (!dragDirectionDetermined) {
                const diffX = Math.abs(currentX - touchStartX);
                const diffY = Math.abs(currentY - touchStartY);

                // Decide direction after a small threshold movement
                if (diffX > directionLockThreshold || diffY > directionLockThreshold) {
                    isHorizontalDrag = diffX > diffY; // Horizontal if X diff is greater
                    dragDirectionDetermined = true;
                } else {
                    return; // Not enough movement yet
                }
            }

            // Only prevent default and move carousel IF dragging horizontally
            if (isHorizontalDrag) {
                e.preventDefault(); // Prevent vertical scroll ONLY when swiping horizontally

                // Apply visual feedback during drag (using your original percentage logic)
                const currentDiffX = touchStartX - currentX;
                const movePercent = (currentDiffX / container.offsetWidth) * 100;
                // Optional resistance at the ends
                const resistance = (currentIndex === 0 && currentDiffX < 0) ||
                    (currentIndex === slides.length - 1 && currentDiffX > 0) ? 0.3 : 1;
                container.style.transform = `translateX(${-currentIndex * 100 - movePercent * resistance}%)`;
            }
            // If !isHorizontalDrag, do nothing here - allow default vertical scroll

        }, { passive: false }); // *** MUST BE passive: false to allow preventDefault ***

        // --- Touch End ---
        container.addEventListener('touchend', (e) => {
            if (!isDragging) return; // Ignore if not dragging
            isDragging = false;

            // Restore the transition before deciding action
            container.style.transition = `transform ${transitionDelay}ms ease-in`;

            // Only process swipe logic IF the drag was determined to be horizontal
            if (isHorizontalDrag) {
                const diff = touchStartX - e.changedTouches[0].clientX;
                const movePercent = (diff / container.offsetWidth);
                const swipeThreshold = 0.1; // Minimum 10% drag to trigger a slide change (adjust if needed)

                // Check if swipe distance threshold is met
                if (Math.abs(movePercent) > swipeThreshold) {
                    if (movePercent > 0 && currentIndex < slides.length - 1) {
                        nextSlide(); // Call your existing nextSlide function
                    } else if (movePercent < 0 && currentIndex > 0) {
                        prevSlide(); // Call your existing prevSlide function
                    } else {
                        // Swiped past ends, snap back smoothly
                        goToSlide(currentIndex); // Call your existing goToSlide function
                    }
                } else {
                    // Swipe was too short, snap back smoothly
                    goToSlide(currentIndex); // Call your existing goToSlide function
                }
            }
            // If drag was NOT horizontal, do nothing - browser handled scroll.

            // Reset flags
            dragDirectionDetermined = false;
            isHorizontalDrag = false;

            // Restart autoplay if the carousel is visible
            if (isVisible) { // Assumes 'isVisible' is updated by your IntersectionObserver
                resetAutoplay(); // Call your existing resetAutoplay function
            }
        }, { passive: true }); // Use passive: true as we don't preventDefault here

        // Clean up observer when needed
        window.addEventListener('pagehide', () => {
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
        // carousel.addEventListener('touchmove', (e) => {
        //     if (isDragging) e.preventDefault();
        // }, { passive: false });

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