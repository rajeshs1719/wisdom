// without API
// document.addEventListener('DOMContentLoaded', () => {
//   const lidContainer = document.getElementById('lid-container');
//   const lid = document.getElementById('lid');
//   const binModel = document.getElementById('bin-model');

//   const buttons = {
//     wet: document.getElementById('wet-btn'),
//     dry: document.getElementById('dry-btn'),
//     combined: document.getElementById('combined-btn'),
//     reset: document.getElementById('reset-btn')
//   };
//   const fills = {
//     wet: {
//       element: document.getElementById('wet-fill'),
//       percentageEl: document.getElementById('wet-percentage'),
//       value: 0
//     },
//     dry: {
//       element: document.getElementById('dry-fill'),
//       percentageEl: document.getElementById('dry-percentage'),
//       value: 0
//     },
//     combined: {
//       element: document.getElementById('combined-fill'),
//       percentageEl: document.getElementById('combined-percentage'),
//       value: 0
//     }
//   };

//   const rotationMap = {
//     wet: -45,  
//     dry: 0,   
//     combined: 45
//   };

//   const particleLeftMap = {
//     wet: '65%',
//     dry: '30%',
//     combined: '83%'
//   };

//   Object.keys(fills).forEach(type => {
//     buttons[type].addEventListener('click', () => handleTrashDrop(type));
//   });
//   buttons.reset.addEventListener('click', resetBin);

//   let animating = false;

//   function handleTrashDrop(type) {
//     if (animating || fills[type].value >= 100) return;
//     animating = true;
//     toggleButtons(true);

//     const tl = gsap.timeline({
//       onComplete: () => {
//         animating = false;
//         toggleButtons(false);
//       }
//     });

//     tl.to(lidContainer, { rotationY: rotationMap[type], duration: 0.55, ease: "power2.out" });

//     tl.to(lid, { rotationX: 110, duration: 0.40, ease: "power2.inOut" }, ">");

//     tl.call(() => {
//       dropTrashParticle(type);
//       updateFill(type);
//     }, null, "+=0.18");

//     tl.to(lid, { rotationX: 0, duration: 0.38, ease: "power1.in" }, "+=0.32");

//     tl.to(lidContainer, { rotationY: 0, duration: 0.5, ease: "power2.inOut" }, "-=0.21");
//   }

// function dropTrashParticle(type) {
//   const particle = document.createElement('div');
//   particle.className = 'trash-particle ' + type;

//   // Get target compartment element
//   const compElement = document.getElementById(`${type}-comp`);
//   const compRect = compElement.getBoundingClientRect();
//   const binRect = binModel.getBoundingClientRect();

//   // Calculate horizontal offset relative to bin container
//   const leftOffset = compRect.left - binRect.left + compRect.width / 2 - 9; // 9 is half particle width (18/2)

//   particle.style.position = 'absolute';
//   particle.style.top = '10px';
//   particle.style.left = `${leftOffset}px`; // dynamically positioned inside compartment
//   particle.style.width = '18px';
//   particle.style.height = '18px';
//   particle.style.borderRadius = '50%';
//   particle.style.background =
//     type === 'wet' ? 'var(--wet-color)' :
//     type === 'dry' ? 'var(--dry-color)' :
//     'var(--combined-color)';
//   particle.style.willChange = 'transform, opacity';
//   binModel.appendChild(particle);

//   gsap.to(particle, {
//     y: 100,
//     scale: 0.5,
//     opacity: 0.2,
//     duration: 0.68,
//     ease: "bounce.out",
//     onComplete: () => particle.remove()
//   });
// }


//   function updateFill(type) {
//     const comp = fills[type];
//     if (comp.value < 100) {
//       comp.value += 10;
//       comp.element.style.setProperty('--fill-level', `${comp.value}%`);
//       comp.percentageEl.textContent = `${comp.value}%`;
//       if (comp.value >= 100) buttons[type].disabled = true;
//     }
//   }

//   function resetBin() {
//     Object.keys(fills).forEach(type => {
//       fills[type].value = 0;
//       fills[type].element.style.setProperty('--fill-level', '0%');
//       fills[type].percentageEl.textContent = '0%';
//       buttons[type].disabled = false;
//     });
//   }

//   function toggleButtons(state) {
//     Object.keys(fills).forEach(type => {
//       buttons[type].disabled = state || fills[type].value >= 100;
//     });
//   }
// });


const RoboFlow_API = "vx80midQi9HfNqQsvBnq"
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GET ALL HTML ELEMENTS ---
    const lidContainer = document.getElementById('lid-container');
    const lid = document.getElementById('lid');
    const binModel = document.getElementById('bin-model');

    const buttons = {
        wet: document.getElementById('wet-btn'),
        dry: document.getElementById('dry-btn'),
        combined: document.getElementById('combined-btn'),
        reset: document.getElementById('reset-btn'),
        toggleCamera: document.getElementById('camera-toggle'),
        capture: document.getElementById('capture-btn')
    };

    const fills = {
        wet: {
            element: document.getElementById('wet-fill'),
            percentageEl: document.getElementById('wet-percentage'),
            value: 0
        },
        dry: {
            element: document.getElementById('dry-fill'),
            percentageEl: document.getElementById('dry-percentage'),
            value: 0
        },
        combined: {
            element: document.getElementById('combined-fill'),
            percentageEl: document.getElementById('combined-percentage'),
            value: 0
        }
    };

    const videoElement = document.getElementById('camera');
    const canvasElement = document.getElementById('snapshot');
    const uploadInput = document.getElementById('upload-input');
    const context = canvasElement.getContext('2d');

    // --- 2. CONFIGURATION AND STATE VARIABLES ---
    // ⚠️ IMPORTANT: Replace "YOUR_API_KEY" with your actual Roboflow Private API Key.
    const ROBOFLOW_API_KEY = RoboFlow_API;
    const ROBOFLOW_MODEL_URL = "https://serverless.roboflow.com/dry-and-wet-waste-sl1a5/1";

    const rotationMap = {
        wet: -45,
        dry: 0,
        combined: 45
    };

    let animating = false;
    let cameraStream = null;

    // --- 3. CORE FUNCTIONS (Bin Animation, Firebase, Roboflow) ---

    function handleTrashDrop(type) {
        // Exit if an animation is running, the type is invalid, or the bin is full
        if (animating || !fills[type] || fills[type].value >= 100) {
            if (!fills[type]) console.error("Invalid trash type provided:", type);
            // If the prediction fails, we must re-enable the buttons
            toggleAllButtons(false);
            return;
        }

        animating = true;
        toggleAllButtons(true); // Disable all buttons during animation

        const tl = gsap.timeline({
            onComplete: () => {
                animating = false;
                toggleAllButtons(false); // Re-enable buttons after animation
            }
        });

        tl.to(lidContainer, { rotationY: rotationMap[type], duration: 0.55, ease: "power2.out" });
        tl.to(lid, { rotationX: 110, duration: 0.40, ease: "power2.inOut" }, ">");
        tl.call(() => {
            dropTrashParticle(type);
            updateFill(type);
            let commandValue = type === "wet" ? 1 : type === "dry" ? 2 : 3;
            sendCommandToFirebase(commandValue);
        }, null, "+=0.18");
        tl.to(lid, { rotationX: 0, duration: 0.38, ease: "power1.in" }, "+=0.32");
        tl.to(lidContainer, { rotationY: 0, duration: 0.5, ease: "power2.inOut" }, "-=0.21");
    }

    function normalizeWasteType(predictedClass) {
        const type = predictedClass.toLowerCase();
        if (type.includes('wet')) {
            return 'wet';
        }
        if (type.includes('dry')) {
            return 'dry';
        }
        if (type.includes('combined')) {
            return 'combined';
        }
        // Return the original if no match, so we can see the error
        return type;
    }

    function sendCommandToFirebase(value) {
        if (!window.db || !window.dbRef || !window.dbSet) {
            console.error("Firebase is not initialized on the window object!");
            return;
        }
        const commandRef = window.dbRef(window.db, "servo/command");
        window.dbSet(commandRef, value)
            .then(() => {
                console.log("Firebase command sent:", value);
                setTimeout(() => {
                    window.dbSet(commandRef, 0).then(() => console.log("Firebase command reset to 0.")).catch(console.error);
                }, 3000);
            })
            .catch(err => console.error("Error sending Firebase command:", err));
    }

    function dropTrashParticle(type) {
        const particle = document.createElement('div');
        particle.className = 'trash-particle ' + type;
        const compElement = document.getElementById(`${type}-comp`);
        const compRect = compElement.getBoundingClientRect();
        const binRect = binModel.getBoundingClientRect();
        const leftOffset = compRect.left - binRect.left + compRect.width / 2 - 9; // 9 is half particle width

        particle.style.position = 'absolute';
        particle.style.top = '10px';
        particle.style.left = `${leftOffset}px`;
        particle.style.width = '18px';
        particle.style.height = '18px';
        particle.style.borderRadius = '50%';
        particle.style.background = `var(--${type}-color)`;
        binModel.appendChild(particle);

        gsap.to(particle, { y: 100, scale: 0.5, opacity: 0.2, duration: 0.68, ease: "bounce.out", onComplete: () => particle.remove() });
    }

    function updateFill(type) {
        const comp = fills[type];
        if (comp.value < 100) {
            comp.value += 10;
            comp.element.style.setProperty('--fill-level', `${comp.value}%`);
            comp.percentageEl.textContent = `${comp.value}%`;
            if (comp.value >= 100) {
                buttons[type].disabled = true;
            }
        }
    }

    function resetBin() {
        Object.keys(fills).forEach(type => {
            fills[type].value = 0;
            fills[type].element.style.setProperty('--fill-level', '0%');
            fills[type].percentageEl.textContent = '0%';
            buttons[type].disabled = false;
        });
        console.log("Bin has been reset.");
    }

    function toggleAllButtons(state) {
        // Disable/enable manual buttons based on state and fill level
        ['wet', 'dry', 'combined'].forEach(type => {
            buttons[type].disabled = state || fills[type].value >= 100;
        });
        // Disable/enable capture button based on state and camera stream
        buttons.capture.disabled = state || !cameraStream;
    }

    async function toggleCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
            cameraStream = null;
            buttons.capture.disabled = true;
            buttons.toggleCamera.textContent = 'Open Camera';
        } else {
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoElement.srcObject = cameraStream;
                buttons.capture.disabled = false;
                buttons.toggleCamera.textContent = 'Close Camera';
            } catch (error) {
                console.error("Error accessing camera:", error);
                alert("Could not access the camera. Please check permissions and ensure you're on a secure (https) connection.");
            }
        }
    }

    function captureAndPredict() {
        if (!cameraStream) return;
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        const base64Image = canvasElement.toDataURL('image/jpeg');
        predictWithRoboflow(base64Image);
    }

    function uploadAndPredict(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => predictWithRoboflow(e.target.result);
        reader.readAsDataURL(file);
    }

    async function predictWithRoboflow(base64Image) {
        buttons.capture.textContent = "Analyzing...";
        toggleAllButtons(true);

        const cleanBase64 = base64Image.split(',')[1];

        try {
            const response = await fetch(`${ROBOFLOW_MODEL_URL}?api_key=${ROBOFLOW_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: cleanBase64
            });

            if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);

            const data = await response.json();
            console.log("Roboflow Prediction:", data);

            if (data.predictions && data.predictions.length > 0) {
                const topPrediction = data.predictions.reduce((prev, current) => prev.confidence > current.confidence ? prev : current);

                // --- THIS IS THE FIX ---
                // Use the new helper function to get the correct type
                const wasteType = normalizeWasteType(topPrediction.class);

                handleTrashDrop(wasteType);
            } else {
                alert("Could not identify the waste type. Please try again with a clearer image.");
                toggleAllButtons(false); // Re-enable buttons on failure
            }
        } catch (error) {
            console.error("Error during Roboflow prediction:", error);
            alert("An error occurred while analyzing the image.");
            toggleAllButtons(false); // Re-enable buttons on error
        } finally {
            buttons.capture.textContent = "Capture";
        }
    }

    // --- 4. ATTACH EVENT LISTENERS ---
    buttons.wet.addEventListener('click', () => handleTrashDrop('wet'));
    buttons.dry.addEventListener('click', () => handleTrashDrop('dry'));
    buttons.combined.addEventListener('click', () => handleTrashDrop('combined'));
    buttons.reset.addEventListener('click', resetBin);
    buttons.toggleCamera.addEventListener('click', toggleCamera);
    buttons.capture.addEventListener('click', captureAndPredict);
    uploadInput.addEventListener('change', uploadAndPredict);

    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            predictWithRoboflow(e.target.result);

            // ✅ Reset the file input after 5 seconds
            setTimeout(() => {
                uploadInput.value = null;
            }, 3000);
        };
        reader.readAsDataURL(file);
    });


});





// vx80midQi9HfNqQsvBnq