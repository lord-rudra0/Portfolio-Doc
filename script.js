document.addEventListener('DOMContentLoaded', function() {
    // Loading Animation
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loading);

    window.addEventListener('load', () => {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 500);
    });

    // Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    navOverlay.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when resizing window
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contact Form Handling with Validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', validateInput);
        });

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Simulate API call
                setTimeout(() => {
                    console.log('Form submitted:', data);
                    
                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.className = 'success-message';
                    successMsg.style.cssText = `
                        background: var(--success-color);
                        color: white;
                        padding: 1rem;
                        border-radius: 10px;
                        margin-top: 1rem;
                        text-align: center;
                    `;
                    successMsg.textContent = 'Thank you for your message! We will get back to you soon.';
                    
                    this.appendChild(successMsg);
                    this.reset();
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    
                    // Remove success message after 5 seconds
                    setTimeout(() => successMsg.remove(), 5000);
                }, 1500);
            }
        });
    }

    function validateInput(input) {
        const el = input instanceof Event ? input.target : input;
        const value = el.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (el.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'tel':
                const phoneRegex = /^\+?[\d\s-]{10,}$/;
                isValid = phoneRegex.test(value);
                errorMessage = 'Please enter a valid phone number';
                break;
            default:
                isValid = value.length > 0;
                errorMessage = 'This field is required';
        }

        showInputError(el, isValid ? '' : errorMessage);
        return isValid;
    }

    function showInputError(input, message) {
        const container = input.parentElement;
        let errorDiv = container.querySelector('.error-message');
        
        if (message) {
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.cssText = `
                    color: var(--accent-color);
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                `;
                container.appendChild(errorDiv);
            }
            errorDiv.textContent = message;
            input.style.borderColor = 'var(--accent-color)';
        } else {
            if (errorDiv) {
                errorDiv.remove();
            }
            input.style.borderColor = '';
        }
    }

    // Animate timeline items on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, observerOptions);

    timelineItems.forEach(item => {
        observer.observe(item);
    });

    // FAQ Accordion with smooth animation
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        
        // Set initial styles
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.3s ease';
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.maxHeight !== '0px';
            
            // Close all answers
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('p');
                otherAnswer.style.maxHeight = '0';
                otherItem.classList.remove('active');
            });
            
            // Toggle current answer
            if (!isOpen) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                item.classList.add('active');
            }
        });
    });

    // Sticky Navigation with scroll progress
    let navbar = document.querySelector('.navbar');
    let sticky = navbar.offsetTop;
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--accent-color);
        width: 0;
        transition: width 0.1s ease;
    `;
    navbar.appendChild(progressBar);

    window.onscroll = function() {
        // Update sticky nav
        if (window.pageYOffset > sticky) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
        
        // Update progress bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    };
});