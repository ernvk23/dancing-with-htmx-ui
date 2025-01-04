document.addEventListener('DOMContentLoaded', () => {
    // Get root font size for rem calculation
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const links = document.querySelectorAll('.nav-links a[href^="#"], .logo, #qa-erip');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href') || '#home' || '#qa';
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Adjust the offset if your navbar has a different height
                const targetPosition = targetElement.offsetTop - rootFontSize * 5;
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
        document.body.classList.toggle('no-scroll'); // Toggle no-scroll class on body
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

    const contactButton = document.querySelector('.floating-contact-button');

    // Close the menu when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!contactButton.contains(event.target)) {
            contactButton.classList.remove('open');
        }
    });

    contactButton.addEventListener('click', (event) => {
        // Prevent event propagation to avoid immediate closing
        event.stopPropagation();
        contactButton.classList.toggle('open');
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


});