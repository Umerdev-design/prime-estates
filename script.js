document.addEventListener('DOMContentLoaded', () => {
    const yearNode = document.getElementById('year');
    if (yearNode) {
        yearNode.textContent = new Date().getFullYear();
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const navItems = Array.from(document.querySelectorAll('.nav-links a'));

    const updateActiveLink = () => {
        let current = 'home';
        sections.forEach((section) => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.id;
            }
        });

        navItems.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    updateActiveLink();
    window.addEventListener('scroll', updateActiveLink, { passive: true });

    const revealItems = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));

    const scrollTopBtn = document.getElementById('scroll-top');
    const toggleScrollTop = () => {
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('show', window.scrollY > 600);
        }
    };

    toggleScrollTop();
    window.addEventListener('scroll', toggleScrollTop, { passive: true });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const status = document.createElement('div');
            status.className = 'form-status success';
            status.textContent = 'Search filters captured. We will surface matching listings shortly.';
            searchForm.appendChild(status);
            window.setTimeout(() => status.remove(), 2500);
        });
    }

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = contactForm ? contactForm.querySelector('.submit-btn') : null;

    const showFieldError = (fieldName, message) => {
        const errorNode = document.querySelector(`[data-error-for="${fieldName}"]`);
        if (errorNode) {
            errorNode.textContent = message;
        }
    };

    const clearFieldErrors = () => {
        document.querySelectorAll('.field-error').forEach((node) => {
            node.textContent = '';
        });
    };

    const validateField = (name, value) => {
        if (name === 'name') {
            return value.trim().length >= 2 ? '' : 'Please enter your full name.';
        }
        if (name === 'email') {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Please enter a valid email address.';
        }
        if (name === 'phone') {
            return /^[0-9+()\-\s]{7,15}$/.test(value.trim()) ? '' : 'Please enter a valid phone number.';
        }
        if (name === 'message') {
            return value.trim().length >= 10 ? '' : 'Please share a brief message with at least 10 characters.';
        }
        return '';
    };

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearFieldErrors();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            const errors = {};

            Object.entries(data).forEach(([key, value]) => {
                const errorMessage = validateField(key, String(value));
                if (errorMessage) {
                    errors[key] = errorMessage;
                    showFieldError(key, errorMessage);
                }
            });

            if (Object.keys(errors).length) {
                if (formStatus) {
                    formStatus.className = 'form-status error';
                    formStatus.textContent = 'Please fix the highlighted fields and try again.';
                }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }

            if (formStatus) {
                formStatus.className = 'form-status';
                formStatus.textContent = 'Submitting your request...';
            }

            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(result.message || 'Your request could not be sent. Please try again.');
                }

                if (formStatus) {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = result.message || 'Thank you! Your request was received.';
                }
                contactForm.reset();
            } catch (error) {
                if (formStatus) {
                    formStatus.className = 'form-status error';
                    formStatus.textContent = error.message || 'Something went wrong. Please try again later.';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }
            }
        });
    }
});
