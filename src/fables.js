// import './rolodex.css';

class Rolodex {
    constructor(containerId) {
        this.viewport = document.getElementById(containerId);
        if (!this.viewport) return;

        this.cylinder = document.createElement('div');
        this.cylinder.className = 'rolodex-cylinder';
        this.viewport.appendChild(this.cylinder);

        this.items = [];
        this.itemHeight = 60; // Distance between items in pixels (arc length approx)
        this.radius = 400; // Cylinder radius
        this.currentAngle = 0;
        this.targetAngle = 0;
        this.isDragging = false;
        this.startY = 0;
        this.startAngle = 0;

        // Configuration
        this.itemCount = 60;
        this.realLinks = [
            { title: "The Tortoise and the Hare", url: "fables/title1.html" },
            { title: "The Boy Who Cried Wolf", url: "fables/title2.html" },
            { title: "The Fox and the Grapes", url: "fables/title3.html" }
        ];

        this.init();
    }

    init() {
        this.generateItems();
        this.setupEvents();
        this.animate();
    }

    generateItems() {
        // Calculate the angle each item takes up
        // Circumference ~= itemHeight * totalItems? 
        // Or we pick a radius and see how many fit?
        // Let's stick with fixed radius and calculate step angle.
        // Arc length s = r * theta (in radians)
        // theta = s / r
        const thetaRad = this.itemHeight / this.radius;
        const thetaDeg = thetaRad * (180 / Math.PI);
        this.stepAngle = thetaDeg;

        for (let i = 0; i < this.itemCount; i++) {
            const item = document.createElement('a');
            item.className = 'rolodex-item';

            // Determine content
            let title = `Placeholder Fable #${i + 1}`;
            let url = '#';

            if (i < this.realLinks.length) {
                title = this.realLinks[i].title;
                url = this.realLinks[i].url;
            }

            item.href = url;
            item.innerHTML = `<span class="index">FL-${String(i + 1).padStart(3, '0')}</span><span class="title">${title}</span>`;

            // Position
            const angle = -i * this.stepAngle; // Negative so index 0 is at 0, 1 is below
            item.style.transform = `rotateX(${angle}deg) translateZ(${this.radius}px)`;

            // Click handling for placeholders
            item.addEventListener('click', (e) => {
                if (url === '#') {
                    e.preventDefault();
                    console.log(`Clicked placeholder ${i}`);
                }
            });

            this.cylinder.appendChild(item);
            this.items.push({ element: item, angle: angle });
        }
    }

    setupEvents() {
        // Scroll wheel
        // Scroll bounds
        // Angle 0 corresponds to item 0.
        // Item N is at angle -N * stepAngle.
        // To view item N, cylinder must rotate +N * stepAngle.
        // So max positive rotation is (itemCount - 1) * stepAngle.
        // Min rotation is 0 (or slightly negative for elasticity).
        this.maxScroll = (this.itemCount - 1) * this.stepAngle;
        this.minScroll = 0;

        // Scroll wheel
        this.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY;
            // Scroll down (positive delta) -> cylinder rotates UP (positive angle adds)
            // Wait, if item 0 is at 0, item 1 is at -step.
            // To see item 1, we need to rotate cylinder by +step.
            this.targetAngle += delta * 0.1;

            // Clamp
            this.targetAngle = Math.max(this.minScroll, Math.min(this.targetAngle, this.maxScroll));

        }, { passive: false });

        // Touch/Drag (optional but good for feel)
        this.viewport.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startY = e.clientY;
            this.startAngle = this.targetAngle;
            this.cylinder.style.transition = 'none'; // Disable smoothing during drag
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const deltaY = e.clientY - this.startY;
            // Drag down -> Move up checklist -> Rotate cylinder "down" (negative)?
            // Drag down usually means pulling content down.
            // If dragging down, we want to see items ABOVE.
            // Items above constitute negative index?
            // Let's just try deltaY * conversion
            this.targetAngle = this.startAngle - (deltaY * 0.5);

            // Clamp during drag
            this.targetAngle = Math.max(this.minScroll, Math.min(this.targetAngle, this.maxScroll));
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.cylinder.style.transition = 'transform 0.1s ease-out';
                // Snap to nearest item
                const remainder = this.targetAngle % this.stepAngle;
                if (Math.abs(remainder) > this.stepAngle / 2) {
                    // Snap to next
                    this.targetAngle += (this.stepAngle * Math.sign(remainder)) - remainder;
                } else {
                    this.targetAngle -= remainder;
                }

                // Final clamp to ensure snap doesn't push slightly out
                this.targetAngle = Math.max(this.minScroll, Math.min(this.targetAngle, this.maxScroll));
            }
        });
    }

    animate() {
        // Smooth interpolation
        if (!this.isDragging) {
            // Simple lerp? Or just let CSS transition handle it if we update style periodically?
            // Actually, for wheel we want smooth. For drag we want 1:1.
            // Let's update `currentAngle` towards `targetAngle`
            const diff = this.targetAngle - this.currentAngle;
            if (Math.abs(diff) > 0.01) {
                this.currentAngle += diff * 0.1;
            } else {
                this.currentAngle = this.targetAngle;
            }
        } else {
            this.currentAngle = this.targetAngle;
        }

        this.cylinder.style.transform = `rotateX(${this.currentAngle}deg)`;

        // Visibility culling to prevent wrap-around overlap artifacts
        this.items.forEach(item => {
            // item.angle is negative (e.g. -10, -20)
            // currentAngle is positive when scrolling down (e.g. 10, 20)
            // Normalized angle relative to view center
            const relativeAngle = item.angle + this.currentAngle;

            // If item is within visible range (e.g., +/- 100 degrees from center)
            // 90 degrees is the theoretical limit (perpindicular), give a bit of buffer or tighter cut
            const isVisible = Math.abs(relativeAngle) < 90;

            if (isVisible) {
                item.element.style.display = 'flex';
                // detailed culling: adjust opacity based on distance?
                // const opacity = 1 - (Math.abs(relativeAngle) / 90);
                // item.element.style.opacity = opacity;
            } else {
                item.element.style.display = 'none';
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    new Rolodex('rolodex-container');
});
