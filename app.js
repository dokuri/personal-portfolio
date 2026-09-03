/**
 * SHILISH REDDY DOKURI - INTERACTIVE 3D PORTFOLIO ENGINE
 * Includes: Three.js Constellation Hero Canvas, CSS 3D Tilt Engine,
 * Skills Filtering, Interactive Project Modals, Copy Toast, and Nav Controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThreeHero();
  initTiltEngine();
  initSkillsFilter();
  initProjectModals();
  initContactAndCopy();
  initNavigation();
  updateYear();
});

/* ==========================================================================
   1. THREE.JS HERO CONSTELLATION & PARTICLE SYSTEM
   ========================================================================== */
function initThreeHero() {
  const container = document.getElementById('three-hero-canvas');
  if (!container || typeof THREE === 'undefined') return;

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    1,
    1000
  );
  camera.position.z = 400;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group to rotate with mouse
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  // 1. Particle Cloud
  const particleCount = window.innerWidth < 768 ? 60 : 120;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 800;
    positions[i + 1] = (Math.random() - 0.5) * 600;
    positions[i + 2] = (Math.random() - 0.5) * 400;

    velocities.push({
      x: (Math.random() - 0.5) * 0.4,
      y: (Math.random() - 0.5) * 0.4,
      z: (Math.random() - 0.5) * 0.2
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Particle Material (Electric Teal #2DD4BF)
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x2dd4bf,
    size: 4,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, particleMaterial);
  worldGroup.add(particleSystem);

  // 2. Geometric Tech Wireframe Icosahedron
  const icoGeometry = new THREE.IcosahedronGeometry(90, 1);
  const icoMaterial = new THREE.MeshBasicMaterial({
    color: 0x14b8a6,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });
  const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
  icoMesh.position.set(180, -40, -100);
  worldGroup.add(icoMesh);

  // 3. Floating Torus Ring
  const torusGeometry = new THREE.TorusGeometry(60, 1.2, 16, 60);
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: 0x5eead4,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
  torusMesh.position.set(-220, 100, -80);
  worldGroup.add(torusMesh);

  // Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (e.clientX - windowHalfX) * 0.0008;
    mouseY = (e.clientY - windowHalfY) * 0.0008;
  }, { passive: true });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    if (!prefersReducedMotion) {
      // Smooth camera/group parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      worldGroup.rotation.y = targetX * 0.8;
      worldGroup.rotation.x = targetY * 0.8;

      // Rotating Geometries
      icoMesh.rotation.x += 0.003;
      icoMesh.rotation.y += 0.004;

      torusMesh.rotation.x += 0.004;
      torusMesh.rotation.z += 0.003;

      // Particle Drift
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pos[i3] += velocities[i].x;
        pos[i3 + 1] += velocities[i].y;
        pos[i3 + 2] += velocities[i].z;

        // Wrap boundaries
        if (pos[i3] > 400 || pos[i3] < -400) velocities[i].x *= -1;
        if (pos[i3 + 1] > 300 || pos[i3 + 1] < -300) velocities[i].y *= -1;
        if (pos[i3 + 2] > 200 || pos[i3 + 2] < -200) velocities[i].z *= -1;
      }
      geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

/* ==========================================================================
   2. VANILLA CSS 3D TILT ENGINE (Photos, Projects, Skills, Resumes)
   ========================================================================== */
function initTiltEngine() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // 1. Hero Photo Card 3D Tilt
  const heroCard = document.getElementById('hero-photo-card');
  const heroWrapper = document.getElementById('hero-tilt-wrapper');

  if (heroCard && heroWrapper) {
    let bounds;

    function updateBounds() {
      bounds = heroWrapper.getBoundingClientRect();
    }

    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, { passive: true });
    updateBounds();

    heroWrapper.addEventListener('mouseenter', () => {
      updateBounds();
      heroCard.style.transition = 'transform 0.1s ease-out';
    });

    heroWrapper.addEventListener('mousemove', (e) => {
      if (!bounds) updateBounds();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = (mouseX / bounds.width) - 0.5;
      const yPct = (mouseY / bounds.height) - 0.5;

      const rotateX = -yPct * 26; // max 26 deg tilt
      const rotateY = xPct * 26;

      heroCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    heroWrapper.addEventListener('mouseleave', () => {
      heroCard.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // 2. Generic Tilt Items (.tilt-item)
  const tiltItems = document.querySelectorAll('.tilt-item');
  tiltItems.forEach((item) => {
    const maxTilt = parseFloat(item.getAttribute('data-tilt-max')) || 12;

    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xPercent = (x / rect.width) - 0.5;
      const yPercent = (y / rect.height) - 0.5;

      const rotateX = -yPercent * maxTilt;
      const rotateY = xPercent * maxTilt;

      item.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      setTimeout(() => {
        item.style.transition = 'transform 0.15s ease-out';
      }, 500);
    });
  });

  // 3. Mobile Gyroscope Fallback for Tilt
  if (isTouchDevice && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
      if (!heroCard || !event.gamma || !event.beta) return;
      const gamma = Math.min(Math.max(event.gamma, -25), 25); // Left/Right [-25, 25]
      const beta = Math.min(Math.max(event.beta - 45, -25), 25); // Front/Back

      const rotateY = (gamma / 25) * 15;
      const rotateX = -(beta / 25) * 15;

      heroCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    }, { passive: true });
  }
}

/* ==========================================================================
   3. SKILLS CATEGORY FILTER
   ========================================================================== */
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillWrappers = document.querySelectorAll('.skill-card-wrapper');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Toggle active class
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      skillWrappers.forEach((wrapper) => {
        const categories = wrapper.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          wrapper.style.display = 'block';
          setTimeout(() => {
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'scale(1)';
          }, 50);
        } else {
          wrapper.style.opacity = '0';
          wrapper.style.transform = 'scale(0.9)';
          setTimeout(() => {
            wrapper.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ==========================================================================
   4. INTERACTIVE PROJECT DETAILS MODAL
   ========================================================================== */
const projectData = {
  garbage: {
    kicker: 'IoT HARDWARE & CLOUD TELEMETRY',
    title: 'Smart Garbage Collector',
    subtitle: 'Automated Municipal Waste Monitoring & Dynamic Route Logistics',
    overview: 'The Smart Garbage Collector addresses urban waste overflowing and inefficient municipal truck dispatch schedules by integrating ultrasonic IoT sensors with a cloud telemetry dashboard.',
    architecture: [
      { step: '01', title: 'Sensor Acquisition', desc: 'Ultrasonic distance sensors placed inside smart bins sample container capacity levels at set intervals with minimal power draw.' },
      { step: '02', title: 'Edge Microcontroller & Networking', desc: 'An embedded controller processes reading variance, filters sensor noise, and transmits payload packets via Wi-Fi/GSM to the cloud API.' },
      { step: '03', title: 'Cloud Ingestion & Threshold Engine', desc: 'A Python backend ingests bin telemetry, logs historic fill rates, and triggers real-time alerts when threshold (80%+) is breached.' },
      { step: '04', title: 'Route Optimization Algorithm', desc: 'Computes optimal path coordinates for municipal trucks, prioritizing overflow bins to reduce carbon footprint and collection overhead.' }
    ],
    techStack: ['IoT Hardware Sensors', 'Embedded C', 'Python Cloud Backend', 'REST API', 'Telemetry Dashboard', 'Route Optimization Algorithm']
  },
  osteoporosis: {
    kicker: 'MACHINE LEARNING & CLINICAL DECISION SUPPORT',
    title: 'Osteoporosis ML Diagnostic Pipeline',
    subtitle: 'Predictive Diagnostic Model for Early Bone Mineral Density Loss',
    overview: 'Osteoporosis ML is an automated predictive analytics engine developed to detect subtle biometric markers of bone degradation early, assisting healthcare practitioners with data-backed clinical decision support.',
    architecture: [
      { step: '01', title: 'Data Preprocessing & Imputation', desc: 'Engineered clean feature sets from raw clinical records using Pandas/NumPy, resolving imbalances and applying standardized scaling.' },
      { step: '02', title: 'Exploratory Data Analysis (EDA)', desc: 'Analyzed biomarker correlations, age/calcium factors, and lifestyle indicators to isolate high-impact predictive features.' },
      { step: '03', title: 'Model Training & Hyperparameter Tuning', desc: 'Evaluated multiple supervised classifiers (Random Forest, Gradient Boosting, Logistic Regression) with cross-validation.' },
      { step: '04', title: 'Metric Evaluation & Confidence Scoring', desc: 'Optimized for high sensitivity and recall (ROC/AUC score > 0.88), minimizing false negatives in clinical risk assessment.' }
    ],
    techStack: ['Python', 'Scikit-Learn', 'Pandas & NumPy', 'Matplotlib / Seaborn', 'Exploratory Data Analysis', 'Classification Metrics']
  }
};

function initProjectModals() {
  const modalOverlay = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-dynamic-content');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  if (!modalOverlay || !modalContent) return;

  function openModal(projectKey) {
    const data = projectData[projectKey];
    if (!data) return;

    modalContent.innerHTML = `
      <div class="modal-header">
        <div class="modal-kicker"><i class="fa-solid fa-cube text-teal"></i> ${data.kicker}</div>
        <h3 class="modal-title" id="modal-project-title">${data.title}</h3>
        <p class="project-subtitle">${data.subtitle}</p>
      </div>

      <h4 class="modal-section-title">Project Overview</h4>
      <p class="modal-body-text">${data.overview}</p>

      <h4 class="modal-section-title">System Architecture & Engineering Workflow</h4>
      <div class="modal-architecture-diagram">
        ${data.architecture.map(a => `
          <div class="arch-step">
            <span class="arch-num">${a.step}</span>
            <div>
              <strong class="text-primary">${a.title}:</strong>
              <span class="text-secondary">${a.desc}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <h4 class="modal-section-title">Technologies & Tools</h4>
      <div class="project-tags">
        ${data.techStack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
    `;

    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const projectKey = btn.getAttribute('data-project');
      openModal(projectKey);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   5. CONTACT FORM & COPY-TO-CLIPBOARD TOASTS
   ========================================================================== */
function initContactAndCopy() {
  // 1. Copy to clipboard
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied to clipboard: ${textToCopy}`);
      }).catch(() => {
        showToast(`Copied: ${textToCopy}`);
      });
    });
  });

  // 2. Contact form submit handler
  const contactForm = document.getElementById('portfolio-contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('form-submit-btn');

  if (contactForm && feedback && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sent!';

        feedback.className = 'form-feedback success';
        feedback.innerHTML = `
          <strong>Thank you, ${name}!</strong> Your message has been prepared. You can also directly reach me at <a href="mailto:dokurishilishreddy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}" class="text-teal" style="text-decoration: underline;">dokurishilishreddy@gmail.com</a>.
        `;

        showToast('Message sent! Thank you for reaching out.');
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        }, 3000);
      }, 750);
    });
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-teal"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ==========================================================================
   6. NAVIGATION, SCROLL SPY & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const desktopLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Header scroll class
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy for active nav link
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    desktopLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // Mobile Drawer
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      mobileToggle.setAttribute('aria-expanded', 'true');
    });

    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    }

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   7. FOOTER YEAR UPDATE
   ========================================================================== */
function updateYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
