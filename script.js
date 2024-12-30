document.addEventListener('DOMContentLoaded', () => {
    // Get root font size for rem calculation
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const links = document.querySelectorAll('.nav-links a[href^="#"], .logo');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href') || '#home';
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
        document.body.classList.toggle('nav-open'); // Make sure you have CSS for this
        overlay.classList.toggle('show');
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
});