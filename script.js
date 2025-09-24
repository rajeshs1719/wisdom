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



document.addEventListener('DOMContentLoaded', () => {
    const lidContainer = document.getElementById('lid-container');
    const lid = document.getElementById('lid');
    const binModel = document.getElementById('bin-model');

    const buttons = {
        wet: document.getElementById('wet-btn'),
        dry: document.getElementById('dry-btn'),
        combined: document.getElementById('combined-btn'),
        reset: document.getElementById('reset-btn')
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

    const rotationMap = {
        wet: -45,
        dry: 0,
        combined: 45
    };

    const particleLeftMap = {
        wet: '65%',
        dry: '30%',
        combined: '83%'
    };

    Object.keys(fills).forEach(type => {
        buttons[type].addEventListener('click', () => handleTrashDrop(type));
    });
    buttons.reset.addEventListener('click', resetBin);

    let animating = false;

    function handleTrashDrop(type) {
        if (animating || fills[type].value >= 100) return;
        animating = true;
        toggleButtons(true);

        const tl = gsap.timeline({
            onComplete: () => {
                animating = false;
                toggleButtons(false);
            }
        });

        tl.to(lidContainer, { rotationY: rotationMap[type], duration: 0.55, ease: "power2.out" });
        tl.to(lid, { rotationX: 110, duration: 0.40, ease: "power2.inOut" }, ">");
        tl.call(() => {
            dropTrashParticle(type);
            updateFill(type);

            // ✅ Push command to Firebase
            let commandValue = type === "wet" ? 1 : type === "dry" ? 2 : 3;
            sendCommandToFirebase(commandValue);
        }, null, "+=0.18");
        tl.to(lid, { rotationX: 0, duration: 0.38, ease: "power1.in" }, "+=0.32");
        tl.to(lidContainer, { rotationY: 0, duration: 0.5, ease: "power2.inOut" }, "-=0.21");
    }

    // Helper function to push command
    function sendCommandToFirebase(value) {
        if (!window.db) {
            console.error("Firebase not initialized!");
            return;
        }

        const commandRef = window.dbRef(window.db, "servo/command");

        toggleButtons(true);

        window.dbSet(commandRef, value)
            .then(() => {
                console.log("Command sent:", value);

                // ⏳ Reset to 0 after 3 seconds
                setTimeout(() => {
                    window.dbSet(commandRef, 0)
                        .then(() => {
                            console.log("Command reset to 0");
                            // Re-enable buttons after reset
                            toggleButtons(false);
                        })
                        .catch(err => {
                            console.error("Error resetting command:", err);
                            // Still re-enable buttons in case of error
                            toggleButtons(false);
                        });
                }, 3000);
            })
            .catch(err => {
                console.error("Error sending command:", err);
                // Re-enable buttons if sending fails
                toggleButtons(false);
            });
    }


    function dropTrashParticle(type) {
        const particle = document.createElement('div');
        particle.className = 'trash-particle ' + type;

        // Get target compartment element
        const compElement = document.getElementById(`${type}-comp`);
        const compRect = compElement.getBoundingClientRect();
        const binRect = binModel.getBoundingClientRect();

        // Calculate horizontal offset relative to bin container
        const leftOffset = compRect.left - binRect.left + compRect.width / 2 - 9; // 9 is half particle width (18/2)

        particle.style.position = 'absolute';
        particle.style.top = '10px';
        particle.style.left = `${leftOffset}px`; // dynamically positioned inside compartment
        particle.style.width = '18px';
        particle.style.height = '18px';
        particle.style.borderRadius = '50%';
        particle.style.background =
            type === 'wet' ? 'var(--wet-color)' :
                type === 'dry' ? 'var(--dry-color)' :
                    'var(--combined-color)';
        particle.style.willChange = 'transform, opacity';
        binModel.appendChild(particle);

        gsap.to(particle, {
            y: 100,
            scale: 0.5,
            opacity: 0.2,
            duration: 0.68,
            ease: "bounce.out",
            onComplete: () => particle.remove()
        });
    }


    function updateFill(type) {
        const comp = fills[type];
        if (comp.value < 100) {
            comp.value += 10;
            comp.element.style.setProperty('--fill-level', `${comp.value}%`);
            comp.percentageEl.textContent = `${comp.value}%`;
            if (comp.value >= 100) buttons[type].disabled = true;
        }
    }

    function resetBin() {
        Object.keys(fills).forEach(type => {
            fills[type].value = 0;
            fills[type].element.style.setProperty('--fill-level', '0%');
            fills[type].percentageEl.textContent = '0%';
            buttons[type].disabled = false;
        });
    }

    function toggleButtons(state) {
        Object.keys(fills).forEach(type => {
            buttons[type].disabled = state || fills[type].value >= 100;
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const cameraToggleBtn = document.getElementById("camera-toggle");
        const captureBtn = document.getElementById("capture-btn");
        const videoEl = document.getElementById("camera");
        const canvasEl = document.getElementById("snapshot");
        const uploadInput = document.getElementById("upload-input");

        let stream = null;

        // ✅ Unified function to process image
        async function processImage(base64Image) {
            try {
                const res = await fetch(
                    "https://serverless.roboflow.com/dry-and-wet-waste-sl1a5/1?api_key=vx80midQi9HfNqQsvBnq",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: `image=${base64Image}` // raw base64, no encodeURIComponent
                    }
                );

                const data = await res.json();
                console.log("Roboflow response:", data);

                const predictedClass = data.predictions?.[0]?.class || "combined";
                handleTrashDrop(predictedClass.toLowerCase());
            } catch (err) {
                console.error("Prediction error:", err);
            }
        }

        // Camera toggle
        cameraToggleBtn.addEventListener("click", async () => {
            if (!stream) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    videoEl.srcObject = stream;
                    captureBtn.disabled = false;
                    cameraToggleBtn.textContent = "Close Camera";
                } catch (err) {
                    console.error("Camera error:", err);
                    alert("Could not access camera.");
                }
            } else {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                videoEl.srcObject = null;
                captureBtn.disabled = true;
                cameraToggleBtn.textContent = "Open Camera";
            }
        });

        // Capture from camera
        captureBtn.addEventListener("click", () => {
            const ctx = canvasEl.getContext("2d");
            ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

            const dataUrl = canvasEl.toDataURL("image/jpeg");
            const base64Image = dataUrl.split(",")[1]; // strip prefix
            processImage(base64Image);
        });

        // Upload from gallery
        document.getElementById("upload-input").addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function (event) {
                const dataUrl = event.target.result;
                // Strip the prefix (data:image/...;base64,)
                const base64Image = dataUrl.split(",")[1];

                try {
                    const res = await fetch(
                        "https://serverless.roboflow.com/dry-and-wet-waste-sl1a5/1?api_key=vx80midQi9HfNqQsvBnq",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: `image=${base64Image}` // send raw base64, do NOT encodeURIComponent
                        }
                    );
                    const data = await res.json();
                    console.log("Roboflow response:", data);

                    const predictedClass = data.predictions?.[0]?.class || "combined";
                    handleTrashDrop(predictedClass.toLowerCase());
                } catch (err) {
                    console.error("Prediction error:", err);
                }
            };

            reader.readAsDataURL(file);
        });


    });

});