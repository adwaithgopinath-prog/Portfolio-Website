/**
 * script.js — Interactive UI & Animation Logic
 * Portfolio of Adwaith Gopinath
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── 1. Navbar Scroll Blur & State ──────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ── 2. Mobile Menu Toggle ──────────────────────────────────────────────────
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu on link click
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ── 3. Reveal Sections on Scroll (Intersection Observer) ─────────────────
    const revealSections = document.querySelectorAll('.reveal-section');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.01,
        rootMargin: '50px 0px 50px 0px'
    });

    revealSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.1) {
            section.classList.add('visible');
        } else {
            revealObserver.observe(section);
        }
    });

    // ── 4. Smooth Anchor Link Scrolling ──────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = navbar ? navbar.offsetHeight : 70;
                const targetPos = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ── 5. Contact Form Submission Feedback ──────────────────────────────────
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalContent = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-check"></i> MESSAGE SENT!';
            submitBtn.style.background = '#22c55e';
            submitBtn.style.borderColor = '#22c55e';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = originalContent;
                submitBtn.style.background = '';
                submitBtn.style.borderColor = '';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 3500);
        });
    }

    // Console Branding
    console.log('%c ADWAITH GOPINATH ', 'background: #ef4444; color: #fff; font-weight: bold; font-size: 14px; padding: 4px 8px; border-radius: 4px;');
    console.log('%c ENTC Student & Creative Developer | Portfolio 2026 ', 'color: #ef4444; font-size: 12px;');
});
