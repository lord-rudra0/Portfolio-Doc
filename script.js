// Wait for DOM to be fully loaded
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

        contactForm.addEventListener('submit', async function(e) {
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
                
                try {
                    const response = await fetch('http://localhost:5000/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        alert('Message sent successfully! Check your email for confirmation.');
                        this.reset();
                    } else {
                        throw new Error('Failed to send message');
                    }
                } catch (error) {
                    alert('Error sending message: ' + error.message);
                }
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

    // Dynamic Content Loading
    const contentContainer = document.querySelector('.content-container');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div>';
    loadingIndicator.style.display = 'none';
    document.body.appendChild(loadingIndicator);

    let isLoading = false;
    let currentPage = 1;

    const contentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadMoreContent();
            }
        });
    }, {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
    });

    const targetElement = document.querySelector('.load-more-trigger');
    if (targetElement) {
        contentObserver.observe(targetElement);
    }

    async function loadMoreContent() {
        if (isLoading) return;
        
        isLoading = true;
        loadingIndicator.style.display = 'block';

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create new content
            const newContent = document.createElement('div');
            newContent.className = 'content-section';
            newContent.innerHTML = `
                <h2>Section ${currentPage + 1}</h2>
                <p>This is dynamically loaded content for section ${currentPage + 1}.</p>
            `;
            
            // Add fade-in animation
            newContent.style.opacity = '0';
            newContent.style.transform = 'translateY(20px)';
            newContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            if (contentContainer) {
                contentContainer.appendChild(newContent);
                
                // Trigger animation
                setTimeout(() => {
                    newContent.style.opacity = '1';
                    newContent.style.transform = 'translateY(0)';
                }, 50);
            }
            
            currentPage++;
            
            // Update the trigger element position
            if (targetElement) {
                contentObserver.unobserve(targetElement);
                targetElement.remove();
                const newTrigger = document.createElement('div');
                newTrigger.className = 'load-more-trigger';
                contentContainer.appendChild(newTrigger);
                contentObserver.observe(newTrigger);
            }
        } catch (error) {
            console.error('Error loading more content:', error);
        } finally {
            isLoading = false;
            loadingIndicator.style.display = 'none';
        }
    }

    // Get the button
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');
    
    // Add click event listener
    if (bookAppointmentBtn) {
        bookAppointmentBtn.addEventListener('click', function() {
            document.getElementById('appointmentModal').style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close button functionality
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('appointmentModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    // Form Submission
    document.getElementById('appointmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loader
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        const loader = createLoader();
        submitButton.disabled = true;
        submitButton.parentNode.insertBefore(loader, submitButton);

        const formData = new FormData(this);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            date: formData.get('appointmentDate'),
            time: formData.get('appointmentTime'),
            type: formData.get('appointmentType'),
            symptoms: formData.get('symptoms') || '',
            status: 'pending'
        };

        try {
            const response = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to submit appointment');
            }

            // Show success message
            showNotification('Success!', 'Appointment request submitted successfully! Check your email for confirmation.', 'success');
            
            // Reset form and close modal
            this.reset();
            closeAppointmentModal();
        } catch (error) {
            console.error('Error details:', error);
            showNotification('Error', error.message, 'error');
        } finally {
            // Remove loader and restore button
            loader.remove();
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });

    // Date Input Validation
    document.getElementById('appointmentDate').addEventListener('input', function() {
        const today = new Date();
        const selected = new Date(this.value);
        if (selected < today) {
            this.value = today.toISOString().split('T')[0];
        }
    });

    // Add notification system
    function showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
        `;
        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Add these functions at the top of script.js
    function closeAppointmentModal() {
        document.getElementById('appointmentModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Create a loader component
    function createLoader() {
        const loader = document.createElement('div');
        loader.className = 'submit-loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <p>Submitting your appointment...</p>
        `;
        return loader;
    }

    // Add this function to update available time slots
    async function updateAvailableTimeSlots() {
        const dateInput = document.getElementById('appointmentDate');
        const timeSelect = document.getElementById('appointmentTime');
        const selectedDate = dateInput.value;

        if (!selectedDate) {
            timeSelect.innerHTML = '<option value="">Select Time</option>';
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/appointments/available-slots?date=${selectedDate}`);
            const availableSlots = await response.json();

            timeSelect.innerHTML = '<option value="">Select Time</option>';
            availableSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                timeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading available time slots:', error);
            showNotification('Error', 'Failed to load available time slots', 'error');
        }
    }

    // Add event listener to date input
    document.getElementById('appointmentDate').addEventListener('change', updateAvailableTimeSlots);
});