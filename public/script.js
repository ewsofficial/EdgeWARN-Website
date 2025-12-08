document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lightning-container');

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function createFlash() {
        const flash = document.createElement('div');
        flash.classList.add('lightning-flash');

        // Random position - cover full width and height
        const x = random(0, 100);
        const y = random(10, 90); // Allow to go lower

        // Random size - make them potentially huge
        const size = random(600, 1500); // Increased size

        flash.style.left = `${x}%`;
        flash.style.top = `${y}%`;
        flash.style.width = `${size}px`;
        flash.style.height = `${size}px`;

        container.appendChild(flash);

        // Animate - slower and brighter
        const duration = random(300, 800); // Slower (300-800ms)
        flash.animate([
            { opacity: 0 },
            { opacity: random(0.6, 1.0), offset: 0.2 }, // Brighter peak
            { opacity: random(0.2, 0.4), offset: 0.4 }, // Dim
            { opacity: random(0.5, 0.9), offset: 0.6 }, // Bright again
            { opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        }).onfinish = () => {
            flash.remove();
        };

        // Sometimes create a bolt
        if (Math.random() > 0.5) {
            createBolt(x, y);
        }
    }

    function createBolt(xPercent, yPercent) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.classList.add("lightning-bolt");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");

        // Bolts should look like they strike down
        let curX = xPercent;
        let curY = yPercent < 20 ? yPercent : random(0, 30); // Start higher up usually

        let pathData = `M ${curX} ${curY}`;

        // Make it reach close to the bottom
        const targetY = random(80, 100);

        const segments = Math.floor(random(6, 12));
        const yStep = (targetY - curY) / segments;

        for (let i = 0; i < segments; i++) {
            curX += random(-5, 5); // Jaggedness
            curY += yStep;
            pathData += ` L ${curX} ${curY}`;
        }

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", pathData);
        path.setAttribute("stroke", "rgba(255, 255, 255, 0.9)");
        path.setAttribute("stroke-width", "0.4");
        path.setAttribute("fill", "none");

        svg.appendChild(path);
        container.appendChild(svg);

        svg.animate([
            { opacity: 0 },
            { opacity: 1, offset: 0.1 },
            { opacity: 0 }
        ], {
            duration: random(300, 600), // Slower bolt too
            easing: 'linear'
        }).onfinish = () => svg.remove();
    }

    function scheduleNext() {
        const delay = random(1000, 5000); // Slightly slower cadence
        setTimeout(() => {
            createFlash();
            scheduleNext();
        }, delay);
    }

    scheduleNext();
});
